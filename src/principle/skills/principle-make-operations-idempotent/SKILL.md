---
name: principle-make-operations-idempotent
description: "WHEN commands or lifecycle operations can repeat or resume after interruption; NOT for assuming local process IDs prove distributed ownership; reconciles partial state to the intended outcome."
---

# Make operations idempotent

Design retries to converge on the intended state, including when the previous outcome is unknown.

1. Define stable operation identity, desired state and the invariant that must remain atomic. Inventory durable effects and possible interruption points.
2. Inspect current state before acting. Reuse or adopt valid existing output; reconcile incomplete work using content and durable identity rather than creation order. Clean only artifacts whose ownership and staleness are established.
3. Protect external effects with an appropriate idempotency key, transaction or durable completion record. When an effect may have succeeded before a crash, query or reconcile its outcome before retrying; local flags alone cannot guarantee an external effect happened once.
4. Match coordination to the environment. A PID may help on one host but can be reused or belong to another host. Shared state may require owner identity, a lease, fencing or transactional coordination; retain atomic business invariants.
5. Test consecutive repeats and crashes at each meaningful durable transition, including an active concurrent owner and unknown external outcomes. Ensure failed work can resume with current inputs without duplicating completed effects.

Distinct from: `principle-separate-before-serializing-shared-state` (concurrent writers share mutable state), `principle-clean-up-what-you-started` (teardown releases resources this run created).

Done: rerunning from supported partial states produces the same correct observable outcome, and recovery neither steals live work nor destroys unrelated data.
