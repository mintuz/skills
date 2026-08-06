# Own resources and time

## Keep live handles private

Keep WebSocket, EventSource, media, CRDT, DOM, SDK, credential, subscription, and similar handles inside an invoked actor. Put serialisable facts in context. Send typed control events to the actor when the handle must do work.

Use `fromCallback` for subscription-shaped resources. Open, use, and close the handle in one closure. Return one idempotent disposer.

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

    let disposed = false;
    return () => {
      if (disposed) return;
      disposed = true;
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

Give each asynchronous unit an attempt, generation, command, or version identity. Pass the identity into the invoked actor and echo it in results. Accept only the identity held by current context.

Use actor cancellation and identity fencing together. Cancellation stops cooperative work. Fencing rejects buffered, replicated, or late results.

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

Use these conditions in guarded transitions after either acceptance or observation updates context. Ignore nonmatching command identities and non-increasing versions.
