# Integrate React narrowly

## Let the route own the actor

Create one journey actor with `useActorRef` at the route or feature boundary. Build its machine from stable ports and pass a typed actor ref to descendants.

If the journey identity changes without an unmount, key an inner boundary by that identity or model the change as an event. Actor `input` is creation-time data. Do not let several widgets create peer journey actors.

Export typed actor refs, selectors, and child accessors as the feature surface. Copy child state into parent context only when the parent needs it to decide a transition.

## Select only what a component uses

Derive status and permissions from snapshots with pure selectors. Select a primitive or stable value. Split object selectors or give them a comparator.

Keep in React the values one event sets completely: drafts, focus, element measurements, and plain open or closed toggles. Send a typed event when local interaction becomes a temporal feature fact. Do not mirror actor state into React state.

A flag that a network response, a timer, or another actor sets belongs to the machine, even when the component renders it as a disabled control or a spinner. Select it; it is not presentation state.

```tsx
import { useMemo, useState } from "react";
import { useActorRef, useSelector } from "@xstate/react";
import type { ActorRefFrom, SnapshotFrom } from "xstate";
import { makeJourneyMachine } from "./journey.machine";

type Machine = ReturnType<typeof makeJourneyMachine>;
type Ports = Parameters<typeof makeJourneyMachine>[0];
type JourneyActor = ActorRefFrom<Machine>;
type JourneySnapshot = SnapshotFrom<Machine>;

const selectCanCancel = (snapshot: JourneySnapshot) =>
  snapshot.matches("active") && snapshot.context.commandId !== null;

function Controls({ actorRef }: { actorRef: JourneyActor }) {
  const canCancel = useSelector(actorRef, selectCanCancel);
  const [draft, setDraft] = useState("");

  return (
    <>
      <input value={draft} onChange={(event) => setDraft(event.currentTarget.value)} />
      <button onClick={() => actorRef.send({ type: "SUBMIT", value: draft })}>Start</button>
      <button disabled={!canCancel} onClick={() => actorRef.send({ type: "CANCEL" })}>
        Cancel
      </button>
    </>
  );
}

function JourneyBoundary({ journeyId, ports }: { journeyId: string; ports: Ports }) {
  const machine = useMemo(() => makeJourneyMachine(ports), [ports]);
  const actorRef = useActorRef(machine, { input: { journeyId } });
  return <Controls actorRef={actorRef} />;
}

export function JourneyRoute(props: { journeyId: string; ports: Ports }) {
  return <JourneyBoundary key={props.journeyId} {...props} />;
}
```

`useActorRef` owns the lifetime without subscribing the boundary to every snapshot. `useSelector` rerenders `Controls` only when `canCancel` changes.
