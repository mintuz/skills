---
name: principle-preserve-unrelated-work
description: "WHEN a diff, commit or git action could touch anything outside the request; NOT for deciding whether an action is authorised at all or for syncing with a base branch; keeps unrelated behaviour, worktree changes, data and the index as found."
---

# Preserve unrelated work

Leave behaviour and edits you were not asked to change.

1. Before writing, read the worktree and index. Treat every change you did not make as someone else's work, even in the file you are editing.
2. The scope is the whole requested change and the edits it requires: when the request changes an interface, the new interface and the updated callers are in scope. Outside that scope, preserve supported behaviour (outputs, side effects, errors, ordering, concurrency, persistence, compatibility) and user data. Reformatting, renames and tidy-ups elsewhere are separate changes, proposed rather than bundled.
3. Leave others' worktree changes and the index as found. Stage and commit only your own hunks, and only when asked; when you share a file with someone's edits, select your hunks rather than the whole file. Stash, reset, checkout and discard stay off others' changes.
4. Before handing over, compare your diff and the index with the starting state. Revert each incidental change, or justify it in the report.

Distinct from: `principle-stay-in-scope` (whether an action is authorised at all), `principle-update-the-base-deliberately` (starting from or syncing with a base), `principle-clean-up-what-you-started` (tearing down resources a run created).

Done: unrelated behaviour, worktree changes and the index are unchanged, or each change is justified.
