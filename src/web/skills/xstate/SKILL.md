---
name: xstate
description: WHEN designing, implementing, reviewing, testing, or visualising XState 5 actors and @xstate/react integrations with temporal complexity; NOT for simple local UI state; models typed lifecycles and renders legal Mermaid stateDiagram-v2 charts.
---

# XState

Treat a statechart as an executable ownership model for time, concurrency, and resource lifetimes.

For a visualization-only request, inspect the current machine source and go directly to step 6. Preserve the implementation unless the user also asks for a design or code change.

## 1. Establish the temporal boundary

Inspect the feature contract, installed XState versions, existing actors, and runtime integrations. Inventory the mounted journey, external authority, live resources, concurrent concerns, retry and cancellation policy, and every source of stale or duplicate work.

Use XState only where ordering, concurrency, retries, cancellation, stale results, or resource lifetimes make the behavior temporal. Keep isolated presentation, form-draft, and DOM state in the UI framework.

**Complete when:** every temporal responsibility has one named owner and every proposed actor owns at least one distinct lifecycle or resource.

## 2. Model the journey

Read [modelling.md](references/modelling.md) before creating or changing a machine. Apply it to the actor boundary, typed factory, event and command unions, lifecycle states, transition placement, hierarchy, parallel regions, and readiness joins.

**Complete when:** mutually exclusive meanings are states, independent concerns are parallel only when they have independent lifecycles, and each transition sits at the narrowest state that owns it.

## 3. Own effects and convergence

Read [lifecycles.md](references/lifecycles.md) whenever the feature invokes asynchronous work, owns a live handle, retries, cancels, accepts optimistic state, or waits for external authority. Keep handles inside invoked actors and fence work by identity.

**Complete when:** state exit or parent stop disposes every resource, stale and duplicate results are harmless, retry timers cancel with their lifecycle, and authoritative convergence—not an optimistic acknowledgement—confirms completion.

## 4. Integrate React narrowly

Read [react.md](references/react.md) for any `@xstate/react` surface. Let the route or feature boundary own `useActorRef`, expose typed actor refs to descendants, and subscribe through focused selectors.

**Complete when:** React holds only presentation/form/DOM state, actor-derived status and permissions have one pure derivation, and each component subscribes only to values it renders or uses.

## 5. Prove behavior through actors

Read [testing.md](references/testing.md) before writing or reviewing tests. Drive real actors with typed public events and fake ports; cover positive behavior, negative space, stale identities, retries, cancellation, convergence, and teardown.

**Complete when:** tests observe public actor behavior, exactly-once cleanup is demonstrated, `sendParent` behavior is exercised through a listening parent, and any model-based graph coverage is justified by chart complexity.

## 6. Render the statecharts

Read [diagramming.md](references/diagramming.md) whenever the user asks for a diagram. Also render or update the diagrams after designing or changing any state machine, even when visualization was not requested explicitly.

Return one legal Mermaid `stateDiagram-v2` block per `createMachine` chart. Keep invoked statechart actors in separate diagrams, annotate non-statechart actor ownership without inventing states, and disclose state-changing behavior that Mermaid cannot represent legally.

**Complete when:** every designed or changed machine has a source-grounded diagram, composite and concurrent boundaries are legal, parser-sensitive labels are safe, and render validation is reported accurately.

## Finish

Verify every applicable reference checklist, type-check examples against the project's installed XState and React adapters, run focused actor and UI tests, inspect the chart for unowned time or resources, and regenerate diagrams from the final machine definitions.

**Complete when:** the implementation, tests, and diagrams account for every temporal branch and resource lifetime without duplicating authoritative truth or presentation derivations.
