---
name: principle-separate-before-serializing-shared-state
description: "WHEN concurrent writers share mutable state; NOT independent read-only data; separate ownership or enforce the shared invariant atomically."
---

# Separate Before Serializing Shared State

Separate independent writers first; serialise only where one shared invariant is real.

Identify each writer, mutable target and invariant, including retries and crashes. For each concurrent actor, ask what another actor can invalidate. Ask whether writers publish independent facts or maintain one canonical truth.

Separate independent facts into owned files, keys, branches or state objects, then combine at the read/report boundary. Different fields in one read-modify-write file still share a write target. Define how readers handle missing, stale or partial publications.

Keep truly atomic invariants together: splitting capacity and reservations across independent copies can oversell. Enforce shared ownership structurally with a transaction, compare-and-swap, exclusive writer or appropriate lock. Define contention, recovery and retry behaviour; instructions and PID-only claims are not concurrency control.

Distinct from: `principle-make-operations-idempotent` (an operation repeats or resumes after interruption), `principle-derive-from-one-owner` (the same fact is computed or stored twice), `principle-narrow-state-lifetime` (mutable state outlives the work that needs it).

Done: overlapping writes, interruption and retries were exercised, and both independent progress and preservation of the shared invariant hold before the race is called fixed.
