---
name: babysit
description: >
  WHEN a pushed branch or open PR must reach green CI without the user
  watching—monitor checks, fix failures, commit, push, and repeat until
  success, merge, or a bounded stop; NOT for creating the commit series or the
  PR itself (ship-pr), and NOT for watching many PRs as an agent inbox
  (github-monitor); asks once whether the PR needs a label, classifies every
  red check as branch, infra, or base failure, and reports each transition
  without posting PR comments.
---

# Babysit

Stay with one branch's CI until it is green and its PR merges. The user has
walked away; the loop's job is to make their return boring: either "it
merged" or one precise blocker that only they can clear.

## Prerequisites

- An existing branch pushed to the remote, with or without an open PR.
- `gh` authenticated (`gh auth status`). When the forge is not GitHub, use the
  equivalent CLI or API for every `gh` command below; the loop is the same.
- Load `core:commit-messages` before writing any fix commit.

## Authority

Treat invocation as authorization to diagnose failing checks, commit fixes,
push to the watched branch, re-trigger CI runs, and apply the label the user
approves. Reserve for explicit user direction: merging the PR yourself,
history rewrites or force-pushes, changes to product behavior beyond what the
failing check requires, and any push to the base branch or to another lane's
branch—a red there is reported, never patched uninvited.

Never post PR or issue comments about the loop's own activity—rounds fixed,
retries, status. To the reviewer that is noise; the commit history and this
session's reports are the record.

## 1. Fix the target

Identify the branch, its open PR (`gh pr view --json number,headRefName,...`),
the base branch, and the current head SHA. Every check result belongs to one
head SHA, so record it—after each push the watch must re-target the new head,
or it will report a stale verdict.

Run the repository's cheap local gates (lint, typecheck, unit tests) before
settling in to watch. A failure found locally costs seconds; the same failure
found by CI costs a full round-trip.

**Complete when:** branch, PR, base, and head SHA are explicit and local gates
pass or their failures are already being fixed.

## 2. Settle the label question

Ask once, at the start—not when CI goes green, because a label such as
`auto-merge` must already be on the PR for the forge to land it the moment
checks pass, without another round-trip through this loop.

Fetch the repository's real labels with `gh label list` and ask the user
whether this PR needs one, offering the labels that plausibly apply
(auto-merge, release, area labels). Apply the choice with
`gh pr edit --add-label`. Offer only labels that exist: the forge refuses a
label the repository does not have. If the user declines or does not answer,
proceed without one and do not ask again.

**Complete when:** the label is applied, or the user has declined, once.

## 3. Arm the watch

Prefer an event-driven watcher (a background `gh pr checks --watch`, or a
Monitor/background task that polls and exits on a state change) over ad-hoc
sleeping. Requirements for whatever mechanism is available:

- **Cadence:** 20–30 seconds while a run is in flight. CI rounds are the
  bottleneck of this whole loop; a slow poller adds dead minutes to every
  round. Back off to 15–25 minutes only when waiting on something external
  (base branch red, merge queue position).
- **Exit with names:** the watcher must surface the exact failing check
  names, not just "failed"—that is the input to classification.
- **Follow the head:** after every push, re-arm against the new head SHA.
- **Bounded:** give the watcher a time window (a few hours) so a hung run
  cannot silently absorb the session.

State once, when arming the first watch: this loop runs on the user's
machine. Server-side automation (CI, an armed auto-merge) continues if they
close the session, but red builds will wait unfixed until a session returns.

**Complete when:** a watcher is running against the current head and will
wake the loop on failure, success, or merge.

## 4. Classify every red

Diagnosis before fixing: pull the failing job's log with
`gh run view <run-id> --log-failed`. If the log API fights back—wrong run
offsets, missing runs—do not spelunk; open the workflow file, take the exact
command the failing job runs, and reproduce it locally. The local
reproduction is both the diagnosis and the fix's verification.

| Observation | Classification | Action |
| --- | --- | --- |
| Failure reproduces locally, or the log names code this branch touched | **Branch failure** | Fix it (step 5). |
| Timeouts, runner/host errors, container or network deadlines, checks that die without running tests | **Infra failure** | Cool off 10–15 minutes, re-trigger (`gh run rerun <run-id> --failed`, or an empty commit if rerun is unavailable), count a strike. After 3 strikes, stop retrying and report the exact infra action a human must take. |
| The PR's own checks are green but the base branch or merge queue is red or holding | **Base failure** | Not this PR's fault. Report plainly whose failure it is and what unblocks it, drop to the slow cadence, and keep watching—the PR lands on its own once the base recovers. |

The classification is what keeps the loop honest. Retrying an infra flake
silently reads to the user as "still failing"; fixing the base uninvited
tramples someone else's lane; treating a branch bug as a flake wastes
re-trigger rounds. Say which class each red fell into, every time.

**Complete when:** the current red has a stated class and its action is in
progress.

## 5. Fix, push, re-arm

For a branch failure:

1. Reproduce locally and apply the smallest change that makes the failing
   check pass while preserving the branch's intent. When the honest fix
   would change product behavior, a public API, a schema, or data, report
   the options instead and await direction—that decision is the user's.
2. Run the failing check locally until green, plus any gates the fix could
   plausibly break.
3. Commit with `core:commit-messages`, push, re-arm the watch on the new
   head (step 3), and continue.

If the same check fails again after a fix attempt, diagnose fresh rather
than iterating blindly; after 3 fix attempts on one check, stop and report
what was tried and what the check still says. A loop that thrashes
overnight is worse than one that stops with a clear question.

**Complete when:** the fix is pushed and the watch is re-armed, or the
attempt bound is hit and reported.

## 6. Use the wait

While CI runs, spend the round-trip pre-empting the next one: run the
remaining local gates the pushed head has not yet passed locally
(full lint, typecheck, slower suites). A failure caught here becomes part of
the next push instead of its own CI round.

Do not invent other work; the loop's scope is this branch's green.

**Complete when:** every gate that can run locally has, before CI reports.

## 7. Report, notify, stop

Report at every transition without being asked—new red (with its class and
strike/attempt count), fix pushed (with the new head SHA), green, held,
merged. The user asking "how's it looking" or "is it still failing" means
the loop's reporting has already failed.

Terminal states:

- **Merged, or green with auto-merge armed server-side:** report the PR URL
  and merge commit; send a push notification if the mechanism exists—the
  user walked away expecting exactly this message.
- **Strike or attempt bound hit:** stop all watchers, report what is red,
  what was tried, and the one action needed from the user.
- **User says stop:** kill every watcher and background task immediately,
  then report the resting state: head SHA, PR state, what stays armed
  server-side, and what a future session would pick up.

**Complete when:** the PR is merged, or the loop has stopped with nothing
still polling and the resting state reported.
