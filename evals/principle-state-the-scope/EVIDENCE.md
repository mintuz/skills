# Evaluation evidence

Date: 19 October 2026. Subject and judge: `gpt-6-astra`, reasoning effort medium, via the Codex SDK provider (read-only sandbox). One trial per case per run. Global host metadata was not hidden, so the baseline includes host-level instructions.

## Final behaviour run: `eval-zWL-2026-10-19T11:12:10`

| Case | Baseline | Treatment |
|---|---|---|
| "All" stays all; a tool's defaults do not narrow it silently | FAIL: spotted the `gh` defaults but asked what "this year" meant instead of stating an interpretation | PASS |
| An open "recent" window is pinned and said out loud | PASS | PASS |
| One convenient entry point does not verify every mapped path | PASS | PASS |

RED: baseline 2/3. GREEN: treatment 3/3. Provider errors: none.

## Earlier runs

- `eval-PTE-2026-10-19T11:08:50`: treatment failed the "recent" case only because the rubric also required inviting correction, which the plan's Done-when ("interpretation and coverage limits are stated") does not demand. That clause was removed. Both arms passed the explicit audit-coverage case.
- `eval-oSN-2026-10-19T11:10:36`: both arms passed every case, 6/6. The audit case listed its coverage gaps explicitly, so it was replaced with the tool-default case. Step 3 now names "a tool's default limit or filter" as a silent narrowing, which is a tightening of the same rule.

## Trigger run: `eval-hbY-2026-10-19T11:13:23`

- `skill-used` ("audit all endpoints" with one inaccessible service): PASS
- `not-skill-used` (plain translation): PASS

Trigger results are report-only.
