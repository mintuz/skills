# Evaluation evidence

Date: 19 October 2026. Subject and judge: Astra Medium (`gpt-6-astra`, medium effort) through `openai:codex-sdk`; one trial per case. Scenarios test instruction quality, not product runtime.

Split from `principle-experience-first` step 3 ("justify each control or option by a user need") plus upstream `principle-subtract-before-you-add` ("cut before you polish"). The library-options case replaces the option-justification clause that was dropped from the `principle-experience-first` case "A library consumer is a user".

Scenario history: the first two drafts named which elements lacked a need, and the baseline passed 3/3 both times (eval-Z4u-2026-10-19T10:50:00, eval-y50-2026-10-19T10:52:16). The scenarios were made generative, with the agent choosing the elements, and the rubrics were rewritten to match the new scenarios.

| Case | Baseline | Treatment | Eval ID |
| --- | --- | --- | --- |
| Expose only options a consumer needs | pass | pass | eval-UG3-2026-10-19T10:54:38 |
| Cut the panel before polishing it | fail | pass | eval-UG3-2026-10-19T10:54:38 |
| A section needs a reader question | fail | pass | eval-UG3-2026-10-19T10:54:38 |

RED: the baseline failed two cases because elements carried no stated need or purpose (the playback-speed control; README headings). GREEN: treatment 3/3.

| Trigger case | Assertion | Result | Eval ID |
| --- | --- | --- | --- |
| Selects relevant guidance | skill-used | pass | eval-EoX-2026-10-19T10:56:59 |
| Leaves journey observation to its owner | not-skill-used | pass | eval-EoX-2026-10-19T10:56:59 |

No provider errors. Configuration validation passed.
