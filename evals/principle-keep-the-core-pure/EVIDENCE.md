# Evaluation evidence

Date: 19 October 2026. Subject and judge: `gpt-6-astra`, medium reasoning effort, one trial per case per run. New principle split from `principle-boundary-discipline` step 4 (thin wiring, pure decisions). Eval suite and trigger config were written before SKILL.md.

## Behaviour (`pnpm eval:skills`)

| Run | Case | Baseline | Treatment |
|---|---|---|---|
| `eval-LXI-2026-10-19T10:59:25` | Extract the rule rather than growing the handler (first wording) | pass | pass |
| `eval-LXI-2026-10-19T10:59:25` | A UI component should not own the domain decision (React; since replaced) | pass | pass |
| `eval-T9J-2026-10-19T11:01:23` | Extract the rule rather than growing the handler (sharpened: "smallest change that can ship today") | pass | pass |
| `eval-T9J-2026-10-19T11:01:23` | A framework hook should not own the domain decision (NestJS interceptor) | **fail** | pass |

RED: in `eval-T9J` the baseline extracted a pure function but hard-coded the 15% rate instead of passing configuration as an input. GREEN: treatment 2/2 in `eval-T9J`. The first run's baseline passed both cases, so the scenarios were sharpened (signposting removed, React case replaced); rubrics were not loosened.

## Triggers (`pnpm test:skills:triggers`, report-only)

`eval-RvA-2026-10-19T11:02:24`: positive (refund handler mixing parsing, database and rules) pass. Negative (Prisma rows leaked to API; owned by `principle-hide-representations`) fail by heuristic only: the agent read SKILL.md, then answered "none" and stated the request concerns representation leakage, not domain decisions in framework code.

No provider errors.
