# Evaluation evidence

Date: 19 October 2026. Subject and judge: Astra Medium (`gpt-6-astra`, medium effort) through `openai:codex-sdk`; one trial per case. Scenarios test instruction quality, not product runtime.

Split from `principle-minimize-reader-load` ("shrink mutable state toward request-owned values and explicit inputs"; "preserve shared resources under explicit owners"). The case "Flat code still has hidden state" moved here from that suite with its scenario unchanged.

| Case | Baseline | Treatment | Eval ID |
| --- | --- | --- | --- |
| Flat code still has hidden state | pass | pass | eval-efR-2026-10-19T10:48:08 |
| A reset hook does not shorten a lifetime | fail | pass | eval-efR-2026-10-19T10:48:08 |
| Screen state should end with its operation | pass | pass | eval-efR-2026-10-19T10:48:08 |

RED: the baseline failed one case. It localised the job state and rejected the mutex, but did not verify a failed export followed by another. GREEN: treatment 3/3.

| Trigger case | Assertion | Result | Eval ID |
| --- | --- | --- | --- |
| Selects relevant guidance | skill-used | pass | eval-YyL-2026-10-19T10:56:29 |
| Leaves layer tracing to its owner | not-skill-used | pass | eval-YyL-2026-10-19T10:56:29 |

No provider errors. Configuration validation passed.

## Spawned work (23 October 2026)

Same subject, judge and trial count. Step 4 now treats a spawned task, fiber, timer or background job as state with an owner that cancels and awaits it. The idea is adapted from citypaul's `functional` skill (`effect-runtime.md`, MIT), in new words.

RED (`eval-sH6-2026-10-23T13:10:26`): the unchanged skill's treatment failed "Spawned work ends with the operation that started it". It localised the import fields and cleared the timer, but left the index task to "a named background-job owner" with an open cancellation policy, and did not check for writes after the import ended. The three existing cases passed.

GREEN (`eval-oju-2026-10-23T13:12:05`): treatment 4/4.

| Case | Baseline | Treatment | Eval ID |
| --- | --- | --- | --- |
| Flat code still has hidden state | pass | pass | eval-u9l-2026-10-23T13:13:24 |
| A reset hook does not shorten a lifetime | fail | pass | eval-u9l-2026-10-23T13:13:24 |
| Screen state should end with its operation | pass | pass | eval-u9l-2026-10-23T13:13:24 |
| Spawned work ends with the operation that started it | fail | pass | eval-u9l-2026-10-23T13:13:24 |

The description did not change, so the trigger suite was not rerun. No provider errors. Configuration validation passed.
