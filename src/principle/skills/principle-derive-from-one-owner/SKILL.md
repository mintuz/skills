---
name: principle-derive-from-one-owner
description: "WHEN the same fact or decision is computed or stored in more than one place; NOT for modelling legal states or collapsing pass-through layers; gives it one owner that other sites derive from or receive."
---

# Derive from one owner

Give each shared fact or decision one owner, and derive it everywhere else.

1. Find every site that computes, stores or synchronises the fact or decision. For each difference between sites, decide whether it is an intentional caller difference or drift.
2. Choose one owner. Prefer an existing domain function or source of truth that already returns the correct answer; otherwise use the boundary that holds the inputs.
3. Pass the owner's result only where it is needed. Derive values rather than synchronising copies: do not recompute the decision at each caller, keep stored copies in step with effects or jobs, or thread extra flags through unrelated layers.
4. Keep each intentional caller difference explicit at that caller, applied to the owner's result. Remove the drifting copies, whether computed or stored.

Distinct from: `principle-model-the-domain` (invalid states or repeated domain rules: represent legal states, transitions and ownership), `principle-minimize-reader-load` (an existing path is hard to trace through layers, with nothing duplicated), `principle-reuse-before-building` (about to write a new helper, owner, script or component).

Done: one owner holds the fact or decision; every other site derives or receives it, and intentional caller differences stay explicit.
