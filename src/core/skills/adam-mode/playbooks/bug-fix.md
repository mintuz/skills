# Bug fix

A reported defect, often with a screenshot or a recording. Do every step by default. When the user asks you only to diagnose or to recommend a fix, do steps 1, 2, 3 and 7, then report.

1. **Reproduce on the branch and on the base.** For a checkout of the base beside the branch, run `scripts/worktree.sh base <run-id> <base>`. If the base also fails, the branch did not cause the bug; say so. If only the branch fails, find the commit that introduced it.
2. **Test the user's theory.** Treat the theory as one hypothesis. Collect the evidence that could disprove it (principle-attack-the-premise).
3. **Find the root cause.** Trace the symptom to the first place where the system goes wrong (principle-fix-root-causes). When the evidence refutes a hypothesis, revert every change that the hypothesis motivated. A change that "might help" does not ship. For a hard or intermittent cause, such as a race, spawn two agents on different providers with the same brief and reconcile their findings.
4. **Write a failing test.** The test must fail for the reported reason (`tdd`). Commit the failing test before the fix, in its own commit.
5. **Fix the root cause.** Make the smallest change. Prefer a platform feature to new code.
6. **Prove the fix.** The test passes, and the original reproduction on the real surface no longer shows the bug. For UI, take screenshots or a recording of the running app before and after the fix. In the reply, paste the failing test output, then the passing output.
7. **Search for the same defect.** Look for the same pattern elsewhere. Fix each instance that is in scope, and list the others.
8. **Ship.** Continue with Ship in the SKILL.md.
