# Evaluation evidence

Date: 19 October 2026. Subject and judge: Astra Medium (`gpt-6-astra`, `model_reasoning_effort: medium`) through `openai:codex-sdk`; one trial per case per run. These are read-only instruction-quality scenarios, not executed product behaviour.

New principle split from `principle-laziness-protocol` step 3 and `principle-minimize-reader-load` ("derive values rather than synchronising copies"). The suite and trigger config were written before SKILL.md. "One decision owner beats plumbing" is the retired laziness case, with its allowed/denied testing clause moved to `principle-test-behavior-not-implementation`.

## Behaviour comparison

| Run | Baseline | Treatment | Notes |
| --- | --- | --- | --- |
| eval-Rdo-2026-10-19T10:49:30 | 3/3 | 3/3 | Superseded: scenarios did not expose the principle (React copy, stored totals). Both replaced with sharper scenarios. |
| eval-mO1-2026-10-19T10:51:56 | 2/3 | 2/3 | Treatment missed removing the stored cart total; step 4 now says "whether computed or stored". |
| eval-Wrp-2026-10-19T10:54:23 | 2/3 | 2/3 | Both failed only the rubric's estimate-label clause, which the plan does not carry; clause removed from the rubric. |
| eval-1l4-2026-10-19T10:56:38 | 2/3 | 3/3 | Final. |

Final case results (eval-1l4):

| Case | Baseline | Treatment |
| --- | --- | --- |
| One decision owner beats plumbing | PASS | PASS |
| Drift is removed while an intentional difference stays explicit | FAIL (no shared owner for web/mobile; billing derived separately from trialEnd) | PASS |
| A ported copy is not an owner | PASS | PASS |

RED: baseline failed the drift case (also failed in eval-mO1; passed in eval-Wrp, so the baseline gap is intermittent). GREEN: treatment 3/3. Provider errors: 0 in every run.

## Triggers — eval-Lrg-2026-10-19T10:58:18

2/2 passed, 0 errors: `skill-used` for duplicated overdue logic; `not-skill-used` for a hard-to-trace layered path owned by `principle-minimize-reader-load`. Report-only.
