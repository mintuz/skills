---
name: principle-scale-verification
description: "WHEN choosing which checks to run on a change; NOT for designing a test's assertions or handling a failing gate; runs every required check and scales extra checks to risk and reversibility."
---

# Scale verification

Run every required check, then add checks in proportion to what a wrong result would cost.

1. State the accepted behaviour and the guarantees that must survive. Required checks are part of the job: never skip a check that repository rules, the user or the contract require in order to save effort.
2. Add further checks by risk and reversibility. One-way doors, shared contracts, data loss and a wide blast radius earn more; reversible, low-stakes steps earn fewer. Add a check only when its result could change a decision. Rigour is gates and artifacts, not trying harder.
3. Run the required and risk-relevant checks once the change is ready. Name each optional check you skip and why.
4. When a new failure or uncertainty appears, repeat or broaden the checks it warrants: rerun the failing check against the base, and widen to other consumers of anything shared. Do not dismiss a failure as flaky without evidence. If the uncertainty stays, report the remaining gap.

Distinct from: `principle-prove-it-works` (claiming a specific result works), `principle-never-weaken-a-check` (a gate fails), `principle-gaps-are-not-passes` (a check did not run or complete), `principle-test-behavior-not-implementation` (writing or reviewing a test's assertions).

Done: required checks ran; each extra check could change a decision; skipped optional checks are named; after any new failure or uncertainty, checks were repeated or broadened, or the remaining gap is reported. Saving effort never silently lowers the agreed standard.
