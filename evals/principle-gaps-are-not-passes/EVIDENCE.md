# Evaluation evidence

Date: 2026-10-19. Subject and judge: `gpt-6-astra`, reasoning effort medium, via `openai:codex-sdk` with the installed `codex` (read-only sandbox, no network). One trial per case. Synthetic read-only scenarios test instruction behaviour, not product runtime. Provider errors: none in any run below.

## Behaviour (`pnpm eval:skills`)

| Case | Baseline | Treatment |
| --- | --- | --- |
| Every gap is named, even in one line | **fail**: named the cancelled shards and queued load test but folded the skipped Android UI tests and the empty licence report into remedies without reporting them as gaps | pass |
| A relayed verdict is only as good as its recorded evidence | pass | pass |
| Quarantined tests on the changed path are a gap | pass | pass |

Final run: `eval-RUU-2026-10-19T11:03:02` (RED 1/3 baseline failures; GREEN 3/3 treatment).

The baseline is strong on this rule. Four earlier scenario sets passed every baseline case and were replaced by sharper scenarios (rubrics follow each scenario's facts): `eval-4Qc-2026-10-19T10:55:18`, `eval-FjH-2026-10-19T10:57:15`, `eval-iOs-2026-10-19T10:59:13`, `eval-w6c-2026-10-19T11:01:14`. The surviving RED is a single narrow omission, so the gain over baseline is small.

## Trigger (`pnpm test:skills:triggers`, report-only)

`eval-oRm-2026-10-19T11:04:22`: 2/2. Skipped-CI release verdict → `skill-used` pass; plain French translation → `not-skill-used` pass.
