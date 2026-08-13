---
name: xstate
description: WHEN React state changes in response to an external answer — async submit, in-flight or loading flags, retries, cancellation, polling, optimistic updates, stale responses — or to an interaction with an interruptible middle, such as a drag or a gesture; or WHEN building, reviewing, testing, or visualising XState 5 actors and @xstate/react integrations; NOT for a value one event sets completely, such as a text draft, a focus flag, or a plain open and closed toggle; models typed lifecycles and renders legal Mermaid stateDiagram-v2 charts.
---

# XState

Treat a statechart as an executable ownership model for time, concurrency, and resource lifetimes.

## Recognise a hand-rolled statechart

Each of the following is a lifecycle already being modelled by hand:

- a `useState` flag for work in flight: `isSubmitting`, `isLoading`, `pending`;
- a `.then`, `.catch`, or `await` block that sets two or more pieces of state in sequence;
- a re-entry guard such as `if (submitting) return`;
- a line that clears an error or a stale result before a retry;
- a `useEffect` that starts asynchronous work and needs an ignore flag in its cleanup;
- two booleans that must never both be true, such as `isLoading` with `error`;
- a `setTimeout` or `setInterval` for retry, debounce, or polling that something must clear;
- a `pointerdown`, `dragstart`, or gesture handler that binds listeners to the document and must unbind them;
- handling for a response that arrives after cancel, replacement, or unmount.

Any one of them is the entry point to step 1, however small the request, and whether or not the file imports `xstate`.

For a visualisation-only request, inspect the current machine source and go to step 6 instead.

## 1. Establish the temporal boundary

Inventory the mounted journey, external authority, live resources, concurrent concerns, retry and cancellation policy, and every source of stale or duplicate work. Inspect existing actors and runtime integrations, and confirm the installed XState major version; the XState 4 and 5 APIs differ.

Use XState only where ordering, concurrency, retries, cancellation, stale results, or resource lifetimes make the behaviour temporal. Two tests find that lifetime; classify by what they show, not by what the state renders.

First, an external answer — a network response, a timer, another actor, the platform — makes state temporal whatever it looks like on screen. A disabled button or a spinner is the presentation of temporal state, not presentation state.

Second, direct user input creates a lifecycle whenever the interaction has an interruptible middle: a drag holds pointer capture, cancels on Escape, and must release on unmount; a panel that animates shut has a closing phase. State belongs to the UI framework only when both tests come back empty — one event sets the value completely, leaving no phase to interrupt and nothing to dispose.

**Complete when:** every temporal responsibility has one named owner, and every proposed actor owns at least one distinct lifecycle or resource.

## 2. Model the journey

Read [modelling.md](references/modelling.md) before creating or changing a machine. Apply it to the actor boundary, typed factory, event and command unions, lifecycle states, transition placement, hierarchy, parallel regions, and readiness joins.

Find which layer owns machines before you create the file: architecture tests, import-boundary rules such as `eslint-plugin-boundaries` or `dependency-cruiser`, `CLAUDE.md`, architecture decision records, and the directory holding existing machines. A correct machine in a forbidden directory fails CI.

**Complete when:** the machine sits in the layer the repository's own rules assign to machines, mutually exclusive meanings are states, independent concerns are parallel only when they have independent lifecycles, and each transition sits at the narrowest state that owns it.

## 3. Own effects and convergence

Read [lifecycles.md](references/lifecycles.md) whenever the feature invokes asynchronous work, owns a live handle, retries, cancels, accepts optimistic state, or waits for external authority. Keep handles inside invoked actors and fence work by identity.

**Complete when:** state exit or parent stop disposes every resource, stale and duplicate results are harmless, retry timers cancel with their lifecycle, and authoritative convergence—not an optimistic acknowledgement—confirms completion.

## 4. Integrate React narrowly

Read [react.md](references/react.md) for any `@xstate/react` surface. Let the route or feature boundary own `useActorRef`, expose typed actor refs to descendants, and subscribe through focused selectors.

Run both step 1 tests over every `useState` you write or keep, and state the verdict in your reply so the user can overrule it. Where they are decisive, act on the answer and report the call in one line: *"`isSubmitting` is set by the request, so it moved into the machine as `submitting`."* Where it is genuinely close — a real but small lifecycle, or a machine the repository's layer rules would push far from its component — put the choice to the user before you build: name the state, name the phase that makes it a lifecycle, and ask whether it belongs in the machine.

**Complete when:** every retained `useState` holds a value one event sets completely, no React state duplicates a fact an external answer owns, actor-derived status and permissions have one pure derivation, and each component subscribes only to values it renders or uses.

## 5. Prove behaviour through actors

Read [testing.md](references/testing.md) before writing or reviewing tests. Drive real actors with typed public events and fake ports; cover positive behaviour, negative space, stale identities, retries, cancellation, convergence, and teardown.

**Complete when:** tests observe public actor behaviour, exactly-once cleanup is demonstrated, `sendParent` behaviour is exercised through a listening parent, and any model-based graph coverage is justified by chart complexity.

## 6. Render the statecharts

Read [diagramming.md](references/diagramming.md) whenever the user asks for a diagram. Also render or update the diagrams after designing or changing any machine, even when the user did not ask for a diagram.

**Complete when:** every designed or changed machine has a source-grounded diagram, composite and concurrent boundaries are legal, parser-sensitive labels are safe, and render validation is reported accurately.

## Finish

Type-check the code against the project's installed XState and React adapters, run the actor and UI tests, and regenerate the diagrams from the final machine definitions.

**Complete when:** the implementation, tests, and diagrams account for every temporal branch and resource lifetime, without duplicating authoritative truth or presentation derivations.
