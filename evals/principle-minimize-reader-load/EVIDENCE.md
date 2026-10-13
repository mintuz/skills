# Evaluation evidence

Astra Medium; Promptfoo 0.122.2; `openai:codex-sdk` with the installed `codex` on PATH. Synthetic scenarios test instruction behavior, not product runtime.

The pre-change fixture is the pinned upstream skill in `upstream-before.md`. Copy it to the source path to reproduce the initial treatment; restore the current port afterwards. Tests use the current source, never a stale fixture.

| Stage | Result | Evidence |
| --- | --- | --- |
| red | 0/2 passed; 0 errors | [eval-Je0-2026-10-13T20:30:17](red-evidence.json) |
| green | 2/2 passed; 0 errors | [eval-FMv-2026-10-13T20:42:32](green-evidence.json) |
| compare | 3/4 passed; 0 errors; 1 improved, 0 regressed case scores versus no-skill | [eval-6bK-2026-10-13T20:44:57](compare-evidence.json) |
| trigger | 2/2 passed; 0 errors | [eval-Eas-2026-10-13T20:54:56](trigger-evidence.json) |

Configuration validation passed for the main and trigger configs. Trigger workspaces are disposable copies made by the repository runner. A skill-file read is activation evidence, not proof of correct application; exclusion is judged on the response.

Context size: 306 upstream words → 158 port words (whitespace count, including frontmatter).

The first treatment run is retained in `green-first-evidence.json`. Reader-load gained an explicit shared-resource ownership rule.

Native Claude and OMP both resolved the named skill through their loaders and returned content matching the frozen source. One representative hypothetical case per host was manually reviewed. See [durable native evidence](../../reports/skill-audit-2026-10-13/native-principles-replay.json); each fresh process batched twelve skills. This is explicit invocation, not unprompted activation or product-runtime proof.
