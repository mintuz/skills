---
name: ship-pr
description: WHEN shipping finished local changes through a GitHub pull request and staying with it until the user merges; NOT for developing unfinished work or choosing substantial behavioral or conflict resolutions; commits with commit-messages, pushes, creates with gh, repairs minor CI or conflicts, and polls through merge.
---

# Ship PR

Escort finished work from the current worktree to a merged GitHub pull request.

## Prerequisites

- Load `core:commit-messages` before assessing commit boundaries or writing any commit message.
- Load `core:pr` before drafting the reviewer-first title and body or running `gh pr create`.

## Authority

Treat invocation as authorization to commit the in-scope changes, push their branch, and create or update their pull request. Treat the user as merge owner. Reserve substantial behavioral changes, ambiguous conflict choices, shared-history rewrites, and `gh pr merge` for explicit user direction.

## 1. Establish the ship set

Read repository instructions, then inspect the worktree, staged changes, branch, remotes, base branch, and GitHub authentication. Separate the intended change from unrelated user work and preserve the latter unstaged. If the current branch is the default branch, create a focused feature branch following repository naming conventions.

Run the repository's relevant local checks before committing. Fix only failures caused by the ship set and within its existing intent.

**Complete when:** the ship set and base branch are unambiguous, every intended file is accounted for, unrelated work is preserved, GitHub authentication works, and relevant local checks pass.

## 2. Commit intentionally

Use `core:commit-messages` to decide whether the ship set is one atomic commit or several and to write every message. Stage explicit paths for one logical change at a time, inspect the staged diff, and commit it. Include existing in-scope commits rather than duplicating them.

**Complete when:** every intended change is represented by atomic, why-first commits; no unrelated change is committed; and the worktree contains no uncommitted ship-set changes.

## 3. Publish the pull request

Push the current branch with an upstream. Reuse its open pull request when one exists; otherwise use `core:pr` and `gh pr create` to create a ready-for-review pull request unless the user or repository policy requires a draft. Derive the PR from the complete base-to-head diff and commit history.

Verify the PR URL, base, head branch, state, and head SHA with `gh pr view`.

**Complete when:** the remote head matches the local head and exactly one open pull request represents the ship set.

## 4. Escort until merge

Enter a persistent polling loop with bounded waits using `gh pr view`, `gh pr checks`, and `gh run view --log-failed` as needed. Check the PR state, `mergedAt`, head SHA, mergeability, review decision, and every required status check on each cycle. Use the available recurring monitor or wait mechanism; otherwise poll about every 30–60 seconds. Share concise status updates at least every 60 seconds while actively waiting.

React to each observation:

| Observation | Action |
| --- | --- |
| Checks pending | Keep polling the same head SHA. |
| Minor CI failure | Reproduce it locally, apply the smallest mechanical fix, run the failing check plus relevant tests, commit with `core:commit-messages`, push, and restart the loop on the new SHA. |
| Substantial CI failure | Report the failing job, root-cause evidence, and resolution options with tradeoffs; await direction, then resume the loop. |
| Minor merge conflict | Fetch the base, inspect both intents, update the feature branch by repository policy (merge the base when no policy exists), resolve only the unambiguous hunks, run relevant checks, commit with `core:commit-messages`, push, and restart the loop. |
| Substantial merge conflict | Keep the branch recoverable; report each conflicting intent and concrete resolution options with tradeoffs; await direction, then resume the loop. |
| Required checks successful | Report that the PR is ready and keep polling for the user's merge. |
| Review or protection gate | Report the external action required and keep polling. |
| Closed without merge | Report the terminal blocker with the PR URL and last known checks. |
| Merged | Report the PR URL and merge commit, then finish. |

A repair is **minor** only when it is localized, mechanical, intent-preserving, and verified by the failing check—for example formatting, lint autofixes, or an unambiguous adjacent-line conflict. Treat product behavior, public APIs, schemas, data, security, dependency strategy, broad cross-file conflicts, and multiple plausible outcomes as **substantial**.

Re-query after every push because checks and mergeability belong to a specific head SHA. Green checks are an intermediate state.

**Complete only when:** GitHub reports a non-null `mergedAt` for the pull request.
