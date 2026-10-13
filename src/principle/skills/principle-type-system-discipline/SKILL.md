---
name: principle-type-system-discipline
description: "WHEN types permit invalid states or semantic mixups; NOT maximal type precision; make the compiler enforce useful domain distinctions."
---

# Type System Discipline

Model alternatives as variants with required payloads, not contradictory flags and optional fields. Use exhaustive matching so new variants create compiler obligations.

Separate semantic primitives where confusion causes errors, such as UserId and InvoiceId at a risky API. Validate their construction. Strengthen types where a function is otherwise partial: head needs a nonempty sequence; sum remains total on ordinary sequences, including empty ones. Avoid wrappers that protect no meaningful invariant.

Parse untrusted external and persisted values before treating them as domain values. Account for old schemas and mutation that can invalidate assumptions. Derive types from the authoritative schema where one exists.

Narrow, validate or refine the model instead of casting uncertainty away. Check rejected invalid inputs, intended runtime behavior and compile-time rejection of wrong combinations. Static types do not substitute for runtime boundary validation.
