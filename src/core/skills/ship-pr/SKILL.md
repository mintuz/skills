---
name: ship-pr
description: WHEN shipping finished local changes through a pull request on GitHub (`gh`) or on Forgejo or Gitea (`tea`) and staying with it until the user merges; NOT for developing unfinished work or choosing substantial behavioral or conflict resolutions; commits with commit-messages, pushes, creates the pull request, repairs minor CI or conflicts, and polls through merge.
---

# Ship PR

Escort finished work from the current worktree to a merged pull request on the repository's forge (the service that hosts the repository: GitHub, Forgejo, or Gitea).

## Forge and tool

Read the host from the `origin` remote URL. Treat `github.com` as GitHub. For any other host, run `gh auth status --hostname <host>`, and run `tea whoami` with the `tea` login configured for that host. Use the one tool whose probe succeeds. If neither probe or both probes succeed, stop and ask the user which forge and tool to use.

Use `gh` on GitHub. Use `tea` on Forgejo or Gitea. Where this skill names a `gh` command, run the `tea` equivalent:

- `tea whoami` verifies authentication.
- `tea pr ls` lists open pull requests. `tea pr create` creates a pull request.
- `tea api <endpoint>` sends an authenticated request to the forge API. `tea` fills `{owner}` and `{repo}` from the repository context. Replace `<index>`, `<sha>`, and `<base>` yourself with the pull request index, the head commit SHA, and the percent-encoded base branch name.
- `tea api /repos/{owner}/{repo}/pulls/<index>` returns `state`, `head.sha`, `mergeable`, `merged`, and `merged_at`.
- `tea api /repos/{owner}/{repo}/pulls/<index>/reviews` returns each review with its `state`, `dismissed`, and `stale` flags.
- `tea api /repos/{owner}/{repo}/commits/<sha>/status` returns the combined commit status.
- `tea api /repos/{owner}/{repo}/branches/<base>` returns the base branch with its effective protection: `protected`, `required_approvals`, `enable_status_check`, and `status_check_contexts`.

On Forgejo or Gitea, decide the gates from these responses. A review gate is open when a non-dismissed review has state `REQUEST_CHANGES`, or when the count of reviews with state `APPROVED`, `dismissed` false, and `stale` false is below `required_approvals`. A status gate is open when `enable_status_check` is true and any context in `status_check_contexts` is absent from the combined status or is not `success`. These fields do not cover every protection policy, for example official-review requests or approval whitelists. When they do not explain a refusal that the forge reports, report that gate as unverified and keep polling.

## Prerequisites

- Load `core:commit-messages` before assessing commit boundaries or writing any commit message.
- Load `core:pr` before drafting the reviewer-first title and body or creating the pull request.

## Authority

Treat invocation as authorization to commit the in-scope changes, push their branch, and create or update their pull request. Treat the user as merge owner. Reserve substantial behavioral changes, ambiguous conflict choices, shared-history rewrites, and merging the pull request for explicit user direction.

## 1. Establish the ship set

Read repository instructions, then inspect the worktree, staged changes, branch, remotes, base branch, and forge authentication. Fetch the intended base and branch from the observed remote base rather than a known-stale local default branch. Separate the intended change from unrelated user work and preserve the latter unstaged. If the current branch is the default branch, create a focused feature branch following repository naming conventions.

Ship only finished work. Evidence that a ship-set file is unfinished includes tests that fail because the behavior is not yet written and TODO comments for that behavior. When you observe such evidence, stop. Report the evidence that you observed, and name each failing test and each TODO so that the user can find them. Then ask the user whether to finish the work or to ship only the finished commits with the unfinished file left uncommitted and unchanged. Do not develop the missing behavior.

If the worktree lacks the repository's installed dependencies (for example, a fresh worktree with no `node_modules`), install them with the repository's package manager before any local check or commit. Commit hooks, formatters, and tests need them. Run the repository's relevant local checks, including the commands that commit hooks run, before committing. Fix only failures caused by the ship set and within its existing intent.

**Complete when:** the ship set and base branch are unambiguous, every intended file is accounted for, unrelated work is preserved, forge authentication works, dependencies are installed, and relevant local checks pass.

## 2. Commit intentionally

Use `core:commit-messages` to decide whether the ship set is one atomic commit or several and to write every message. Stage explicit paths for one logical change at a time, inspect the staged diff, and commit it. Include existing in-scope commits rather than duplicating them.

**Complete when:** every intended change is represented by atomic, why-first commits; no unrelated change is committed; and the worktree contains no uncommitted ship-set changes.

## 3. Publish the pull request

Push the current branch with an upstream. Reuse its open pull request when one exists; otherwise use `core:pr` and `gh pr create` (or `tea pr create`) to create a ready-for-review pull request unless the user or repository policy requires a draft. Derive the PR from the complete base-to-head diff and commit history.

After the initial push and every later push, run a **head checkpoint**. Require local `HEAD`, its upstream, and the PR head SHA to match. Confirm that exactly one open pull request has the intended base and head. Bind checks, mergeability, and the next bounded poll only to that SHA. Every prior-SHA verdict is stale.

**Complete when:** the head checkpoint passes.

## 4. Escort until merge

Enter a persistent polling loop with bounded waits using `gh pr view`, `gh pr checks`, and `gh run view --log-failed` (or the `tea api` calls above) as needed. Check the PR state, merged state (`mergedAt` on GitHub), head SHA, mergeability, review decision, and every required status check on each cycle. Use the available recurring monitor or wait mechanism; otherwise poll about every 30–60 seconds. Share concise status updates at least every 60 seconds while actively waiting.

React to each observation:

| Observation | Action |
| --- | --- |
| Checks pending | Keep polling the same head SHA. |
| Minor CI failure | Reproduce it locally, apply the smallest mechanical fix, run the failing check plus relevant tests, commit with `core:commit-messages`, push, and restart the loop on the new SHA. |
| Substantial CI failure | Report the failing job, root-cause evidence, and resolution options with tradeoffs; await direction, then resume the loop. |
| Minor merge conflict | Fetch the base, inspect both intents, update the feature branch by repository policy (merge the base when no policy exists), resolve only the unambiguous hunks, run relevant checks, commit with `core:commit-messages`, push, and restart the loop. |
| Substantial merge conflict | Keep the branch recoverable; report each conflicting intent with its file and symbol, and concrete resolution options, each with its tradeoff; await direction, then resume the loop. |
| Checks successful with no review or protection gate | Report that the PR is ready to merge and keep polling for the user's merge. |
| Review or protection gate | Report the external action required and keep polling. |
| Closed without merge | Stop polling. Report the terminal blocker with the PR URL, head SHA, last known checks and reviews, and any stated reason; ask the user for direction. |
| Merged | Report the PR URL and merge commit, then finish. |

A repair is **minor** only when it is localized, mechanical, intent-preserving, and verified by the failing check—for example formatting, lint autofixes, or an unambiguous adjacent-line conflict. Treat product behavior, public APIs, schemas, data, security, dependency strategy, broad cross-file conflicts, and multiple plausible outcomes as **substantial**.

Green checks are an intermediate state. Report the PR as ready to merge only after you observe that checks, review decision, and branch protection all allow the merge; report any gate you observe.

**Complete only when:** the forge reports the pull request as merged (on GitHub, a non-null `mergedAt`; on Forgejo or Gitea, `merged` true with a non-null `merged_at`). Closure without merge is a terminal blocker: it ends the loop without completing the ship, and the user's direction decides what happens next.
