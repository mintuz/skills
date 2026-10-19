# Evaluation evidence

Date: 19 October 2026. Subject and judge: `gpt-6-astra`, reasoning effort medium, via `openai:codex-sdk` with `codex_path_override: codex`, read-only sandbox. One trial per case per run. Provider errors: none in any run listed here.

Commands: `pnpm eval:skills:check`, `PROMPTFOO_CONFIG_DIR=.promptfoo/<name> pnpm eval:skills` (baseline beside treatment) and `pnpm test:skills:triggers` (report-only).

## Final comparison: eval-ZUQ-2026-10-19T11:06:36

| Case | Baseline | Treatment |
|---|---|---|
| A capped summary keeps disputes, proposals and conditions | FAIL: the judge read the 09:10 time as attributed to "Ops" rather than "our monitors" (a strict reading; the other details were kept) | PASS |
| A plain re-explanation keeps scope, sample and hedges | FAIL: "rolling it back would fix the failure" dropped the "only if confirmed" condition | PASS |
| A diagram keeps every branch and the open question | PASS | PASS |

RED: baseline 1/3. GREEN: treatment 3/3. The re-explanation failure is the clear RED; the summary failure rests on a strict attribution reading.

## History
- eval-aLh-2026-10-19T11:01:52: baseline 2/3, treatment 2/3. The treatment diagram flagged a real ambiguity in the source (whether the third-retry rule covered 429s) and the judge scored that as an added exception. Scenario disambiguated (429s have no retry limit; the limit is on 5xx); no skill change.
- eval-Uf7-2026-10-19T11:03:34 and eval-y1X-2026-10-19T11:05:06: baseline 3/3 both times, so the length-capped note summary and the 50 MB re-explanation did not expose the principle. Replaced with the incident-thread summary and the CEO re-explanation.
- eval-ZUQ: final, as above.

## Triggers: eval-Tmm-2026-10-19T11:07:43
2/2: the thread-summary request read the skill; the ask-the-user-to-choose request did not.
