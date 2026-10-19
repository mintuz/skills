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
