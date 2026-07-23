---
name: ship-pr
description: WHEN publishing finished local changes through a GitHub pull request, including commit, push, creation, minor CI or conflict repair, or monitoring through user merge; NOT for unfinished implementation, PR text alone, substantial behavioral decisions, shared-history rewrites, or merging; escorts one verified ship set to mergedAt.
---

# Ship PR

Escort one finished **ship set** from the current worktree to a merged GitHub pull request.

## Prerequisites

Load only the skill whose condition fires:

| Condition | Skill |
| --- | --- |
| An issue or specification defines “finished” | Load `core:acceptance-review` before defining the ship set. |
| Commit boundaries or messages are needed | Load `core:commit-messages` before assigning changes to commits or writing messages. |
| A title/body must be drafted or a pull request created | Load `core:pr` before drafting or running `gh pr create`. |

## Authority

Invocation authorizes committing the ship set, pushing its branch, and creating or updating its pull request. The user owns merge and every substantial behavioral, ambiguous conflict, or shared-history decision. Apply those decisions only from explicit user direction.

## 1. Define the ship set

Read repository instructions and pull request templates. Inspect:

- the staged and unstaged diff, untracked files, and existing in-scope commits;
- the current, default, requested base, and upstream branches;
- remotes, GitHub authentication, and any open pull request for the head; and
- the issue or specification that defines completion, when one exists.

Map every intended change to the ship set and leave unrelated user work in place. Create a focused branch from the resolved base when the worktree is detached or on the default branch. Run the repository's relevant local checks and repair only ship-set failures within the accepted intent.

**Complete when:** the base and head are explicit; every intended file and existing commit belongs to the ship set exactly once; unrelated work is excluded; applicable acceptance evidence says **Satisfies**; GitHub authentication works; and every relevant local check passes.

## 2. Commit intentionally

Use `core:commit-messages` to map uncommitted changes to atomic commits and write every message. For each commit, stage explicit paths, inspect the staged diff, then commit. Keep existing in-scope commits instead of recreating them. Skip this step when the complete ship set is already committed.

**Complete when:** every ship-set change appears in exactly one atomic, why-first commit; every committed path is in scope; and no ship-set change remains uncommitted.

## 3. Publish one pull request

Push the head branch with an upstream, then query open pull requests for that head. Reuse the single match. When none exists, use `core:pr` and `gh pr create` to publish a ready-for-review pull request; use a draft when the user or repository policy requires one. Derive all metadata from the complete base-to-head diff, commit history, validation evidence, and stack relationship.

Verify the URL, open state, draft state, base, head branch, head SHA, title, and body with `gh pr view`. Reconcile editable metadata that does not describe the ship set. When multiple open pull requests target the same head, report their URLs and await the user's selection.

**Complete when:** local HEAD equals its upstream and GitHub reports exactly one open pull request whose verified base, head, head SHA, title, body, and draft state represent the complete ship set.

## 4. Escort until merge

Poll with bounded waits using `gh pr view`, `gh pr checks`, and `gh run view --log-failed`. On every cycle, observe the PR state, `mergedAt`, head SHA, mergeability, review decision, and every required check. Use the available monitor or wait mechanism; otherwise poll every 30–60 seconds. Share concise updates at least every 60 seconds while actively waiting.

A repair is **minor** when it is localized, mechanical, intent-preserving, and verified by the failing check, such as formatting, a lint autofix, or an unambiguous adjacent-line conflict. Product behavior, public APIs, schemas, data, security, dependency strategy, broad conflicts, and multiple plausible outcomes are **substantial**.

React to the first matching observation:

| Observation | Action |
| --- | --- |
| `mergedAt` is non-null | Report the PR URL and merge commit; finish. |
| Closed without merge | Report the terminal blocker, PR URL, and last observed checks. |
| Head SHA changed outside this workflow | Fetch and inspect it; resume after local and remote state are reconciled without discarding work. |
| Minor CI failure | Reproduce it locally, apply the smallest mechanical fix, run the failing check plus relevant tests, commit with `core:commit-messages`, push, and restart the loop on the new SHA. |
| Minor merge conflict | Fetch the base, inspect both intents, update the feature branch by repository policy (merge the base when no policy exists), resolve only the unambiguous hunks, run relevant checks, commit with `core:commit-messages`, push, and restart the loop. |
| Substantial CI failure or merge conflict | Preserve the branch; report the evidence and concrete resolution choices with tradeoffs; await user direction, then resume. |
| Required checks pending | Keep polling the same head SHA. |
| Required checks successful with a draft, review, or protection gate | Report the external action required and keep polling. |
| Required checks successful and mergeable | Report readiness and keep polling for the user's merge. |

Treat each pushed SHA as a new check cycle. Green checks are readiness evidence, while merge remains the user's action.

**Complete only when:** GitHub reports a non-null `mergedAt` for the pull request.
