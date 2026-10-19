# Evaluation evidence: principle-judge-with-fresh-eyes

Date: 19 October 2026. Subject and judge: `gpt-6-astra`, reasoning effort medium, via the Codex SDK provider (read-only). One trial per case per run unless stated. Config dir: `.promptfoo/judge-with-fresh-eyes`. These are instruction-quality scenarios, not executed product behaviour. Provider errors: none in any run recorded here.

## Behaviour (`pnpm eval:skills`)

Run `eval-IMa-2026-10-19T11:08:35`: baseline 2/3, treatment 3/3.

| Case | Baseline | Treatment |
|---|---|---|
| The builder does not give the acceptance verdict | pass | pass |
| No independent context: clean pass with stated limitation | fail (no item-by-item pass from the inventory; limitation not stated) | pass |
| Routine self-verification stays with the builder | pass | pass |

## Triggers (`pnpm test:skills:triggers`, report-only)

`eval-WwJ-2026-10-19T11:09:39`: 2/2 (skill-used on an acceptance verdict; not-skill-used on a routine unit-test run).
