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

Native Claude and OMP both resolved the named skill through their loaders and returned content matching the frozen source. One representative hypothetical case per host was manually reviewed. Each fresh process batched twelve skills. This is explicit invocation, not unprompted activation or product-runtime proof.

## Narrowing, 19 October 2026

Astra Medium subject and judge; one trial per case. The shrink-mutable-state rule and the shared-resource ownership rule moved to `principle-narrow-state-lifetime`; "put each invariant at its owning boundary" moved to `principle-parse-at-the-boundary`; "derive rather than synchronise" moved to `principle-derive-from-one-owner`. The case "Flat code still has hidden state" moved, unchanged in scenario, to `evals/principle-narrow-state-lifetime`. It was replaced here by "A broad mirror interface hides no decision", which tests interfaces that hide decisions and retained ownership. Its first rubric demanded narrowing the mirror interface, which the plan's done-check does not require; the rubric now accepts collapsing or narrowing it, provided no remaining layer merely forwards.

| Run | Case | Baseline | Treatment | Eval ID |
| --- | --- | --- | --- | --- |
| test (first rubric) | One implementation can hide a real boundary | — | pass | eval-Xqp-2026-10-19T10:57:33 |
| test (first rubric) | A broad mirror interface hides no decision | — | fail | eval-Xqp-2026-10-19T10:57:33 |
| compare | One implementation can hide a real boundary | fail | pass | eval-wqm-2026-10-19T10:59:14 |
| compare | A broad mirror interface hides no decision | fail | pass | eval-wqm-2026-10-19T10:59:14 |
| trigger | Applies to the principle decision (skill-used) | — | pass | eval-AG3-2026-10-19T11:00:33 |
| trigger | Does not impose a workflow on a literal conversion | — | pass | eval-AG3-2026-10-19T11:00:33 |

No provider errors. Words after the frontmatter: 134 before, 167 after (the `Distinct from:` line, the overlap note and the `Done:` line were added).
