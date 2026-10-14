# Principle validation

All 24 principle skills passed 48/48 final treatment cases. The final comparisons passed 34/48 baseline cases and 48/48 treatments: 14 improved cases, no observed regressions. These are single-trial scenario results, not statistical estimates.

| Skill | GREEN | Baseline → treatment | Automated triggers | Strict gate evidence |
|---|---:|---:|---:|---|
| [`attack-the-premise`](../../evals/principle-attack-the-premise/validation-summary.json) | 2/2 | 2/2 → 2/2 | 2/2 | Baseline tie |
| [`boundary-discipline`](../../evals/principle-boundary-discipline/validation-summary.json) | 2/2 | 2/2 → 2/2 | 2/2 | No demonstrated RED; Baseline tie |
| [`build-the-lever`](../../evals/principle-build-the-lever/validation-summary.json) | 2/2 | 1/2 → 2/2 | 2/3 | No demonstrated RED; Flagged trigger; see below |
| [`encode-lessons-in-structure`](../../evals/principle-encode-lessons-in-structure/validation-summary.json) | 2/2 | 1/2 → 2/2 | 2/2 | No demonstrated RED |
| [`exhaust-the-design-space`](../../evals/principle-exhaust-the-design-space/validation-summary.json) | 2/2 | 1/2 → 2/2 | 2/2 | Demonstrated RED and gain |
| [`experience-first`](../../evals/principle-experience-first/validation-summary.json) | 2/2 | 1/2 → 2/2 | 2/2 | Demonstrated RED and gain |
| [`explain-the-number`](../../evals/principle-explain-the-number/validation-summary.json) | 2/2 | 0/2 → 2/2 | 2/2 | Demonstrated RED and gain |
| [`fix-root-causes`](../../evals/principle-fix-root-causes/validation-summary.json) | 2/2 | 2/2 → 2/2 | 2/2 | No demonstrated RED; Baseline tie |
| [`foundational-thinking`](../../evals/principle-foundational-thinking/validation-summary.json) | 2/2 | 0/2 → 2/2 | 2/2 | Demonstrated RED and gain |
| [`guard-the-context-window`](../../evals/principle-guard-the-context-window/validation-summary.json) | 2/2 | 2/2 → 2/2 | 2/2 | No demonstrated RED; Baseline tie |
| [`laziness-protocol`](../../evals/principle-laziness-protocol/validation-summary.json) | 2/2 | 1/2 → 2/2 | 2/2 | Demonstrated RED and gain |
| [`make-operations-idempotent`](../../evals/principle-make-operations-idempotent/validation-summary.json) | 2/2 | 2/2 → 2/2 | 2/2 | Baseline tie |
| [`migrate-callers-then-delete-legacy-apis`](../../evals/principle-migrate-callers-then-delete-legacy-apis/validation-summary.json) | 2/2 | 2/2 → 2/2 | 2/2 | No demonstrated RED; Baseline tie |
| [`minimize-reader-load`](../../evals/principle-minimize-reader-load/validation-summary.json) | 2/2 | 1/2 → 2/2 | 2/2 | Demonstrated RED and gain |
| [`model-the-domain`](../../evals/principle-model-the-domain/validation-summary.json) | 2/2 | 2/2 → 2/2 | 2/2 | Baseline tie |
| [`never-block-on-the-human`](../../evals/principle-never-block-on-the-human/validation-summary.json) | 2/2 | 2/2 → 2/2 | 2/2 | Baseline tie |
| [`outcome-oriented-execution`](../../evals/principle-outcome-oriented-execution/validation-summary.json) | 2/2 | 1/2 → 2/2 | 2/2 | Demonstrated RED and gain |
| [`prove-it-works`](../../evals/principle-prove-it-works/validation-summary.json) | 2/2 | 2/2 → 2/2 | 2/2 | No demonstrated RED; Baseline tie |
| [`redesign-from-first-principles`](../../evals/principle-redesign-from-first-principles/validation-summary.json) | 2/2 | 2/2 → 2/2 | 2/2 | Baseline tie |
| [`separate-before-serializing-shared-state`](../../evals/principle-separate-before-serializing-shared-state/validation-summary.json) | 2/2 | 2/2 → 2/2 | 2/2 | Baseline tie |
| [`sequence-verifiable-units`](../../evals/principle-sequence-verifiable-units/validation-summary.json) | 2/2 | 2/2 → 2/2 | 2/2 | Baseline tie |
| [`subtract-before-you-add`](../../evals/principle-subtract-before-you-add/validation-summary.json) | 2/2 | 1/2 → 2/2 | 2/2 | Demonstrated RED and gain |
| [`test-behavior-not-implementation`](../../evals/principle-test-behavior-not-implementation/validation-summary.json) | 2/2 | 1/2 → 2/2 | 2/2 | Demonstrated RED and gain |
| [`type-system-discipline`](../../evals/principle-type-system-discipline/validation-summary.json) | 2/2 | 1/2 → 2/2 | 1/2 | Flagged trigger; see below |

Every declared skill name retains the `principle-` prefix; the table shortens labels only.

Automated triggers: **47/49**. `type-system-discipline` read the exact skill body, but a chained command failed afterwards and Promptfoo did not count the read. The extra `build-the-lever` exclusion correctly reused a query already guaranteed by the scenario to produce the required list; its grader demanded additional validation. That grade is disputed, retained unchanged, and is not evidence for rewriting the skill. The corrected positive activation passed.

The user accepted preservation ports on 13 October 2026. Missing RED and baseline ties remain facts; they are accepted exceptions for this batch, not passing measurements or changes to the repository policy.

Native Claude and OMP replays verified all 24 names and final source bodies, with representative hypothetical outputs. The raw replay JSON is not committed. Skills were explicitly invoked and generally batched twelve per fresh process; final laziness replays were isolated. This is not exhaustive behavior or live installation proof.

No target skill was injected into baseline prompts or present in their project workspaces. The new names were absent from inspected ancestor/global skill directories. Existing unrelated host metadata was not hidden. Earlier provider errors, invalid grading and the repaired laziness omission remain in per-skill records.
