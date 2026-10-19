# Evaluation evidence

Astra Medium; Promptfoo 0.122.2; `openai:codex-sdk` with the installed `codex` on PATH. Synthetic scenarios test instruction behavior, not product runtime.

The pre-change fixture is the pinned upstream skill in `upstream-before.md`. Copy it to the source path to reproduce the initial treatment; restore the current port afterwards. Tests use the current source, never a stale fixture.

| Stage | Result | Evidence |
| --- | --- | --- |
| red | 2/2 passed; 0 errors; no behavioral RED | [eval-RSW-2026-10-13T20:35:45](red-evidence.json) |
| prechange-trigger | 2/2 passed; 0 errors | [eval-Za8-2026-10-13T20:36:25](prechange-trigger-evidence.json) |
| green | 2/2 passed; 0 errors | [eval-Gfa-2026-10-13T20:39:00](green-evidence.json) |
| compare | 4/4 passed; 0 errors; 0 improved, 0 regressed case scores versus no-skill | [eval-U2x-2026-10-13T20:48:04](compare-evidence.json) |
| trigger | 2/2 passed; 0 errors | [eval-2SH-2026-10-13T20:56:10](trigger-evidence.json) |

Configuration validation passed for the main and trigger configs. Trigger workspaces are disposable copies made by the repository runner. A skill-file read is activation evidence, not proof of correct application; exclusion is judged on the response.

Context size: 209 upstream words → 161 port words (whitespace count, including frontmatter).

The first hypothetical evaluation incorrectly required executed work. That grading defect is retained separately in `invalid-grading-evidence.json`, excluded from RED, and corrected before the recorded RED attempt.

Native Claude and OMP both resolved the named skill through their loaders and returned content matching the frozen source. One representative hypothetical case per host was manually reviewed. Each fresh process batched twelve skills. This is explicit invocation, not unprompted activation or product-runtime proof.

## Narrowing, 2026-10-19

Evidence levels moved to `principle-label-the-evidence`, missing-coverage reporting to `principle-gaps-are-not-passes`, and "add a script only when reuse or reliability earns it" to `principle-build-the-lever` (already carried by its steps 1 and 4 and its "Existing query already proves the job" case). The description now also triggers on a failing check. "Match proof to artifact identity" dropped its "reports evidence by level" clause; that obligation is tested by label-the-evidence's device case.

Astra Medium, one trial, no provider errors. Treatment `eval-Iqj-2026-10-19T11:04:41`: 2/2. Trigger `eval-gII-2026-10-19T11:05:06`: 2/2.
