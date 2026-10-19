# Evaluation evidence

[Per-case results](validation-summary.json) record final source hashes, run IDs, scores, reasons, prior failures and limits. `upstream-before.md` is the pre-change fixture. Subject and judge used Astra Medium; one trial per case per run. Current configs load current source.

GREEN: 2/2. Comparison: 0/2 baseline → 2/2 treatment. Automated triggers: 2/2.

These are instruction-quality scenarios, not executed product behavior. Trigger workspaces are separate from baseline workspaces. Existing global host metadata was not hidden. Provider errors and inappropriate execution demands in hypothetical cases are retained separately from valid RED evidence.

Strict RED/gain limits remain in the JSON. The user accepted behavior-preserving ports with explicit evidence limits on 13 October 2026; that exception does not invent a failed pre-change test or a baseline gain.

[Principle validation](../../reports/skill-audit-2026-10-13/principle-validation.md) summarizes loader resolution, representative hypothetical behavior, and the two flagged trigger results. Most processes batched twelve explicitly named skills; final laziness replays used fresh single-skill processes.

## Narrowing, 19 October 2026

Astra Medium subject and judge; one trial per case. Step 2's concurrent-actor and shared-invariant coordination moved to `principle-separate-before-serializing-shared-state`; step 3's "reuse working infrastructure" moved to `principle-reuse-before-building`. The rubric of "Foundation is earned by the current capability" dropped those two clauses (their receiving suites carry them); the scenario is unchanged. The description now triggers on adding infrastructure or abstraction "for later".

| Run | Case | Treatment | Eval ID |
| --- | --- | --- | --- |
| test | Foundation is earned by the current capability | pass | eval-1UP-2026-10-19T10:58:06 |
| test | Similar lines need not share an abstraction | pass | eval-1UP-2026-10-19T10:58:06 |
| trigger | Selects relevant guidance (skill-used) | pass | eval-wzn-2026-10-19T11:01:02 |
| trigger | Excludes a plain translation (not-skill-used) | pass | eval-wzn-2026-10-19T11:01:02 |

No provider errors. Words after the frontmatter: 179 before, 199 after.
