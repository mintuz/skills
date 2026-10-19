---
name: principle-minimize-reader-load
description: "WHEN an existing path is hard to trace through layers or mutable context and no addition is planned; NOT line-count reduction or sequencing removal before an addition; simplifies the complete reasoning path."
---

# Minimize Reader Load

Trace a concrete question through the complete path: where does the value come from, and what can change it? Count indirections and the mutable context a reader must retain.

Collapse pass-through layers when inlining preserves behavior and reduces total reasoning. Caller or implementation count alone does not decide: a small boundary may own authorization, idempotency, privacy, errors or resource lifetime. Preserve that ownership or relocate it explicitly. Prefer interfaces that hide meaningful decisions.

Compare the before/after trace and state ownership. Exercise affected behavior, especially overlapping requests and failure paths. Shorter files and arbitrary reading-time targets are not evidence of lower reader load.

Removing a forwarding layer can also satisfy `principle-subtract-before-you-add`; this principle's objective is reader effort, not removal sequencing.

Distinct from: `principle-subtract-before-you-add` (about to add a mechanism, owner or layer), `principle-narrow-state-lifetime` (mutable state outlives the work that needs it), `principle-derive-from-one-owner` (the same fact or decision is computed or stored twice).

Done: the before/after trace is shorter, and each remaining layer owns a decision.
