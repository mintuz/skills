---
name: babysit
description: >
  WHEN a pushed branch or open PR must reach green CI without the user
  watching, or WHEN you are about to hand-write a CI poller, watcher, or
  re-run loop to escort one pushed branch—monitor checks, fix failures,
  commit, push, and repeat until success, merge, or a bounded stop; NOT for
  creating the commit series or the PR itself (ship-pr), NOT for watching many
  PRs as an agent inbox (github-monitor), and NOT for writing a poller,
  watcher, or notifier that ships as source code in a product, service, or
  repository script; works on GitHub with gh and on Forgejo or Gitea with tea,
  asks once whether the PR needs a label, classifies every red check as
  branch, infra, or base failure, and reports each transition without posting
  PR comments.
---

# Babysit

Stay with one branch's CI until it is green and its PR merges. The user has
walked away; make their return boring: either "it merged" or one precise
blocker only they can clear.

## Prerequisites

- Babysit begins only on an existing branch pushed to the remote, with or
  without an open PR. If the branch is not pushed, stop, tell the user that
  babysit starts once the branch is pushed (with or without an open PR), and
  ask them to run `ship-pr` first; do not commit, push, or open the PR under
  this skill's authority.
- Forge access:
  - GitHub: `gh` authenticated (`gh auth status`).
  - Forgejo or Gitea: `tea` logged in (`tea logins list`). `tea api <endpoint>`
    sends an authenticated request and fills `{owner}` and `{repo}` from the
    current repository, so never search the filesystem for the token. Each
    step names the `gh` command and its `tea` equivalent; the loop is the same.
- Load `core:commit-messages` before writing any fix commit.

## Authority

Invocation authorises you to diagnose failing checks, commit fixes, push to
the watched branch, re-run CI runs, and apply the label the user approves.
Reserve for explicit user direction: merging the PR yourself, history
rewrites or force-pushes, product behaviour changes beyond what the failing
check requires, and any push to the base branch or another lane's branch—a
red there is reported, never patched uninvited (`principle-stay-in-scope`).
A calling workflow may narrow this repair authority (for example, `ship-pr`
allows only mechanical, intent-preserving repairs); follow the narrower grant
and return what it reserves to the caller. No caller widens it.

Never post PR or issue comments about the loop's own activity (rounds fixed,
retries, status); to the reviewer that is noise. The commit history and this
session's reports are the record.

## 1. Fix the target

Identify the branch, its open PR, the base branch, and the current head SHA:
`gh pr view <n> --json number,headRefName,baseRefName,headRefOid`, or
`tea api '/repos/{owner}/{repo}/pulls/<n>'` (read `head.sha` and `base.ref`).
Every check result belongs to one head SHA, so record it; after each push,
re-target the watch at the new head or it reports a stale verdict.

With no PR, the base is the base branch the user names explicitly, otherwise
the remote's default branch; the watched branch is never its own base. Skip
step 2. The step 3 watch reads the head SHA's commit status, which needs no
PR.

Before any local gate or fix, anchor the local checkout: run `git fetch`,
then confirm the watched branch is checked out, the worktree is clean, and
local `HEAD` equals the observed head SHA. On any mismatch, stop and report;
never commit or push from a checkout that does not match the watched head.

Before arming the watch, run the repository's cheap local gates (lint,
typecheck, unit tests). Leave slow suites until the watch is armed, then run
every test file this branch adds or changes during the CI wait (step 6). A
local failure costs seconds; the same failure in CI costs a full round-trip.

**Complete when:** branch, base, head SHA, and the PR (when one exists) are
explicit, and the cheap gates pass locally or their failures are being fixed.

## 2. Settle the label question

Ask once, at the start, not when CI goes green: a label such as `auto-merge`
must already be on the PR for the forge to land it the moment checks pass.

Fetch the repository's real labels (`gh label list` or `tea labels ls`) and
ask whether this PR needs one, offering the labels that plausibly apply
(auto-merge, release, area labels). Offer only labels that exist; the forge
refuses any other. Apply the choice with `gh pr edit --add-label <label>` or
`tea pr edit <n> --add-labels <label>`. If the user declines or does not
answer, proceed without one and do not ask again.

**Complete when:** the label is applied, or the user has declined, once.

## 3. Arm the watch

Prefer a watcher that wakes the loop on a state change (a background
`gh pr checks --watch`, or a Monitor/background task that polls and exits on a
state change) over ad-hoc sleeping. Whatever the mechanism, it must be:

