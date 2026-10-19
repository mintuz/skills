# Evaluation evidence

Date: 2026-10-19. Subject and judge: `gpt-6-astra`, reasoning effort medium, via `openai:codex-sdk` with the installed `codex` (read-only sandbox, no network). One trial per case. Synthetic read-only scenarios test instruction behaviour, not product runtime. Provider errors: none in any run below.

## Behaviour (`pnpm eval:skills`)

| Case | Baseline | Treatment |
| --- | --- | --- |
| A renamed persisted property is not proof the stored key changed | pass | pass |
| A dry-run flag is not evidence of no side effects | **fail**: said "verify dry-run prevents publishing" but proposed no observation of what the staging run touched or of the skipped code paths | pass |
| A guard's name does not prove what it checks | pass | pass |

Final run: `eval-Ha0-2026-10-19T10:51:03` (RED 1/3 baseline failures; GREEN 3/3 treatment).

Superseded: `eval-g5i-2026-10-19T10:48:54` passed every baseline case because the scenarios stated the missing evidence outright ("nobody has read which code paths --dry-run skips"; "you have not seen the body"). Those cues were removed from the scenarios; rubrics were unchanged.

## Trigger (`pnpm test:skills:triggers`, report-only)

`eval-EZm-2026-10-19T10:52:46`: 2/2. Dry-run trust request → `skill-used` pass; plain French translation → `not-skill-used` pass.
