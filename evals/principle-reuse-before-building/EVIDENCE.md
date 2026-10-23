# Evaluation evidence

Date: 19 October 2026. Subject and judge: Astra Medium (`gpt-6-astra`, `model_reasoning_effort: medium`) through `openai:codex-sdk`; one trial per case per run. These are read-only instruction-quality scenarios, not executed product behaviour.

New principle split from `principle-subtract-before-you-add` (existing-mechanism check), `principle-build-the-lever` step 1, `principle-foundational-thinking` step 3 and `principle-laziness-protocol` step 2. The suite and trigger config were written before SKILL.md.

## Behaviour comparison — eval-hOZ-2026-10-19T10:47:21

| Case | Baseline | Treatment |
| --- | --- | --- |
| A new screen action reuses the shared action path | FAIL (did not state that the direct store call skips the widget timeline reload) | PASS |
| An almost-sufficient command is extended, not replaced | FAIL (did not record what the existing audit already covers) | PASS |
| Working test infrastructure is reused | PASS | PASS |

RED: baseline 1/3. GREEN: treatment 3/3. Provider errors: 0.

## Triggers — eval-OOp-2026-10-19T10:48:55

2/2 passed, 0 errors: `skill-used` for a new helper request; `not-skill-used` for a redundancy-removal request owned by `principle-subtract-before-you-add`. Report-only.

## Material new dependency — 23 October 2026

Added step 5: search the repository, standard library, platform and owned dependencies in that order; compare a material new dependency with the smallest local build, with costs recorded on both sides. Two cases added: a material CSV parser decision (RED) and a spec-prescribed dependency (guard against reopening a fixed choice).

- RED, unchanged skill (eval-mkg-2026-10-23T13:10:46): material-dependency case FAIL (no platform step, no comparison with a local build, no dependency or build costs).
- GREEN (eval-aoy-2026-10-23T13:22:09, eval-GhC-2026-10-23T13:23:21): material-dependency and prescribed-dependency cases PASS in both runs.
- COMPARE (eval-e9g-2026-10-23T13:24:50):

| Case | Baseline | Treatment |
| --- | --- | --- |
| A new screen action reuses the shared action path | FAIL | FAIL |
| An almost-sufficient command is extended, not replaced | FAIL | PASS |
| Working test infrastructure is reused | PASS | PASS |
| A material new dependency is compared with the smallest local build | FAIL | PASS |
| A dependency that the spec prescribes is not compared again | PASS | PASS |

The screen-action case also failed on the unchanged skill in every run that day (eval-zlp, eval-mkg): the subject offers to extract a shared action as a fallback, and the judge reads that as more than button wiring. Step 3 is unchanged by this edit. Provider errors: 0.
