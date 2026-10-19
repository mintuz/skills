---
name: principle-label-the-evidence
description: "WHEN writing findings, reports, handovers or verification summaries; NOT for deciding which checks to run; marks each claim's epistemic status, evidence level and source locator."
---

# Label the evidence

A reader can trust a claim only as far as its label says it was observed.

1. Give each material claim one status: fact (observed), inference (reasoned from facts), rejected hypothesis, decision or open question. Do not promote an inference to a fact by stating it plainly.
2. Name the evidence level behind each claim: static inspection, build, unit, integration, simulator, physical device, browser or production. Keep levels distinct.
3. A passed lower-level check never establishes a higher-level claim. A build does not prove runtime; a unit pass does not prove integration; a simulator run does not prove physical-device behaviour. State what was observed at its own level and leave the unobserved higher-level claim open.
4. Keep each conclusion with a source locator, such as file and line, command and output, run ID or revision, and the observations that support it.

Distinct from: `principle-gaps-are-not-passes` (a check did not run or complete), `principle-prove-it-works` (choosing and running the check behind a claim), `principle-explain-the-number` (a number's unit, method and measurement class).

Done: every material claim is marked fact, inference, rejected hypothesis, decision or open question; names its evidence level; and cites a locator.
