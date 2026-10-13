---
name: principle-redesign-from-first-principles
description: "WHEN a new requirement challenges an existing design; NOT authorization for a rewrite; derive a coherent design from outcomes and constraints."
---

# Redesign From First Principles

Read affected paths and identify the required outcome, invariants, supported consumers and operational constraints. Ask what design you would choose if the new requirement had always existed.

Compare that design with the current system. Choose the smallest coherent evolution that meets the outcome; clean-slate reasoning does not authorize clean-slate implementation. Preserve explicit analysis-only scope, compatibility, security and unrelated work.

Carry the accepted design through affected types, validation, consumers, examples and documentation. Avoid a local flag or special case that leaves conflicting assumptions elsewhere.

Deliver authorized changes in bounded, verifiable slices with migration and rollback where needed. For an exploratory question, present the design, tradeoffs and next reviewable step. Verify the changed behavior before claiming the redesign is delivered.
