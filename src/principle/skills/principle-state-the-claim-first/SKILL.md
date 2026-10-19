---
name: principle-state-the-claim-first
description: "WHEN starting a task, fix or benchmark; NOT for read-only explanation or recording the pre-change state; records the falsifiable claim the work must support before the first change."
---

# State the claim first

Write the claim you expect to make before you work or measure, so the checks test a sentence rather than a hope.

1. Before the first edit, run or measurement, write the claim in the words you would report: the subject, the observable result, the condition or workload, and the threshold or direction. For example: "CSV export is 30% faster at p50 on the 60k-row dataset", or "after a restart with an existing state file, the service starts and keeps its data".
2. Make it falsifiable. Name the observation that would show it false. A goal such as "make it faster" or "improve stability" is not yet a claim; turn it into one before starting, even when asked to start immediately.
3. Keep suspected causes separate from the claim. A hunch about the mechanism is a hypothesis to test; the claim is the outcome the work must make true.
4. Design the checks to test that sentence. Report whether the evidence supports, narrows or refutes it.

Distinct from: `principle-define-done` (a checkable completion criterion for any multi-step deliverable), `principle-capture-the-baseline` (recording the pre-change state), `principle-prove-it-works` (verifying the result after the work).

Done: the falsifiable claim, with its refuting observation, is recorded before the first change.
