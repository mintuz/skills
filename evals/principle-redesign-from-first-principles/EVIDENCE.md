# Evaluation evidence

Astra Medium; Promptfoo 0.122.2; `openai:codex-sdk` with the installed `codex` on PATH. Synthetic scenarios test instruction behavior, not product runtime.

The pre-change fixture is the pinned upstream skill in `upstream-before.md`. Copy it to the source path to reproduce the initial treatment; restore the current port afterwards. Tests use the current source, never a stale fixture.

| Stage | Result | Evidence |
| --- | --- | --- |
| red | 1/2 passed; 0 errors | [eval-zDD-2026-10-13T20:32:18](red-evidence.json) |
| green | 2/2 passed; 0 errors | [eval-G0H-2026-10-13T20:43:02](green-evidence.json) |
| compare | 4/4 passed; 0 errors; 0 improved, 0 regressed case scores versus no-skill | [eval-ygK-2026-10-13T20:48:51](compare-evidence.json) |
| trigger | 2/2 passed; 0 errors | [eval-zI5-2026-10-13T20:56:26](trigger-evidence.json) |

Configuration validation passed for the main and trigger configs. Trigger workspaces are disposable copies made by the repository runner. A skill-file read is activation evidence, not proof of correct application; exclusion is judged on the response.

Context size: 110 upstream words → 149 port words (whitespace count, including frontmatter).

The first treatment run is retained in `green-first-evidence.json`. The grader acknowledged the named requirements but deducted for unspecified detail; the rubric was clarified to accept conceptual design at the requested analysis-only stage.

Native Claude and OMP both resolved the named skill through their loaders and returned content matching the frozen source. One representative hypothetical case per host was manually reviewed. Each fresh process batched twelve skills. This is explicit invocation, not unprompted activation or product-runtime proof.

## Rerun, 19 October 2026

Added a Distinct-from line only. Description unchanged, so triggers were not rerun. Treatment-only `pnpm test:skills` (Astra Medium, one trial per case), eval `eval-Muf-2026-10-19T10:56:12`: "Design analysis does not authorize a rewrite" PASS; "Integrate a foundational requirement coherently" PASS. Provider errors: 0. `validation-summary.json` source hashes predate this edit.
