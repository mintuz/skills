# Model one journey

## Set the boundary

Create one route- or feature-owned actor for one mounted journey. Start it at mount and stop it at unmount. Let that actor own its child actors, commands, resources, retries, and convergence with external truth.

Split child actors by cohesive capability and lifetime, not by technical layer. Keep pure parsing, projection, and transformation as ordinary functions. Add shared wrappers only after repeated use proves a stable abstraction.

## Use typed factories and boundaries

Build each machine through a factory. Inject IDs, clocks, transports, persistence, and resource constructors. Use actor `input` for per-instance data. Do not import mutable globals into machine logic.

Define incoming events and outgoing commands as discriminated unions. Keep commands independent of transport encoding; adapt them at the injected port.

```ts
import { assign, setup } from "xstate";

type Input = { journeyId: string };
type Event = { type: "SUBMIT"; value: string } | { type: "CANCEL" };
type Command =
  | { type: "operation.start"; id: string; value: string; at: number }
  | { type: "operation.cancel"; id: string; at: number };

type Ports = {
  ids: { next: () => string };
  clock: { now: () => number };
  transport: { send: (command: Command) => void };
  persistence: { record: (command: Command) => void };
};

export const makeJourneyMachine = (ports: Ports) => {
  const emit = (command: Command) => {
    ports.persistence.record(command);
    ports.transport.send(command);
  };

  return setup({
    types: {
      context: {} as { journeyId: string; commandId: string | null },
      events: {} as Event,
      input: {} as Input,
    },
    actions: {
      start: assign(({ event }) => {
        if (event.type !== "SUBMIT") return {};
        const id = ports.ids.next();
        emit({ type: "operation.start", id, value: event.value, at: ports.clock.now() });
        return { commandId: id };
      }),
      cancel: ({ context }) => {
        if (context.commandId) {
          emit({ type: "operation.cancel", id: context.commandId, at: ports.clock.now() });
        }
      },
    },
  }).createMachine({
    context: ({ input }) => ({ journeyId: input.journeyId, commandId: null }),
    initial: "idle",
    states: {
      idle: { on: { SUBMIT: { target: "active", actions: "start" } } },
      active: { on: { CANCEL: { target: "cancelled", actions: "cancel" } } },
      cancelled: { type: "final" },
    },
  });
};
```

## Make lifecycle meaning structural

Represent mutually exclusive meanings as states such as `idle`, `active`, `retrying`, and `cancelled`. Store data in context only when it survives transitions or several states need it. Derive lifecycle status from `snapshot.matches(...)`, tags, selectors, or pure functions.

Use hierarchy when a parent state owns policy shared by child phases. Place each transition on the narrowest state that owns its meaning. Put a transition at the root only when it must apply in every state.

Use parallel regions only for concerns that progress independently under one owner. Join multipart readiness by making each region reach a final child; the parallel parent then completes through `onDone`.

```ts
import { setup } from "xstate";

type ReadyEvent = { type: "CHANNEL_READY" } | { type: "DATA_READY" };

export const readinessMachine = setup({
  types: { events: {} as ReadyEvent },
}).createMachine({
  initial: "preparing",
  states: {
    preparing: {
      type: "parallel",
      states: {
        channel: {
          initial: "pending",
          states: {
            pending: { on: { CHANNEL_READY: "ready" } },
            ready: { type: "final" },
          },
        },
        data: {
          initial: "pending",
          states: {
            pending: { on: { DATA_READY: "ready" } },
            ready: { type: "final" },
          },
        },
      },
      onDone: "ready",
    },
    ready: {},
  },
});
```

The chart owns this join. A React effect that watches two booleans creates a second lifecycle.
