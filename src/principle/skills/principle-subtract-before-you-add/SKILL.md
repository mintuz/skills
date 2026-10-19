---
name: principle-subtract-before-you-add
description: "WHEN about to add a mechanism, owner, queue, validator or abstraction; NOT deletion by appearance or a hard-to-trace path with no addition planned; removes proven redundancy first and judges the whole system."
---

# Subtract Before You Add

Before adding a mechanism, owner or layer, remove proven redundancy and judge the whole system.

1. Identify the behaviour and guarantees the change must preserve. Before adding another owner, queue, validator or abstraction, check whether deletion, a direct change or an existing mechanism meets the requirement (`principle-reuse-before-building`).
2. Remove demonstrated dead paths, duplicated rules and content-free references within scope; repair their maintained callers and links. Sequence independent safe subtraction before construction. Keep removal coupled to replacement when separating them would break the contract. Avoid unrelated cleanup.
3. Two similar guards may protect different boundaries or mutations. Prove redundancy before deleting either; preserve failure behaviour and its tests. Prefer observed requirements over speculative layers and scaffolding.
4. Choose the smallest coherent change that meets the contract. More lines can be less work than a short patch that drops cancellation, errors or compatibility. Judge the complete system, including shifted complexity, rather than celebrating fewer local lines.
5. Verify the affected public behaviour and references after each coherent change. Stop when the accepted outcome is met on the simpler base.

Distinct from: `principle-reuse-before-building` (about to write a helper, owner, script or component: search for an existing option), `principle-minimize-reader-load` (an existing path is hard to trace, with no addition planned), `principle-foundational-thinking` (adding infrastructure or abstraction "for later").

Done: the addition is still needed after removal, and no complexity has merely moved.
