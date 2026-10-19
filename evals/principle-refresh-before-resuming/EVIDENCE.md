# Evaluation evidence

Date: 19 October 2026. Subject and judge: Astra Medium (`gpt-6-astra`, reasoning effort medium) through the Codex SDK, read-only, one trial per case per run. New principle, split from step 5 of `principle-guard-the-context-window`, carrying the PR `recall` step 4 refresh rules. These are instruction-quality scenarios, not executed product behaviour.

## Comparison (`pnpm eval:skills`)

| Case | Baseline | Treatment |
|---|---|---|
| A merge is not a deployment and a timeout is not a pass | PASS | PASS |
| Recorded readiness must be refreshed before acting on it | FAIL (did not treat unconfirmed claims as unknown and withhold the merge) | PASS |

Final run: `eval-uXl-2026-10-19T10:55:51`. RED: baseline fails 1 of 2. GREEN: treatment 2/2. No provider errors.

Earlier run `eval-bbv-2026-10-19T10:54:11`: case 2 failed for both. The rubric demanded refusing to merge whenever the head had moved, which the plan does not require; it now requires treating unconfirmed claims as unknown. The treatment also skipped comparing the recorded revision, so fix cycle 1 made step 2 "compare the recorded revision with the current one".

## Triggers (`pnpm test:skills:triggers`, report-only)

`eval-PJC-2026-10-19T10:57:05`: 2/2. Positive (resuming from notes claiming pushed, passing and on staging) selected the skill; negative (writing a pause handover, owned by `principle-write-cold-handovers`) did not.
