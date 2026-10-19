---
name: principle-foundational-thinking
description: "WHEN adding infrastructure, abstraction or core state and contracts before a capability, especially \"for later\"; NOT reusing existing tools or coordinating concurrent writers; builds only the foundations the current work uses."
---

# Foundational thinking

Build a foundation first only when the current work depends on it. Choose data and ownership so the required behavior becomes straightforward.

1. Define essential domain state, identity, lifetime and invariants, and who owns each decision and mutation. Trace actual access and update paths before choosing types or data structures.
2. Add a foundation first only when later work in the current task depends on it or materially benefits. Future adapters, generic buses and replacement test runners need a present requirement.
3. Consolidate shared domain structure and contracts before abstracting similar lines. Explicit small repetition can be clearer than a premature helper. Remove proven dead code within scope before adding replacement machinery.
4. Deliver coherent increments with behavior and edge-case checks. Keep new coordination at its owner rather than scattering special cases across callers.

Distinct from: `principle-reuse-before-building` (about to write a helper, owner, script or component), `principle-separate-before-serializing-shared-state` (concurrent writers share mutable state), `principle-subtract-before-you-add` (about to add a mechanism, owner or layer).

Done: a present requirement uses each foundation; the required paths have suitable state, contracts and ownership, and the next increment can be verified without speculative scaffolding. Structural choices preserve useful options; code-level choices preserve simplicity.
