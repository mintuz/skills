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
