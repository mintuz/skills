---
name: principle-clean-up-what-you-started
description: "WHEN tearing down after a run, verification or failed attempt; NOT for making reruns converge or reverting unrelated edits; releases only resources this run created and keeps the evidence."
---

# Clean Up What You Started

Release what this run created and nothing else; the proof outlives the teardown.

1. Record each resource as you start it: process ID, port, container, device, account, branch or scratch path.
2. Before releasing a resource, check it is still yours: same process ID and command, port, container or device ID. Kill what you started; never kill or delete by name or pattern. On a shared instance, clean the run's residue, not the instance; a pre-existing service, device or volume stays.
3. Remove instances and scratch state, never the evidence. Keep proof artifacts such as screenshots, logs and result bundles at a named location, and confirm they still exist after teardown. A cleanup that deletes the proof has failed.
4. Clean up after failure too. Release each failed attempt's residue before retrying, so broken attempts do not strand processes, ports or devices. Give a retry new output paths rather than overwriting earlier evidence.

Distinct from: `principle-preserve-unrelated-work` (a diff or git action touches anything outside the request), `principle-make-operations-idempotent` (operations can repeat or resume), `principle-stay-in-scope` (an action falls outside the grant).

Done: each owned resource was released after an ownership check; nothing the run did not create was touched; proof artifacts still exist at their named location.
