# Evaluation evidence

Astra Medium; Promptfoo 0.122.2; `openai:codex-sdk` with the installed `codex` on PATH. Synthetic scenarios test instruction behavior, not product runtime.

The pre-change fixture is the pinned upstream skill in `upstream-before.md`. Copy it to the source path to reproduce the initial treatment; restore the current port afterwards. Tests use the current source, never a stale fixture.

| Stage | Result | Evidence |
| --- | --- | --- |
| red | 2/2 passed; 0 errors; no behavioral RED | [eval-zt6-2026-10-13T20:29:35](red-evidence.json) |
| prechange-trigger | 2/2 passed; 0 errors | [eval-mdN-2026-10-13T20:36:08](prechange-trigger-evidence.json) |
| green | 2/2 passed; 0 errors | [eval-wxm-2026-10-13T20:36:55](green-evidence.json) |
| compare | 4/4 passed; 0 errors; 0 improved, 0 regressed case scores versus no-skill | [eval-QoK-2026-10-13T20:54:01](compare-evidence.json) |
| trigger | 2/2 passed; 0 errors | [eval-nsV-2026-10-13T20:54:39](trigger-evidence.json) |

Configuration validation passed for the main and trigger configs. Trigger workspaces are disposable copies made by the repository runner. A skill-file read is activation evidence, not proof of correct application; exclusion is judged on the response.

Context size: 170 upstream words → 144 port words (whitespace count, including frontmatter).

Native Claude and OMP both resolved the named skill through their loaders and returned content matching the frozen source. One representative hypothetical case per host was manually reviewed. See [principle validation](../../reports/skill-audit-2026-10-13/principle-validation.md); each fresh process batched twelve skills. This is explicit invocation, not unprompted activation or product-runtime proof.
