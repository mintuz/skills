# Evaluation evidence

Date: 19 October 2026. Subject and judge: `gpt-6-astra`, medium reasoning effort, one trial per case per run. New principle split from `principle-boundary-discipline` step 4 (no leaked representations; special policy at the edge). Eval suite and trigger config were written before SKILL.md.

## Behaviour (`pnpm eval:skills`)

| Run | Case | Baseline | Treatment |
|---|---|---|---|
| `eval-tAo-2026-10-19T11:03:02` | Consumers should not depend on storage rows (first wording) | pass | pass |
| `eval-tAo-2026-10-19T11:03:02` | Special policy belongs at the edge (first wording) | fail | fail |
| `eval-fdf-2026-10-19T11:04:35` | Consumers should not depend on storage rows (sharpened) | **fail** | pass |
| `eval-fdf-2026-10-19T11:04:35` | Special policy belongs at the edge (sharpened) | **fail** | pass |

In `eval-tAo` both prompts failed the retry case only on a rubric clause requiring a test of the general client "with neutral policies", a test shape the plan does not require; that clause was replaced by the plan's done-check (each partner policy holds; the shared client has no partner-specific branch). The baseline passed the first storage case, so both scenarios were sharpened (signposting removed).

RED in `eval-fdf`: storage case baseline used a response DTO but no repository-owned domain type, so consumers still depended on Prisma field names; retry case baseline did not place partner policy in the integration adapters or check the shared client for partner branches. GREEN: treatment 2/2.

## Triggers (`pnpm test:skills:triggers`, report-only)

`eval-7tK-2026-10-19T11:05:34`: positive (Prisma and Stripe objects returned to React) pass; negative (refund handler mixing rules and wiring; owned by `principle-keep-the-core-pure`) pass.

No provider errors.
