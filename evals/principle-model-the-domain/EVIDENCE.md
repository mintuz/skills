# Evaluation evidence

Astra Medium; Promptfoo 0.122.2; `openai:codex-sdk` with the installed `codex` on PATH. Synthetic scenarios test instruction behavior, not product runtime.

The pre-change fixture is the pinned upstream skill in `upstream-before.md`. Copy it to the source path to reproduce the initial treatment; restore the current port afterwards. Tests use the current source, never a stale fixture.

| Stage | Result | Evidence |
| --- | --- | --- |
| red | 1/2 passed; 0 errors | [eval-qF0-2026-10-13T20:30:44](red-evidence.json) |
| green | 2/2 passed; 0 errors | [eval-W40-2026-10-13T20:37:49](green-evidence.json) |
| compare | 4/4 passed; 0 errors; 0 improved, 0 regressed case scores versus no-skill | [eval-VDe-2026-10-13T20:45:46](compare-evidence.json) |
| trigger | 2/2 passed; 0 errors | [eval-RPF-2026-10-13T20:55:19](trigger-evidence.json) |

Configuration validation passed for the main and trigger configs. Trigger workspaces are disposable copies made by the repository runner. A skill-file read is activation evidence, not proof of correct application; exclusion is judged on the response.

Context size: 296 upstream words → 146 port words (whitespace count, including frontmatter).

Native Claude and OMP both resolved the named skill through their loaders and returned content matching the frozen source. One representative hypothetical case per host was manually reviewed. See [durable native evidence](../../reports/skill-audit-2026-10-13/native-principles-replay.json); each fresh process batched twelve skills. This is explicit invocation, not unprompted activation or product-runtime proof.
