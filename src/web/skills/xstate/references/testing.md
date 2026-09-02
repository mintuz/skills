# Test actors at their boundary

## Drive real actors

Create real actors from production factories. Inject fake IDs, clocks, transports, persistence, and resources. Send typed public events. Assert public states, emitted commands, external effects, and teardown instead of internal action names or child IDs.

```ts
import { createActor } from "xstate";
import { expect, it, vi } from "vitest";
import { makeJourneyMachine } from "./journey.machine";

it("emits one start command", () => {
  const send = vi.fn();
  const actor = createActor(
    makeJourneyMachine({
      ids: { next: () => "command-1" },
      clock: { now: () => 42 },
      transport: { send },
      persistence: { record: vi.fn() },
    }),
    { input: { journeyId: "journey-1" } },
  ).start();

  actor.send({ type: "SUBMIT", value: "value" });

  expect(send).toHaveBeenCalledOnce();
  expect(send).toHaveBeenCalledWith({
    type: "operation.start",
    id: "command-1",
    value: "value",
    at: 42,
  });
  expect(actor.getSnapshot().matches("active")).toBe(true);
});
```

## Cover negative space and time

For every temporal branch, test the accepted event and the event that must have no effect. Cover relevant cases:

- duplicate commands and observations;
- stale attempt, generation, command, and version identities;
- cancellation during active work and a retry delay;
- late results after cancellation or replacement;
- retry delay and exhaustion policy;
- resource startup only in its owning state;
- refusal, recovery, and invalid events;
- authoritative observation before and after transport acceptance;
- matching and nonmatching convergence.

Make each negative assertion decisive. Assert the state immediately after the event that must have no effect, before sending any later event that would reach the same state anyway. Use the production scheduling boundary with fake clocks or timers. After cancellation, advance time and prove no new attempt starts. If an intermediate snapshot would violate the contract, subscribe and prove that snapshot is never emitted.

## Prove teardown

Exercise both the owning transition and parent stop. Count `unsubscribe`, `close`, `abort`, or `release`; do not infer cleanup from final state.

```ts
import { createActor } from "xstate";
import { expect, it, vi } from "vitest";
import { makeResourceOwner } from "./resource.machine";

it("disposes once", () => {
  const unsubscribe = vi.fn();
  const close = vi.fn();
  const actor = createActor(
    makeResourceOwner(() => ({
      subscribe: () => unsubscribe,
      send: vi.fn(),
      close,
    })),
  ).start();

  actor.send({ type: "STOP" });
  actor.stop();

  expect(unsubscribe).toHaveBeenCalledOnce();
  expect(close).toHaveBeenCalledOnce();
});
```

## Test `sendParent` through a parent

An isolated child has no parent mailbox. Test it through the smallest parent that listens for the event.

```ts
import { createActor, sendParent, setup } from "xstate";
import { expect, it } from "vitest";

const child = setup({}).createMachine({
  entry: sendParent({ type: "CHILD.REPORTED" }),
});

const parent = setup({
  types: { events: {} as { type: "CHILD.REPORTED" } },
  actors: { child },
}).createMachine({
  initial: "listening",
  states: {
    listening: {
      invoke: { src: "child" },
      on: { "CHILD.REPORTED": "received" },
    },
    received: { type: "final" },
  },
});

it("receives the child event", () => {
  const actor = createActor(parent).start();
  expect(actor.getSnapshot().matches("received")).toBe(true);
});
```

Use `xstate/graph` model-based path coverage only when interacting regions or guarded paths justify it. Treat graph coverage as a supplement; it cannot prove port behaviour, external authority, or teardown.
