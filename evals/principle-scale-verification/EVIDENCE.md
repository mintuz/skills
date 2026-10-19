# Evaluation evidence: principle-scale-verification

Date: 19 October 2026. Subject and judge: `gpt-6-astra`, reasoning effort medium, via the Codex SDK provider (read-only). One trial per case per run unless stated. Config dir: `.promptfoo/scale-verification`. These are instruction-quality scenarios, not executed product behaviour. Provider errors: none in any run recorded here.

## Behaviour (`pnpm eval:skills`)

Final run `eval-VJJ-2026-10-19T10:56:29`: baseline 2/3, treatment 3/3.

| Case | Baseline | Treatment |
|---|---|---|
| Required checks are part of the job | pass | pass |
| Extra checks must be able to change the decision | pass | pass |
| A fix repeats the required checks | fail (did not broaden to other serializer consumers or report that gap) | pass |

The first case carries the retired `principle-laziness-protocol` case "Smallest diff still honors the outcome" (scenario unchanged; rubric limited to the verification half).

RED history: earlier scenario sets passed the baseline on every case (`eval-kj3-2026-10-19T10:49:03`, `eval-q0W-2026-10-19T10:51:55`, `eval-KnZ-2026-10-19T10:54:13`; treatment 3/3 each time). Scenarios were sharpened, rubrics were not loosened.

## Triggers (`pnpm test:skills:triggers`, report-only)

`eval-GFR-2026-10-19T10:58:04`: 2/2 (skill-used on a check-selection request; not-skill-used on a test-assertion rewrite).
