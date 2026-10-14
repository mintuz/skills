---
name: principle-test-behavior-not-implementation
description: "WHEN writing or reviewing tests and their oracles; NOT private-call choreography; assert observable contracts and meaningful failure sensitivity."
---

# Test Behavior Not Implementation

Call the subject through the interface its users use. Assert concrete results or external effects with an independent oracle: literal payloads, persisted values, recipients, counts and relevant ordering.

Ask which plausible wrong implementation would still pass. Replace tautologies, assertions on fixture-only data and helper-call choreography with checks that fail on those regressions. A mock is useful at an external boundary when its payload and effect are the contract.

Empty, undefined and absent effects can be correct outcomes. Keep those checks, and add discriminating inputs: found versus missing, authorized versus unauthorized, accepted versus declined. A stored unauthorized record is stronger evidence than an empty fixture alone. Positive counterparts defeat unconditional-empty mutants.

Keep meaningful schema relations and compile-time tests. Evaluate an assertion by the contract it protects, not a blacklist of assertion methods.
