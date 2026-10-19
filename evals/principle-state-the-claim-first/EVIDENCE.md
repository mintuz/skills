# Evaluation evidence

Date: 19 October 2026. Subject and judge: Astra Medium (`gpt-6-astra`, `model_reasoning_effort: medium`), read-only Codex SDK, one trial per case per run. Suite written before SKILL.md.

## Behaviour (`pnpm eval:skills`, eval `eval-7Ye-2026-10-19T10:47:57`)

| Case | Baseline | Treatment |
|---|---|---|
| Turn a vague speed goal into a falsifiable claim before work | FAIL: proposed measuring first but deferred the metric, workload and threshold, and named no refuting result | PASS |
| A fix starts with the claim the fix must make true | FAIL: kept debounce as a hypothesis but recorded no observable done claim or refuting observation | PASS |

RED: baseline 0/2. GREEN: treatment 2/2. Provider errors: 0.

## Triggers (`pnpm test:skills:triggers`, eval `eval-KiC-2026-10-19T10:49:12`, report-only)

- `skill-used` (plan a faster nightly report job): PASS.
- `not-skill-used` (plain German translation): PASS.

These are instruction-quality scenarios, not executed product behaviour.

## 2026-10-19 review fix

Description NOT clause changed from "a single mechanical edit" to "recording the pre-change state", to match the plan trigger.

- trigger: 2/2 (eval-zTQ-2026-10-19T12:28:47)
- treatment: 2/2; 0 errors (eval-YmK-2026-10-19T12:28:48)
