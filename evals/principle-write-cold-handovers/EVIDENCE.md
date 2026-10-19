# Evaluation evidence

Date: 19 October 2026. Subject and judge: Astra Medium (`gpt-6-astra`, reasoning effort medium) through the Codex SDK, read-only, one trial per case per run. New principle, split from step 4 and the done-check of `principle-guard-the-context-window`; the case "Handover must preserve the decision boundary" moved here from that suite. These are instruction-quality scenarios, not executed product behaviour.

## Comparison (`pnpm eval:skills`)

| Case | Baseline | Treatment |
|---|---|---|
| Handover must preserve the decision boundary | FAIL (told the reader to prepare a handover; no discriminating next check, no durable save) | PASS |
| Pause note must survive a reader with no shared history | PASS | PASS |
| Delegated brief must stand alone | PASS | PASS |

Final run: `eval-PzJ-2026-10-19T10:51:33`. RED: baseline fails 1 of 3. GREEN: treatment 3/3. No provider errors.

Earlier run `eval-an2-2026-10-19T10:49:17`: baseline failed cases 1 and 2; treatment failed case 2 because it closed with a multi-part instruction instead of one next step. Fix cycle 1 changed the skill to "one concrete next executable step" and the rubric from "ends with" to "names" one next step (the plan requires the step, not its position).

## Triggers (`pnpm test:skills:triggers`, report-only)

`eval-uRi-2026-10-19T10:53:36`: 2/2. Positive (cold-pickup rewrite of a vague handover note) selected the skill; negative (checking state before merging from yesterday's handover, owned by `principle-refresh-before-resuming`) did not.
