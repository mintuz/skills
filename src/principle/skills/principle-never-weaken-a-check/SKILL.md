---
name: principle-never-weaken-a-check
description: "WHEN a test, lint, threshold, rubric or other gate fails; NOT for choosing which checks to run or setting criteria before an evaluation; fixes the work, or changes the gate only for an evidenced contract change or defect, in its own change."
---

# Never weaken a check

When a gate fails, fix the work, not the gate.

1. Treat the failure as evidence about the work until shown otherwise. Do not edit expected values to match current output, widen a tolerance or threshold, skip, quarantine, retry until green or suppress a rule merely to pass.
2. Change a check only for one of two reasons, and cite it: the expected behaviour genuinely changed (name the issue, specification or decision), or the check itself is defective (show the defect, such as a wrong oracle or a dependence on unrelated state).
3. Make that change in its own change, separate from the work it judges, with the reason recorded. A wrong gate is fixed, not routed around.
4. Leave other failing gates as they are. A contract change justifies updating the checks for that contract, not loosening unrelated ones in the same change.

Distinct from: `principle-scale-verification` (choosing which checks to run), `principle-fix-the-bar-first` (fixing selection criteria before comparing candidates), `principle-gaps-are-not-passes` (a check did not run or complete), `principle-fix-root-causes` (repairing the defect a failure reveals).

Done: the gate is unchanged, or the change cites the new contract or the defect and lands in its own change.
