# Evaluation evidence

The sections below up to "Narrowing" record the 13 October 2026 port. [Per-case results](validation-summary.json) record that port's source hashes, run IDs, scores, reasons, prior failures and limits. `upstream-before.md` is the pre-change fixture. Subject and judge used Astra Medium; one trial per case per run.

Port result: GREEN 2/2. Comparison: 2/2 baseline → 2/2 treatment. Automated triggers: 2/2.

These are instruction-quality scenarios, not executed product behavior. Trigger workspaces are separate from baseline workspaces. Existing global host metadata was not hidden. Provider errors and inappropriate execution demands in hypothetical cases are retained separately from valid RED evidence.

Strict RED/gain limits remain in the JSON. The user accepted behavior-preserving ports with explicit evidence limits on 13 October 2026; that exception does not invent a failed pre-change test or a baseline gain.

[Principle validation](../../reports/skill-audit-2026-10-13/principle-validation.md) summarizes loader resolution, representative hypothetical behavior, and the two flagged trigger results. Most processes batched twelve explicitly named skills; final laziness replays used fresh single-skill processes.

## Narrowing (19 October 2026)

The skill now carries only bounded reads, evidence pointers and optional delegation. Moved out: step 2 (conclusions with locators; facts, rejected hypotheses, decisions, open questions) → `principle-label-the-evidence`; step 4 (durable handover) and the handover half of the done-check → `principle-write-cold-handovers`; step 5 (refresh on resumption) → `principle-refresh-before-resuming`.

Suite changes: case "Handover must preserve the decision boundary" moved to `evals/principle-write-cold-handovers/`. Case "No delegation capability is available" keeps its scenario; its rubric drops the handover outcomes and adds a phase stopping condition. New case "A second question must not reload the whole payload" tests the done-check. The trigger positive now uses that case; the negative is a pause-handover request owned by `principle-write-cold-handovers`.

Treatment (`pnpm test:skills`, Astra Medium, one trial): `eval-ayd-2026-10-19T10:48:11`, 2/2 pass, no provider errors. Triggers (report-only): `eval-5ol-2026-10-19T10:48:45`, 2/2.
