---
name: principle-separate-before-serializing-shared-state
description: "WHEN concurrent writers share mutable state; NOT independent read-only data; separate ownership or enforce the shared invariant atomically."
---

# Separate Before Serializing Shared State

Identify each writer, mutable target and invariant, including retries and crashes. Ask whether writers publish independent facts or maintain one canonical truth.

Separate independent facts into owned files, keys, branches or state objects, then combine at the read/report boundary. Different fields in one read-modify-write file still share a write target. Define how readers handle missing, stale or partial publications.

Keep truly atomic invariants together: splitting capacity and reservations across independent copies can oversell. Enforce shared ownership structurally with a transaction, compare-and-swap, exclusive writer or appropriate lock. Define contention, recovery and retry behavior; instructions and PID-only claims are not concurrency control.

Exercise overlapping writes, interruption and retries. Confirm both independent progress and preservation of the shared invariant before calling the race fixed.
