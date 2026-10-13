---
name: principle-foundational-thinking
description: "WHEN choosing core state, contracts or ownership before a capability; NOT for speculative infrastructure or abstraction of similar lines; sequences the foundations the current work needs."
---

# Foundational thinking

Choose data and ownership so the required behavior becomes straightforward.

1. Define essential domain state, identity, lifetime and invariants. Trace actual access and update paths before choosing types or data structures.
2. Identify who owns each decision and mutation. For concurrent actors, ask what another actor can invalidate. Isolate independent state; where an invariant is shared, preserve its atomicity with explicit coordination.
3. Reuse working infrastructure. Add a foundation first only when the current subsequent work depends on it or materially benefits. Future adapters, generic buses and replacement test runners need a present requirement.
4. Consolidate shared domain structure and contracts before abstracting similar lines. Explicit small repetition can be clearer than a premature helper. Remove proven dead code within scope before adding replacement machinery.
5. Deliver coherent increments with behavior and edge-case checks. Keep new coordination at its owner rather than scattering special cases across callers.

Done: the required paths have suitable state, contracts and ownership, and the next increment can be verified without speculative scaffolding. Structural choices preserve useful options; code-level choices preserve simplicity.
