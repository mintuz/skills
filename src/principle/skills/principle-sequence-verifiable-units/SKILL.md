---
name: principle-sequence-verifiable-units
description: "WHEN ordering a migration or repeated changes; NOT mandatory commit choreography; make each dependent unit verifiable and reversible."
---

# Sequence Verifiable Units

Inspect the actual baseline and unrelated work first. Preserve dirty or shared state; use an isolated checkout when needed. Updating the base is a deliberate scoped action, not an automatic rebase, stash or reset.

Choose units around contracts, not file counts. A producer, consumer and fixture may need to move together. Give each unit a known starting point, one coherent change, decisive check and rollback.

Run the check before advancing dependent work. Diagnose failures at that boundary. Finish with cross-unit integration checks against the final state.

Order review evidence to explain causality: baseline before treatment, failing case before correction, removal before reshape when safe. A failing test can live in isolated evidence; it need not become a broken shared commit. Preserve the requested delivery policy rather than imposing a universal stack shape.