- **Structured status only:** read check state for the head SHA from the
  forge's structured status. GitHub with a PR: `gh pr checks <n> --json
  name,state,bucket`. GitHub without a PR:
  `gh api repos/{owner}/{repo}/commits/<sha>/check-runs --paginate` (read each
  `check_runs[].status` and `conclusion`) plus
  `gh api repos/{owner}/{repo}/commits/<sha>/status --paginate` for legacy
  commit statuses. Forgejo or Gitea:
  `tea api '/repos/{owner}/{repo}/commits/<sha>/status?page=<n>&limit=50'`
  (read `state` and each `statuses[].context` with its `status`; step `page`
  until `total_count` contexts are read). Never derive a verdict by grepping
  human-readable output (`tea pr <n>`, run summaries, log text) for failure
  words: "Failing" passes a grep for "failed", and the loop reports a red run
  as green.
- **Fast:** poll every 20–30 seconds while a run is in flight; CI rounds are
  the loop's bottleneck. Back off to 15–25 minutes only when waiting on
  something external (base branch red, merge queue position, a re-run a human
  must start).
- **Named:** surface the exact failing check names, not just "failed"; they
  are the input to classification.
- **On the head:** after every push, re-arm against the new head SHA.
- **Bounded:** give the watcher a time window (a few hours) so a hung run
  cannot silently absorb the session.

When arming the first watch, state once: this loop runs on the user's
machine. Server-side automation (CI, an armed auto-merge) continues if they
close the session, but red builds wait unfixed until a session returns.

**Complete when:** a watcher is running against the current head and will
wake the loop on failure, success, or merge.

## 4. Classify every red

Diagnose before fixing: pull the failing job's log by its run and job id,
selecting the run by the watched head SHA, not by branch alone. GitHub:
`gh run list --branch <branch> --commit <sha>` for the run id, then
`gh run view <run-id> --log-failed`. Forgejo or Gitea:
`tea actions runs list --branch <branch> -o json`, keep the run whose commit
is the watched head SHA, `tea actions runs view <run-id> --jobs -o json` and
pick the job whose name matches the failing check, then
`tea actions runs logs <run-id> --job <job-id>`. Never guess run or job ids.
Reproduce the failure locally with the exact command the workflow file gives
the failing job: a run with different flags, shards, or environment proves
nothing about CI. If the log API fights back (wrong run offsets, missing
runs), stop digging; the workflow file's command is still the diagnosis. The
local reproduction is both the diagnosis and the fix's verification.

| Observation | Classification | Action |
| --- | --- | --- |
| The exact CI command reproduces the failure locally on this head and passes on the base, or the log names code, configuration, or dependencies in this branch's diff (`git diff <base>...HEAD`) | **Branch failure** | Fix it (step 5). |
| Runner or host errors, container or network deadlines, forge outages, checks that die before tests run—evidence about the runner, not the tested code; a test that itself times out is a branch failure | **Infra failure** | Count a strike. Cool off 10–15 minutes. Re-run without moving the head: `gh run rerun <run-id> --failed`, or the forge's re-run API where it exists. With no re-run command or API, use the forge web UI re-run yourself if you have browser access. Without browser access, check for stacked branches: `gh pr list --base <branch>` or `tea pr ls -o json -f index,base`. No PR uses this branch as base: push an empty commit. A PR uses this branch as base: do not push, because a new head leaves every stacked branch behind; report the web UI re-run as the human action and keep watching at the slow cadence. With no re-run route at all, stop and report the blocker. After 3 strikes, stop re-running and report the exact infra action a human must take. |
| The PR's own checks are green but the base branch or merge queue is red or holding; or the same failure reproduces on the base branch without this branch's diff | **Base failure** | Not this PR's fault. Report plainly whose failure it is and what unblocks it, drop to the slow cadence, and keep watching. An armed auto-merge lands the PR once the base recovers; without one, report green and hand back. |

When the evidence is inconclusive, treat the red as a branch failure and
diagnose it (step 5); count no infra strike without runner evidence.

Count strikes and attempts per check name, not per session: a check that
fails after a different check was fixed starts its own count.

Classification keeps the loop honest: a silent infra re-run reads to the user
as "still failing", fixing the base uninvited tramples someone else's lane,
and treating a branch bug as a flake wastes re-runs. Every time, state each
red's class and name every failing check.

**Complete when:** the current red has a stated class and its action is in
progress.

## 5. Fix, push, re-arm

For a branch failure:

1. Open every repair report with the counter (starting at 1/3) and its
   bound: `Fix attempt n/3.
   If attempt 3/3 fails, stop all watchers and return the blocker to the
   user.`
2. Reproduce locally and apply the smallest change that makes the failing
   check pass while preserving the branch's intent. When the honest fix
   would change product behaviour, a public API, a schema, or data, report
   the options and await direction; that decision is the user's.
3. Run the failing check locally until green, plus any gates the fix could
   plausibly break.
4. Commit with `core:commit-messages`, push, re-arm the watch on the new
   head (step 3), and continue.

If the same check fails again, diagnose fresh rather than iterating blindly.

**Complete when:** the fix is pushed and the watch is re-armed, or the
attempt reaches 3/3 and the loop has stopped with the blocker reported.

## 6. Use the wait

While CI runs, pre-empt the next round. First run every test file this branch
adds or changes (`git diff --name-only <base>...HEAD`), slow suites included,
with the workflow file's command for them: a test never run locally is the
most likely red, so never leave it to CI alone. Then run the remaining local
gates the pushed head has not yet passed (full lint, typecheck, slower
suites). A failure caught here joins the next push instead of costing its own
CI round.

Invent no other work; the loop's scope is this branch's green.

**Complete when:** every gate that can run locally has, before CI reports.

## 7. Report, notify, stop

Report every transition unprompted: new red (with check names, class, and
strike/attempt count), fix pushed (with the new head SHA), green, held,
merged (`principle-report-every-transition`). If the user has to ask "how's
it looking" or "is it still failing", reporting has already failed.

Terminal states:

- **Green with auto-merge armed server-side:** report the head SHA and PR
  URL, and keep the watch until the merge is observed.
- **Merged:** report the PR URL and the observed merge commit; send a push
  notification if a mechanism exists (a notification hook, a terminal bell);
  otherwise the final report is the notification the user is waiting for.
- **Green without auto-merge, or a green branch with no PR:** stop all
  watchers and report the head SHA and the PR URL when one exists; merging is
  the user's decision.
- **Strike or attempt bound hit:** stop all watchers; report what is red,
  what was tried, and the one action needed from the user.
- **Watch window expired:** stop all watchers; report the head SHA, the run
  that never finished, and the action to take (cancel and re-run, or ask the
  runner's owner).
- **User says stop:** kill every watcher and background task immediately,
  then report the resting state: head SHA, PR state, what stays armed
  server-side, and what a future session would pick up.

**Complete when:** the PR is merged, or the loop has stopped with nothing
still polling and the resting state reported.
