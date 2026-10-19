# Evaluation evidence

Date: 19 October 2026. Subject and judge: `gpt-6-astra`, reasoning effort medium, via the Codex SDK provider (read-only sandbox). One trial per case per run. Global host metadata was not hidden, so the baseline includes host-level instructions.

## Final behaviour run: `eval-4Cr-2026-10-19T11:06:48`

| Case | Baseline | Treatment |
|---|---|---|
| A requested conversion keeps behaviour it was not asked to change | PASS | PASS |
| Leftover edits are reverted or justified before handover | FAIL: kept the timeout, log-line and version-range changes pending clarification, and the handover neither reverted nor justified them | PASS |
| Pre-existing changes stay out of your commit and the index stays as found | PASS | PASS |

RED: baseline 2/3. GREEN: treatment 3/3. Provider errors: none.

## Earlier runs

- `eval-0hH`, `eval-aV5`, `eval-CVo`, `eval-Jg5`, `eval-X86`, `eval-vqJ` (19 October 2026, 10:53-11:03): both arms passed every case. Those scenarios covered selective hunk staging, a rename with formatter churn, stashing someone else's edits, a pre-staged changelog, a cleanup that keeps supported behaviour, and a lint hook tempting behaviour changes. The baseline already handled explicit git hygiene, so the scenarios were replaced with ones that do not flag the hazard.
- `eval-KUn-2026-10-19T11:05:06`: treatment FAILED the conversion case. It kept the callback API that the user had asked to change, and so left the callers untouched. Fix cycle 1: step 2 now says to make the requested change completely, including the edits it requires (such as updating callers), and to preserve everything else. The final run is after that edit.

## Trigger run: `eval-pzG-2026-10-19T11:08:19`

- `skill-used` (commit a fix next to pre-existing uncommitted changes): PASS
- `not-skill-used` (plain translation): PASS

Trigger results are report-only.

## 2026-10-19 review fix

Step 2 now states a scope boundary instead of a completeness duty (owned by `principle-define-done`). A first rewording ("everything else stays as it is") let the conversion case keep the callback interface (2/3 then 3/5 on repeat). The final text names the new interface and its updated callers as in scope.

- conversion case, final text, `--repeat 5`: 5/5 (eval-ayk-2026-10-19T12:32:44)
- treatment: 3/3; 0 errors (eval-HV9-2026-10-19T12:33:28)
