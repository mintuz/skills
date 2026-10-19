---
name: principle-attack-the-premise
description: "WHEN repeated fixes sharing an assumption fail the same check; NOT for a first unexplained failure or a settled mechanical edit; tests the shared premise before another fix."
---

# Attack the premise

Repeated failures can implicate the assumption every fix kept intact.

1. State that assumption in one falsifiable sentence. Record the failed approaches and the unchanged failure check.
2. Choose a competing explanation and the smallest observation that distinguishes them. Specify what result would reject each explanation before measuring.
3. Run a bounded check with existing logs, queries or instrumentation. Keep enough inputs and evidence to repeat it. Measure actor distribution only when actor assignment is relevant; an even distribution neither proves nor disproves an unrelated premise.
4. Follow the evidence to the owning cause. Change the assumption or mechanism only within the authorized scope, then repeat the original failing check. If evidence is inconclusive, name the missing observation rather than adding another compensating fix.

For a suspected saturated pool, compare acquisition wait and utilization with downstream service or client time. Low pool wait while another stage dominates rejects the pool-bottleneck hypothesis; evenly distributed workers alone does not.

Distinct from: `principle-fix-root-causes` (a reproducible defect before repeated fixes have failed), `principle-prove-it-works` (a single check fails: test the observation method and the system), `principle-redesign-from-first-principles` (a new requirement challenges an existing design; this principle questions a fact the current design assumes).

Done: the premise is supported, rejected or explicitly unresolved by a discriminating observation, and the next action follows that result.
