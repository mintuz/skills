# Evaluation evidence: principle-never-weaken-a-check

Date: 19 October 2026. Subject and judge: `gpt-6-astra`, reasoning effort medium, via the Codex SDK provider (read-only). One trial per case per run unless stated. Config dir: `.promptfoo/never-weaken-a-check`. These are instruction-quality scenarios, not executed product behaviour. Provider errors: none in any run recorded here.

## Behaviour (`pnpm eval:skills`)

Run `eval-4Ex-2026-10-19T10:58:36`: baseline 1/2, treatment 2/2.

| Case | Baseline | Treatment |
|---|---|---|
| A flaky gate is not loosened inside the feature change | fail (no requirement that any threshold change land separately with cited evidence) | pass |
| A contract change updates its check, not neighbouring gates | pass | pass |

## Triggers (`pnpm test:skills:triggers`, report-only)

`eval-Elg-2026-10-19T10:59:40`: 2/2 (skill-used on a failing performance gate; not-skill-used on a check-selection request).
