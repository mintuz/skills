---
name: principle-minimize-reader-load
description: "WHEN code is hard to trace through layers or mutable state; NOT line-count reduction; simplify the complete reasoning path."
---

# Minimize Reader Load

Trace a concrete question through the complete path: where does the value come from, and what can change it? Count indirections and the mutable context a reader must retain.

Collapse pass-through layers when inlining preserves behavior and reduces total reasoning. Caller or implementation count alone does not decide: a small boundary may own authorization, idempotency, privacy, errors or resource lifetime. Preserve that ownership or relocate it explicitly.

Prefer interfaces that hide meaningful decisions. Put each invariant at its owning boundary. Shrink mutable state toward request-owned values and explicit inputs; derive values rather than synchronizing copies. Preserve shared resources under explicit owners.

Compare the before/after trace and state ownership. Exercise affected behavior, especially overlapping requests and failure paths. Shorter files and arbitrary reading-time targets are not evidence of lower reader load.
