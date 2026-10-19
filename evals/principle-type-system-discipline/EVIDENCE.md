# Evaluation evidence

Astra Medium; Promptfoo 0.122.2; `openai:codex-sdk` with the installed `codex` on PATH. Synthetic scenarios test instruction behavior, not product runtime.

The pre-change fixture is the pinned upstream skill in `upstream-before.md`. Copy it to the source path to reproduce the initial treatment; restore the current port afterwards. Tests use the current source, never a stale fixture.

| Stage | Result | Evidence |
| --- | --- | --- |
| red | 1/2 passed; 0 errors | [eval-GSa-2026-10-13T20:34:34](red-evidence.json) |
| green | 2/2 passed; 0 errors | [eval-nqW-2026-10-13T20:41:40](green-evidence.json) |
| compare | 3/4 passed; 0 errors; 1 improved, 0 regressed case scores versus no-skill | [eval-6FT-2026-10-13T20:52:48](compare-evidence.json) |
| trigger | 1/2 passed; 0 errors | [eval-jfk-2026-10-13T20:57:59](trigger-evidence.json) |

Configuration validation passed for the main and trigger configs. Trigger workspaces are disposable copies made by the repository runner. A skill-file read is activation evidence, not proof of correct application; exclusion is judged on the response.

Context size: 565 upstream words → 162 port words (whitespace count, including frontmatter).

Native Claude and OMP both resolved the named skill through their loaders and returned content matching the frozen source. One representative hypothetical case per host was manually reviewed. See [principle validation](../../reports/skill-audit-2026-10-13/principle-validation.md); each fresh process batched twelve skills. This is explicit invocation, not unprompted activation or product-runtime proof.

The positive trigger assertion is a false negative: the command output contains the complete current skill, but a later empty search made the chained command exit 1, so Promptfoo did not count its read. The assertion remains failed; [observed read evidence](trigger-observation.json) records the distinction.

## 19 October 2026: narrowed

The parse-untrusted and persisted-values rule moved to `principle-parse-at-the-boundary`; the description gained "NOT ... runtime validation of untrusted input" and a `Distinct from` and `Done` line. Case 2 lost its persisted-legacy sentence and rubric clause, now covered by `principle-parse-at-the-boundary` case 1, and was renamed "Exhaustive variants for a growing lifecycle". Earlier JSON evidence predates this change.

- `pnpm test:skills` `eval-k0n-2026-10-19T11:06:08`: treatment 2/2 (Astra Medium, one trial).
- `pnpm test:skills:triggers` `eval-qfT-2026-10-19T11:12:02`: 2/2. No provider errors.
