# Evaluation evidence

Date: 19 October 2026. Subject and judge: `gpt-6-astra`, reasoning effort medium, via `openai:codex-sdk` with `codex_path_override: codex`, read-only sandbox. One trial per case per run. Provider errors: none in any run listed here.

Commands: `pnpm eval:skills:check`, `PROMPTFOO_CONFIG_DIR=.promptfoo/<name> pnpm eval:skills` (baseline beside treatment) and `pnpm test:skills:triggers` (report-only).

## Final comparison: eval-QNe-2026-10-19T10:59:52

| Case | Baseline | Treatment |
|---|---|---|
| Each option carries a cost the agent must derive | FAIL: recommendation first, options in a table rather than one sentence each, restart cost left implicit | PASS |
| An approval request prices the option the agent prefers | FAIL: chose the handler fix itself and asked only for push approval later; the choice was not put to the user | PASS |
| Every option, including the recommendation, has its cost | FAIL: disk-usage summary before the decision and options | PASS |

RED: baseline 0/3. GREEN: treatment 3/3.

## History
- eval-iEA-2026-10-19T10:56:05: two cases. Baseline 1/2, treatment 1/2. The webhook rubric required one specific cost wording beyond the plan; rubric relaxed to "a real cost".
- eval-TiB-2026-10-19T10:57:53: added the CI case. Baseline 1/3, treatment 2/3: treatment stated option C's cost as a mechanism ("omits the payment tests"), not a consequence. Skill fix: one sentence per option, not a table cell, with the cost stated as its consequence for the user.
- eval-QNe: final, as above.

## Triggers: eval-jCg-2026-10-19T11:01:22
2/2: the CI-choice request read the skill; the summary request did not.
