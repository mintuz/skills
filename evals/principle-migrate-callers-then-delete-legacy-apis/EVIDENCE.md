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

Native Claude and OMP both resolved the named skill through their loaders and returned content matching the frozen source. One representative hypothetical case per host was manually reviewed. Each fresh process batched twelve skills. This is explicit invocation, not unprompted activation or product-runtime proof.

## 19 October 2026: kept, received a rule

Received "remove transitional and obsolete paths once their consumers and guarantees are covered" from `principle-outcome-oriented-execution`, plus a thesis, `Distinct from` and `Done` lines. New case "Transitional paths go once consumers and guarantees are covered" recreates the clause dropped from the outcome-oriented-execution suite. Description unchanged. Earlier JSON evidence predates this change.

- `pnpm test:skills` `eval-LrT-2026-10-19T11:08:08`: 2/3; new case failed only on a rubric demand for a "named" owner the scenario cannot supply. Rubric changed to "an owner and a removal condition".
- `pnpm eval:skills` `eval-BDc-2026-10-19T11:10:48`: baseline 2/3 (new case failed: kept covered paths until finance migrated, no consumer-build check); treatment 2/3 (new case omitted the consumer-build check). Skill text then tied the generated-artifact, consumer-build and reference checks to each deletion.
- `pnpm test:skills` `eval-KdB-2026-10-19T11:12:48`: treatment 3/3. No provider errors.

## 23 October 2026: published rename requests

Added the rule that a rename, retype or removal request on a contract with outside consumers asks for the new shape, not the break, with two exceptions: the owner explicitly approves the break, or the removal fixes a security or privacy exposure. The idea comes from citypaul's MIT-licensed `api-design` skill (pinned commit `cd4028d5`); the wording is new. Description unchanged, so no trigger run.

- RED `pnpm test:skills` `eval-aI8-2026-10-23T13:10:35`: treatment 3/5. The rename case failed: the treatment added `customer_id` beside `customer_ref` but did not mark `customer_ref` superseded where consumers see it. The sensitive-field case failed only on a demand to notify partners; that demand was removed from the rubric because the case guards the no-alias exception, and the unchanged skill already removed the field with no alias.
- GREEN `pnpm test:skills` `eval-grI-2026-10-23T13:13:06`: treatment 5/5. No provider errors.
- COMPARE `pnpm eval:skills` `eval-CIH-2026-10-23T13:17:35`: baseline 3/5 (rename case: no consumer-visible deprecation; transitional-paths case: no consumer-build check); treatment 5/5. No case regressed.
