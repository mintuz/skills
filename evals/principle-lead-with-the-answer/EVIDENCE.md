# Evaluation evidence

Date: 19 October 2026. Subject and judge: `gpt-6-astra`, reasoning effort medium, via `openai:codex-sdk` with `codex_path_override: codex`, read-only sandbox. One trial per case per run. Provider errors: none in any run listed here.

Commands: `pnpm eval:skills:check`, `PROMPTFOO_CONFIG_DIR=.promptfoo/<name> pnpm eval:skills` (baseline beside treatment) and `pnpm test:skills:triggers` (report-only).

## Final comparison: eval-ptJ-2026-10-19T11:14:02

| Case | Baseline | Treatment |
|---|---|---|
| A customer reply answers before thanks or investigation | FAIL: first sentence confirms the double charge; the refund (the resolution) is only in the second sentence | PASS |
| An estimate comes before its working | PASS | PASS |
| An unsettled question still gets its answer first | PASS | PASS |

RED: baseline 2/3. GREEN: treatment 3/3. The customer-reply baseline failure reproduced in all three runs of the current scenario (eval-J5Z-2026-10-19T10:53:40, eval-sNY-2026-10-19T11:12:40, eval-ptJ). It is a narrow gap: the baseline already answers first in most cases because the shared prompt asks for "a concise decision".

## History
- eval-ydo-2026-10-19T10:48:55: first cases (incident post, status update, PM question). Baseline 2/3, treatment 2/3. The incident rubric demanded cause, impact and fix in the first sentence, beyond the plan's done-check; rubric relaxed.
- eval-cvG-2026-10-19T10:51:34: baseline 3/3, so the scenarios did not expose the principle. Replaced the status and PM cases with the customer reply and the disk estimate.
- eval-J5Z: baseline 2/3, treatment 3/3.
- eval-sNY: baseline 2/3, treatment 1/3. Both treatment failures were the judge rejecting "no facts are invented" because it cannot see the scenario. That clause was removed from two rubrics; no skill change.
- eval-ptJ: final, as above.

## Triggers: eval-hPl-2026-10-19T10:55:23
2/2: the customer-reply request read the skill (`skill-used`); the plain rename request did not (`not-skill-used`).
