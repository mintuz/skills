# Evaluation evidence

Date: 19 October 2026. Subject and judge: `gpt-6-astra`, reasoning effort medium, via `openai:codex-sdk` with `codex_path_override: codex`, read-only sandbox. One trial per case per run. Provider errors: none in any run listed here.

Commands: `pnpm eval:skills:check`, `PROMPTFOO_CONFIG_DIR=.promptfoo/<name> pnpm eval:skills` (baseline beside treatment) and `pnpm test:skills:triggers` (report-only).

## Final comparison: eval-CVI-2026-10-19T11:09:28

| Case | Baseline | Treatment |
|---|---|---|
| A vague deliverable gets a checkable completion criterion first | FAIL: no commitment to check the criterion at the end and report unmet parts as gaps; Node 20 criterion incomplete | PASS |
| Each phase of a multi-step change has its own done-check | FAIL: inventory and update phases had no done-check of their own | PASS |
| Unmet gates are reported, not redefined away | PASS | PASS |

RED: baseline 1/3. GREEN: treatment 3/3.

## History
- eval-gZV-2026-10-19T11:08:06: baseline 1/3, treatment 2/3: the treatment plan for the onboarding docs set criteria but did not include the closing check-and-report step. Skill fix: step 3 now puts that closing step in the plan itself.
- eval-CVI: final, as above.

## Triggers: eval-BwN-2026-10-19T11:10:42
2/2: the onboarding-docs request read the skill; the HTTP 429 question did not.
