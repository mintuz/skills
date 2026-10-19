---
name: principle-refresh-before-resuming
description: "WHEN resuming work or acting on a recorded status, handover or earlier claim; NOT for writing a handover before pausing or verifying a new change; re-checks live state and marks stale claims unknown."
---

# Refresh before resuming

Treat a handover or earlier status as history until live state confirms it.

1. Read the handover or record, then list the claims your next action depends on.
2. Re-check each claim through available tools: compare the recorded revision with the current one, then check dirty work, branch or change status, and the relevant runtime or deployment identity.
3. Keep historical reports separate from current observations. A timeout, inaccessible source or stale test result leaves that claim unknown; a merge is not proof of deployment.
4. Refresh by observing, not by changing. Preserve unrelated work without resetting, rebasing or stashing it.
5. Act only on claims the refresh confirmed. Report the rest as unknown, with the observation that would settle each.

Distinct from: `principle-write-cold-handovers` (writing the record before pausing or delegating), `principle-prove-it-works` (verifying a new result), `principle-update-the-base-deliberately` (deliberately changing the base).

Done: current revision, branch, dirty work and runtime identity are re-checked, and every stale or unverifiable claim is marked unknown.
