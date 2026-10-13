---
name: why
description: WHEN investigating code rationale or design tradeoffs; NOT for runtime walkthroughs; separates historical facts, inference and unknowns
---

# Why

Investigate the forces that led to the current code. Code shows behavior; it does not by itself establish intent.

1. **Anchor the question.** Identify the target symbols and current source, then inspect the most probative local history and linked review/issue rationale. Use the repository's actual source host and available read-only capabilities. A narrow question settled by explicit rationale deserves a direct answer, without mandatory delegation or additional enterprise searches.
2. **Expand for a material gap.** When initial sources leave an important uncertainty, search the relevant category: decisions/docs for design intent, issues for product constraints, authorized conversation windows for deliberation, incidents/observability for failure history, analytics for data-driven thresholds. Discover available tools rather than assuming provider APIs, models or transcript paths. Consult only relevant records; a connected private source is not permission for a broad scan.
3. **Test the explanation.** Track direct evidence, reasonable inference and unknowns separately. A threshold comment or tidy-up commit does not prove benchmarking. Compare contradictory sources and authority/supersession; recency alone does not settle an unresolved ruling. Distinguish historical motivation from present measurements. Give competing explanations only when the evidence supports genuine uncertainty.
4. **Answer with provenance.** Lead with the supported rationale and cite code/history/source locators. Record consulted sources, meaningful null results and relevant unsearched or inaccessible gaps. Scale confidence and detail to the evidence; never turn a plausible reason into a recorded decision. If the question precedes a change, extract the constraints to preserve, permitted changes and unresolved risks without implementing them.

Keep investigation read-only. `how` owns execution walkthroughs; `decision-trace` follows explicit decision/delivery claims. Optional independent investigation must follow host authorization and be useful to the answer, not a required model fleet.
