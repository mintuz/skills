---
name: principle-prove-it-works
description: "WHEN claiming a result is fixed, working, current or shipped, or when a check fails; NOT ritual testing of every statement; verifies the claim with the smallest direct check on the identified artifact."
---

# Prove It Works

Verify a result with the smallest direct check on the artifact the claim is about.

Name the claim, artifact revision or installed build, environment and observable result. Choose the smallest direct check that could falsify it: actual data, process identity, persisted effect or user journey. Stale screenshots, timestamps, clicks and self-reports do not prove current behavior.

Use existing repeatable checks when sufficient. Preserve commands, inputs and relevant output so another reader can reproduce the conclusion.

When a check fails, test both observation-method faults and system faults; neither is the default culprit. Bind observations to the intended process/build and state.

Distinct from: `principle-observe-dont-infer` (an effect assumed from a name, label or mode), `principle-label-the-evidence` (writing up each claim's status and evidence level), `principle-gaps-are-not-passes` (a check did not run or complete), `principle-scale-verification` (choosing how many checks to run).

Done: the check names the revision, build and environment and the observed result; after a failed check, both observation-method and system faults were tested.
