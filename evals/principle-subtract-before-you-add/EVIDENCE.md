# Evaluation evidence

Astra Medium; Promptfoo 0.122.2; `openai:codex-sdk` with the installed `codex` on PATH. Synthetic scenarios test instruction behavior, not product runtime.

The pre-change fixture is the pinned upstream skill in `upstream-before.md`. Copy it to the source path to reproduce the initial treatment; restore the current port afterwards. Tests use the current source, never a stale fixture.

| Stage | Result | Evidence |
| --- | --- | --- |
| red | 1/2 passed; 0 errors | [eval-ael-2026-10-13T20:33:41](red-evidence.json) |
| green | 2/2 passed; 0 errors | [eval-166-2026-10-13T20:40:53](green-evidence.json) |
| compare | 3/4 passed; 0 errors; 1 improved, 0 regressed case scores versus no-skill | [eval-Ljw-2026-10-13T20:51:24](compare-evidence.json) |
| trigger | 2/2 passed; 0 errors | [eval-mXw-2026-10-13T20:57:22](trigger-evidence.json) |

Configuration validation passed for the main and trigger configs. Trigger workspaces are disposable copies made by the repository runner. A skill-file read is activation evidence, not proof of correct application; exclusion is judged on the response.

Context size: 132 upstream words → 152 port words (whitespace count, including frontmatter).

Native Claude and OMP both resolved the named skill through their loaders and returned content matching the frozen source. One representative hypothetical case per host was manually reviewed. See [principle validation](../../reports/skill-audit-2026-10-13/principle-validation.md); each fresh process batched twelve skills. This is explicit invocation, not unprompted activation or product-runtime proof.

## Narrowing — 19 October 2026

Narrowed per the micro-principle plan: trigger is now "about to add a mechanism, owner, queue, validator or abstraction"; the existing-mechanism search moved to `principle-reuse-before-building` (a pointer remains in step 1); absorbed `principle-laziness-protocol` steps 2 (deletion, direct change, no unrelated cleanup or speculative layers) and 4 (smallest coherent change; more lines can be less work). Added the retired laziness case "Smallest coherent change beats smallest diff" (required-test clause moved to `principle-scale-verification`). Trigger suite: positive request rewritten for the narrowed trigger; added a `not-skill-used` case owned by `principle-minimize-reader-load`.

| Run | Result |
| --- | --- |
| compare eval-gOM-2026-10-19T10:58:42 | treatment 3/3, baseline 3/3, 0 errors (no baseline gap on these scenarios) |
| trigger eval-Qvj-2026-10-19T11:00:10 | 3/3, 0 errors |

Astra Medium, one trial per case.
