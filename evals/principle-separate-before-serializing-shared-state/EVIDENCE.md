# Evaluation evidence

Astra Medium; Promptfoo 0.122.2; `openai:codex-sdk` with the installed `codex` on PATH. Synthetic scenarios test instruction behavior, not product runtime.

The pre-change fixture is the pinned upstream skill in `upstream-before.md`. Copy it to the source path to reproduce the initial treatment; restore the current port afterwards. Tests use the current source, never a stale fixture.

| Stage | Result | Evidence |
| --- | --- | --- |
| red | 1/2 passed; 0 errors | [eval-qCQ-2026-10-13T20:32:48](red-evidence.json) |
| green | 2/2 passed; 0 errors | [eval-EhY-2026-10-13T20:40:00](green-evidence.json) |
| compare | 4/4 passed; 0 errors; 0 improved, 0 regressed case scores versus no-skill | [eval-AoY-2026-10-13T20:49:46](compare-evidence.json) |
| trigger | 2/2 passed; 0 errors | [eval-Ixw-2026-10-13T20:56:48](trigger-evidence.json) |

Configuration validation passed for the main and trigger configs. Trigger workspaces are disposable copies made by the repository runner. A skill-file read is activation evidence, not proof of correct application; exclusion is judged on the response.

Context size: 219 upstream words → 150 port words (whitespace count, including frontmatter).

Native Claude and OMP both resolved the named skill through their loaders and returned content matching the frozen source. One representative hypothetical case per host was manually reviewed. See [principle validation](../../reports/skill-audit-2026-10-13/principle-validation.md); each fresh process batched twelve skills. This is explicit invocation, not unprompted activation or product-runtime proof.

## 19 October 2026: kept, received a rule

Received "for each concurrent actor, ask what another actor can invalidate" from `principle-foundational-thinking` step 2, plus a thesis, `Distinct from` and `Done` lines (the final paragraph became the `Done` line). New case "Shared draft keeps atomic conflict semantics" recreates the clause dropped from the foundational-thinking suite. Description unchanged. Earlier JSON evidence predates this change.

- `pnpm test:skills` `eval-xUz-2026-10-19T11:07:16`: treatment 3/3 (Astra Medium, one trial). No provider errors.
