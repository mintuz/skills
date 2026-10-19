# Evaluation evidence

Date: 19 October 2026. Subject and judge: `gpt-6-astra`, medium reasoning effort, one trial per case per run unless stated. New principle split from `principle-boundary-discipline` steps 1-3 and its done-check; also receives the parse-untrusted/persisted rule from `principle-type-system-discipline` and "put each invariant at its owning boundary" from `principle-minimize-reader-load`. Eval suite and trigger config were written before SKILL.md.

Cases 1 and 2 are moved from the retired `principle-boundary-discipline` suite. Their clauses about thin transport wiring and raw CLI representations moved with their rules to `principle-keep-the-core-pure` and `principle-hide-representations`. The persisted-legacy clause from `principle-type-system-discipline` is covered by case 1 (older Accounts loaded from disk).

## Behaviour (`pnpm eval:skills`)

| Run | Case | Baseline | Treatment |
|---|---|---|---|
| `eval-k6s-2026-10-19T10:47:09` | 1 Persistence breaks unconditional trust | pass | pass |
| | 2 One proven boundary is sufficient | pass | pass |
| | 3 (first wording: cache rehydration with `as Order`) | pass | pass |
| `eval-aDq-2026-10-19T10:49:18` | 3 (second wording: Swift actor suspension) | pass | pass |
| `eval-hNT-2026-10-19T10:52:16` | 3 (third wording: config hot-update path) | pass | pass |
| `eval-k0y-2026-10-19T10:55:42` | 1 Persistence breaks unconditional trust | pass | pass |
| | 2 One proven boundary is sufficient | pass | pass |
| | 3 Harden entry paths, not the interior | **fail** | pass |

Baseline-only probes: `eval-y2I-2026-10-19T10:51:23` (third wording, `--repeat 2`) 1/2 pass; `eval-4MP-2026-10-19T10:54:38` (final wording, `--repeat 3`) 0/3 pass.

RED: the baseline concentrated validation at the three entry paths but did not give useful errors at every boundary or name accepted-input checks, both required by the principle. Earlier case-3 wordings were sharpened because the baseline passed them; rubrics were not loosened.

GREEN after the description change: `pnpm test:skills` `eval-6Kc-2026-10-19T11:09:42` treatment 3/3.

## Triggers (`pnpm test:skills:triggers`, report-only)

- `eval-gS5-2026-10-19T10:57:23`: positive pass; negative (concurrent writers rewriting one state file, owned by `principle-separate-before-serializing-shared-state`) fail — the agent followed this skill. The description then gained "NOT for choosing concurrent-writer ownership" and its suspension clause was narrowed to a validated value relied on after suspension or mutation.
- `eval-NkD-2026-10-19T10:58:23`: positive pass; negative pass.

No provider errors.
