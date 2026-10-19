# Evaluation evidence

Date: 19 October 2026. Subject and judge: Astra Medium (`gpt-6-astra`, reasoning effort medium) through the Codex SDK, read-only, one trial per case per run. New principle from repo `babysit` step 7, also stated in `github-monitor` step 6. These are instruction-quality scenarios, not executed product behaviour.

## Comparison (`pnpm eval:skills`)

| Case | Baseline | Treatment |
|---|---|---|
| Get it green does not mean report only at the end | FAIL (omitted the lint attempt count; "keep the user informed" did not commit to reporting each later transition) | PASS |
| A held state is a transition too | PASS | PASS |

Final run: `eval-J3f-2026-10-19T10:59:54`. RED: baseline fails 1 of 2. GREEN: treatment 2/2. No provider errors.

Earlier runs `eval-l2p-2026-10-19T10:57:32` and `eval-7MG-2026-10-19T10:58:42`: baseline passed both cases because the scenarios asked what to tell the user. The scenarios were sharpened to ask only for the next step; rubrics unchanged in substance.

## Triggers (`pnpm test:skills:triggers`, report-only)

`eval-ON1-2026-10-19T11:01:04`: 2/2. Positive (babysit a PR to green while the user is in meetings) selected the skill; negative (a one-off weekly stakeholder update) did not.
