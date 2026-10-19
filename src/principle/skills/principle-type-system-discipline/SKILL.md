---
name: principle-type-system-discipline
description: "WHEN types permit invalid states or semantic mix-ups; NOT maximal type precision or runtime validation of untrusted input; make the compiler enforce useful domain distinctions."
---

# Type System Discipline

Make the compiler enforce the domain distinctions that prevent real errors.

Model alternatives as variants with required payloads, not contradictory flags and optional fields. Use exhaustive matching so new variants create compiler obligations.

Separate semantic primitives where confusion causes errors, such as UserId and InvoiceId at a risky API. Validate their construction. Strengthen types where a function is otherwise partial: head needs a non-empty sequence; sum remains total on ordinary sequences, including empty ones. Avoid wrappers that protect no meaningful invariant.

Derive types from the authoritative schema where one exists. Narrow, validate or refine the model instead of casting uncertainty away. Check rejected invalid inputs, intended runtime behaviour and compile-time rejection of wrong combinations. Static types do not substitute for runtime boundary validation.

Distinct from: `principle-parse-at-the-boundary` (untrusted or persisted data enters, or state is used after suspension), `principle-model-the-domain` (choosing legal states, transitions and ownership, with or without a type system).

Done: matching on variants is exhaustive; semantic types are distinct where confusion costs; partial functions get stronger inputs; no cast hides uncertainty.
