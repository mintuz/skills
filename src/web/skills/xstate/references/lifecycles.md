# Own resources and time

## Keep live handles private

Keep WebSocket, EventSource, media, CRDT, DOM, SDK, credential, subscription, and similar handles inside an invoked actor. Put serialisable facts in context. Send typed control events to the actor when the handle must do work.

Use `fromCallback` for subscription-shaped resources. Acquire, use, and release the handle in one closure, so one owner controls its whole lifetime. When another layer must acquire it — a DOM event handler that must call `setPointerCapture` synchronously, for example — pass the handle into the actor and let the actor own the release. Return one disposer. XState runs that disposer once when the actor stops, so add a run-once flag only when another path can release the same resource; the example below has no second path, so it returns a plain disposer.

```ts
import { fromCallback, setup } from "xstate";

type Control = { type: "RESOURCE.SEND"; value: string };
type OwnerEvent = { type: "RESOURCE.VALUE"; generation: number; value: string } | { type: "STOP" };
type Handle = {
  subscribe: (listener: (value: string) => void) => () => void;
  send: (value: string) => void;
  close: () => void;
};

export const makeResourceOwner = (open: () => Handle) => {
  const resource = fromCallback<Control, { generation: number }>(({ input, receive, sendBack }) => {
    const handle = open();
    const unsubscribe = handle.subscribe((value) =>
      sendBack({ type: "RESOURCE.VALUE", generation: input.generation, value }),
    );
    receive((event) => handle.send(event.value));

    return () => {
      unsubscribe();
      handle.close();
    };
  });

  return setup({
    types: {
      context: {} as { generation: number },
      events: {} as OwnerEvent,
    },
    actors: { resource },
    guards: {
      isCurrent: ({ context, event }) =>
        event.type === "RESOURCE.VALUE" && event.generation === context.generation,
    },
  }).createMachine({
    context: { generation: 1 },
    initial: "connected",
    states: {
      connected: {
        invoke: {
          src: "resource",
          input: ({ context }) => ({ generation: context.generation }),
        },
        on: {
          "RESOURCE.VALUE": { guard: "isCurrent" },
          STOP: "disconnected",
        },
      },
      disconnected: { type: "final" },
    },
  });
};
```

State entry starts the resource. State exit or parent stop runs the disposer. If safe release needs an acknowledgement, add a `leaving` state that sends a close command and waits for the acknowledgement before exiting. Keep the disposer as the stop-path backstop.

## Fence attempts and own retry policy

Give each asynchronous unit an attempt, generation, command, or version identity. Choose an identity that no replaced attempt can share, such as a monotonic generation counter. Add the values that scope the work, such as a subscribed symbol, when the identity alone cannot tell two attempts apart. Pass every part of the identity into the invoked actor and echo every part in its results. Accept a result only when every part still matches current context. Reset attempt-scoped evidence when a replacement attempt starts.

Use actor cancellation and identity fencing together, and know what each one does. Stopping an actor makes XState ignore that actor's own outcome, so a replaced `fromPromise` invocation cannot update the machine. Stopping does not retract an event the actor already handed to the parent: a `sendBack` that runs while the parent is mid-transition, or that runs from the actor's own cleanup, is already enqueued and reaches the parent after the replacement. Stopping does not stop the work either: a port that takes no abort signal runs to completion, and its side effects still land. Fence by identity wherever a result can still reach the machine — through the mailbox, a long-lived callback actor, a shared subscription, a cache, or a replayed stream. Say which mechanism makes each late result harmless.

Keep retry count, backoff, delayed transition, and cancellation in the lifecycle that decides whether to retry. Inject the delay policy. Leaving a state cancels its `after` transition; stopping a promise actor aborts its signal.

```ts
import { assign, fromPromise, setup } from "xstate";

type Event = { type: "START" } | { type: "CANCEL" };
type Ports = {
  nextAttemptId: () => string;
  retryDelayMs: (attempt: number) => number;
  run: (signal: AbortSignal) => Promise<string>;
};

export const makeAttemptMachine = (ports: Ports) => {
  const runAttempt = fromPromise<{ attemptId: string }, { attemptId: string }>(
    async ({ input, signal }) => {
      await ports.run(signal);
      return { attemptId: input.attemptId };
    },
  );

  return setup({
    types: {
      context: {} as { attempt: number; attemptId: string | null },
      events: {} as Event,
    },
    actors: { runAttempt },
    delays: { retry: ({ context }) => ports.retryDelayMs(context.attempt) },
    actions: {
      begin: assign({
        attempt: ({ context }) => context.attempt + 1,
        attemptId: () => ports.nextAttemptId(),
      }),
    },
  }).createMachine({
    id: "attempt",
    context: { attempt: 0, attemptId: null },
    initial: "idle",
    states: {
      idle: { on: { START: { target: "trying", actions: "begin" } } },
      trying: {
        initial: "running",
        on: { CANCEL: "#attempt.cancelled" },
        states: {
          running: {
            invoke: {
              src: "runAttempt",
              input: ({ context }) => ({ attemptId: context.attemptId! }),
              onDone: {
                guard: ({ context, event }) => event.output.attemptId === context.attemptId,
                target: "#attempt.succeeded",
              },
              onError: "retrying",
            },
          },
          retrying: {
            after: { retry: { target: "running", actions: "begin" } },
          },
        },
      },
      succeeded: { type: "final" },
      cancelled: { type: "final" },
    },
  });
};
```

## Confirm authoritative convergence

Keep transport acceptance, optimistic or replicated state, and authoritative truth separate. Acceptance means the command entered processing. Only a matching authoritative observation at or beyond the accepted version confirms completion.

Store both facts because either can arrive first. Recheck convergence after each event. Derive presentation status from the lifecycle instead of copying it into context.

```ts
type Convergence = {
  commandId: string;
  acceptedVersion: number | null;
  observedVersion: number | null;
};

export const hasConverged = (value: Convergence) =>
  value.acceptedVersion !== null &&
  value.observedVersion !== null &&
  value.observedVersion >= value.acceptedVersion;

export const acceptsObservation = (
  value: Convergence,
  event: { commandId: string; version: number },
) =>
  event.commandId === value.commandId &&
  (value.observedVersion === null || event.version > value.observedVersion);
```

Use these conditions in guarded transitions after either acceptance or observation updates context. Fence attempt evidence by identity and by version: only the current attempt's acceptance and its matching observation may complete or clear that attempt, and that observation counts only when its version advances the version already recorded for that attempt, as `acceptsObservation` shows.

Keep authoritative truth outside that fence. Apply to the document any observation that advances the newest document version already applied, whatever command produced it, and never let such an observation complete or discard the current attempt. A replayed observation that does not advance the recorded version changes nothing.
