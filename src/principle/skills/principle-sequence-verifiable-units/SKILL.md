---
name: principle-sequence-verifiable-units
description: "WHEN ordering a migration or repeated changes; NOT base updates or mandatory commit choreography; make each dependent unit verifiable and reversible."
---

# Sequence Verifiable Units

Choose units around contracts, not file counts. A producer, consumer and fixture may need to move together. Bracket each unit: a checked starting point, one coherent change, the same decisive check after it, and rollback.

Run each unit's decisive check, and make it pass, before dependent work starts. When it fails, diagnose at that boundary and resolve the failure, or roll the unit back, before building on it. Finish with cross-unit integration checks against the final state.

Order review evidence to explain causality: baseline before treatment, failing case before correction, removal before reshape when safe. A failing test can live in isolated evidence; it need not become a broken shared commit. Preserve the requested delivery policy rather than imposing a universal stack shape.

Distinct from: `principle-update-the-base-deliberately` (starting from or syncing with a base), `principle-outcome-oriented-execution` (an approved multi-phase change converging on its end state).

Done: each unit's check ran and passed, or its failure was resolved, before dependent work began; integration was checked at the end.
