# Evaluation evidence

Date: 19 October 2026. Subject and judge: Astra Medium (`gpt-6-astra`, `model_reasoning_effort: medium`), read-only Codex SDK, one trial per case per run. Suite written before SKILL.md.

## Behaviour (`pnpm eval:skills`, eval `eval-riW-2026-10-19T10:49:51`)

| Case | Baseline | Treatment |
|---|---|---|
| Measure the unchanged system before applying a known fix | FAIL: measured before and after with fixed inputs but did not record the unchanged revision | PASS |
| Recover a baseline when the change already happened | PASS | PASS |

RED: baseline 1/2 (the failure rests on recording the pre-change revision; the baseline already measured before changing). GREEN: treatment 2/2. Provider errors: 0.

## Triggers (`pnpm test:skills:triggers`, eval `eval-1kD-2026-10-19T10:51:29`, report-only)

- `skill-used` (switching thumbnails from PNG to WebP and showing it helped): PASS.
- `not-skill-used` (read-only explanation of default `sort` order): PASS.

These are instruction-quality scenarios, not executed product behaviour.
