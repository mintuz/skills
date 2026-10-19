# Evaluation evidence

Date: 19 October 2026. Subject and judge: Astra Medium (`gpt-6-astra`, `model_reasoning_effort: medium`) through `openai:codex-sdk` with the installed `codex`; one trial per case per run. Synthetic scenarios test instruction behaviour, not product runtime.

TDD order: the cases, rubrics and trigger config were written before `SKILL.md`. Configuration validation passed for the main and trigger configs.

## Comparison (baseline vs treatment): eval-wo3-2026-10-19T10:48:26

| Case | Baseline | Treatment |
| --- | --- | --- |
| Recency does not outrank an approved spec | PASS | PASS |
| Equal authority with no precedence is unresolved | PASS | PASS |
| A later change without recorded authority is not a supersession | FAIL | PASS |

RED: the baseline cited D-7 and rejected the PR and status page as superseding, but did not report the drift to the architecture board as decision owner. GREEN: treatment 3/3. Provider errors: 0.

## Triggers: eval-5Pm-2026-10-19T10:50:25

| Case | Result |
| --- | --- |
| Selects relevant guidance (approved spec vs newer ticket comment) | PASS (`skill-used`) |
| Excludes a plain translation | PASS (`not-skill-used`) |

Provider errors: 0. Trigger results are report-only; a skill-file read is activation evidence, not proof of correct application.
