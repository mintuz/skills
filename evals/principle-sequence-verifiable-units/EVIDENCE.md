# Evaluation evidence

Astra Medium; Promptfoo 0.122.2; `openai:codex-sdk` with the installed `codex` on PATH. Synthetic scenarios test instruction behavior, not product runtime.

The pre-change fixture is the pinned upstream skill in `upstream-before.md`. Copy it to the source path to reproduce the initial treatment; restore the current port afterwards. Tests use the current source, never a stale fixture.

| Stage | Result | Evidence |
| --- | --- | --- |
| red | 0/2 passed; 0 errors | [eval-b8X-2026-10-13T20:33:14](red-evidence.json) |
| green | 2/2 passed; 0 errors | [eval-TOU-2026-10-13T20:40:26](green-evidence.json) |
| compare | 4/4 passed; 0 errors; 0 improved, 0 regressed case scores versus no-skill | [eval-ZjC-2026-10-13T20:50:33](compare-evidence.json) |
| trigger | 2/2 passed; 0 errors | [eval-LJU-2026-10-13T20:57:02](trigger-evidence.json) |

Configuration validation passed for the main and trigger configs. Trigger workspaces are disposable copies made by the repository runner. A skill-file read is activation evidence, not proof of correct application; exclusion is judged on the response.

Context size: 280 upstream words → 159 port words (whitespace count, including frontmatter).

Native Claude and OMP both resolved the named skill through their loaders and returned content matching the frozen source. One representative hypothetical case per host was manually reviewed. See [principle validation](../../reports/skill-audit-2026-10-13/principle-validation.md); each fresh process batched twelve skills. This is explicit invocation, not unprompted activation or product-runtime proof.

## Narrowing, 19 October 2026

Baseline inspection, dirty-state preservation and the no-automatic-rebase, stash or reset rule moved to `principle-update-the-base-deliberately`, which now carries the "dirty shared branch" serializer case. This suite replaces it with "A failed unit blocks the work that depends on it". The skill now requires each unit's check to pass, or its failure to be resolved or rolled back, before dependent work, and gains `Distinct from:` and `Done:` lines. Description adds "NOT base updates".

| Stage | Result | Eval ID |
| --- | --- | --- |
| treatment | 1/2; failed-unit case missed a before-change check per format unit; 0 errors | eval-jdC-2026-10-19T10:57:05 |
| treatment after fix (unit bracket made explicit) | 2/2; 0 errors | eval-nGt-2026-10-19T10:58:17 |
| trigger (description changed) | 2/2; 0 errors | eval-NOL-2026-10-19T10:58:52 |

Context size: 159 → 195 words (whitespace count, including frontmatter).
