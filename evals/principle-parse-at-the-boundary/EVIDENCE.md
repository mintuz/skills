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

## Unknown members at each boundary (23 October 2026)

Case 4 "Decide unknown members at each boundary" was added before the skill change. Source idea: citypaul `api-design` tolerant reader, open enums and closed input schemas (MIT), reworded. Subject and judge unchanged.

| Run | Skill | Case 4 baseline | Case 4 treatment | Cases 1-3 treatment |
|---|---|---|---|---|
| `eval-WXu-2026-10-23T13:10:37` (`test:skills`, RED) | unchanged | not run | **fail** | pass |
| `eval-mFR-2026-10-23T13:22:33` (`--repeat 3`, treatment only) | unchanged | not run | 1/3 | not run |
| `eval-LDp-2026-10-23T13:12:11` (`test:skills`, GREEN) | new step 3 | not run | pass | pass |
| `eval-vkb-2026-10-23T13:13:26` (`eval:skills`, COMPARE) | new step 3 | pass | pass | pass (baseline: 1-2 pass, 3 fail as before) |
| `eval-vqX-2026-10-23T13:19:48` (`--repeat 3`) | new step 3 | 3/3 | 3/3 | not run |

RED: with the unchanged skill, the treatment rejected events with an unrecognised status instead of parsing it into an explicit unknown case. The judge gave this reason in all three failures. The no-skill baseline passed case 4 in 4 of 4 trials, so the unchanged skill's "parse and return errors" step pulled the treatment below the baseline; the new step removes that regression. No provider errors.
