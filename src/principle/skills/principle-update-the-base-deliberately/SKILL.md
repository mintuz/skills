---
name: principle-update-the-base-deliberately
description: "WHEN starting work from, or syncing with, a base branch or revision; NOT for ordering the units of a change or resuming from a handover; inspects the real base, preserves dirty or shared state and updates the base only as a scoped action."
---

# Update the Base Deliberately

Treat the base as a fact to inspect and a change to authorise, never a reflex.

1. Before changing anything, inspect the actual base and any unrelated work: current revision, divergence from the intended base, dirty or untracked files, and who else depends on the branch.
2. Preserve dirty or shared state. Never stash, reset or rebase as an automatic step; do these only on an explicit request. Ordinary commits the task already authorises are unaffected. When a dirty or shared checkout would interfere, use an isolated checkout or worktree from the chosen base instead.
3. Update the base only as a deliberate, scoped action that a request explicitly covers, never as an automatic first step of other work.

Distinct from: `principle-preserve-unrelated-work` (a diff or git action touches anything outside the request), `principle-capture-the-baseline` (recording pre-change evidence), `principle-refresh-before-resuming` (resuming work or acting on a recorded status), `principle-sequence-verifiable-units` (ordering dependent changes).

Done: any base change was deliberate and scoped; dirty, untracked and shared state is preserved.
