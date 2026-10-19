# Evaluation evidence

Astra Medium; Promptfoo 0.122.2; `openai:codex-sdk` with the installed `codex` on PATH. Synthetic scenarios test instruction behavior, not product runtime.

The pre-change fixture is the pinned upstream skill in `upstream-before.md`. Copy it to the source path to reproduce the initial treatment; restore the current port afterwards. Tests use the current source, never a stale fixture.

| Stage | Result | Evidence |
| --- | --- | --- |
| red | 1/2 passed; 0 errors | [eval-nsV-2026-10-13T20:34:05](red-evidence.json) |
| green | 2/2 passed; 0 errors | [eval-dUt-2026-10-13T20:41:14](green-evidence.json) |
| compare | 3/4 passed; 0 errors; 1 improved, 0 regressed case scores versus no-skill | [eval-pOg-2026-10-13T20:52:03](compare-evidence.json) |
| trigger | 2/2 passed; 0 errors | [eval-uP3-2026-10-13T20:57:37](trigger-evidence.json) |

Configuration validation passed for the main and trigger configs. Trigger workspaces are disposable copies made by the repository runner. A skill-file read is activation evidence, not proof of correct application; exclusion is judged on the response.

Context size: 213 upstream words → 159 port words (whitespace count, including frontmatter).

Native Claude and OMP both resolved the named skill through their loaders and returned content matching the frozen source. One representative hypothetical case per host was manually reviewed. See [principle validation](../../reports/skill-audit-2026-10-13/principle-validation.md); each fresh process batched twelve skills. This is explicit invocation, not unprompted activation or product-runtime proof.

## 19 October 2026: shared-decision rule from principle-laziness-protocol

Change: added "For a shared decision, cover allowed and denied outcomes and each intentional caller difference." (moved from the retired `principle-laziness-protocol` step 5), a `Distinct from:` line and a `Done:` line. New case "A shared decision covers allowed, denied and caller differences" carries the laziness case "One decision owner beats plumbing" (scenario plus "and how to test it"; rubric limited to the testing half). Astra Medium subject and judge; no provider errors.

| Stage | Result | Evidence |
| --- | --- | --- |
| red (pre-change HEAD skill, new case, `--repeat 3`) | 0/3 passed | eval-lIe-2026-10-19T11:12:59 |
| green (edited skill, new case, `--repeat 3`) | 3/3 passed | eval-Qqv-2026-10-19T11:13:31 |
| compare (`pnpm eval:skills`) | treatment 3/3; baseline 1/3 (failed the choreography case and the new case) | eval-MTN-2026-10-19T11:10:01 |

Description unchanged, so the trigger suite was not rerun. The JSON evidence files above predate this change.
