# Running the Graph on Codex Managed Threads

Codex has no dynamic-workflow primitive — no script, no `parallel()`, no enforced schema. What it has instead is **managed threads**: a coordinator thread can create other threads, title them, read them, send messages into them, pin them, and archive them, and each thread can run in its own git worktree and branch.

Check what the session actually exposes before relying on a specific tool name; ask the coordinator to list its thread tools. The capability matters more than the naming, and the naming moves.

The property that changes the design is **durability**. A sub-agent is a one-shot tool call that dies with its parent — the context that produced an artifact is gone the moment it returns. A managed thread outlives the coordinator: you can re-enter it, message it, and let it work again with everything it already knows. That makes step 7's repair loop natively expressible here, where every ephemeral-sub-agent runtime can only fake it by re-briefing a stranger.

## Roles map to thread kinds

| Role | Thread kind | Why |
|---|---|---|
| Orchestrator | One **pinned** coordinator thread | It is the run. Pin it so it survives the workspace churn of everything it spawns |
| Worker | One **durable managed thread** per node, in its own worktree and branch | It must still be alive and in context when its verifier fails it |
| Verifier | A **fresh thread per verification round**, discarded after | Independence is the whole point, and a thread that has judged once has committed |

**Do not review with a sub-agent spawned inside the worker thread.** It is the obvious move, it is what most demonstrations of this feature show, and it is creator-verifier in name only: the sub-agent's brief is written by the builder, framed by the builder's understanding, and scoped to what the builder thinks it changed. A fresh top-level thread briefed from the contract is the only version of step 7 that holds.

## Thread titles are node identity

Title every thread `<node-id> · <deliverable>` and nothing else. The step 5 render's box identifiers must be exactly these titles, so the diagram is a legible index into the thread list rather than a separate description of it.

This is not tidiness. The reported failure mode of this feature at scale is not agents conflicting — it is the operator losing track of which conversation is which. Untitled or auto-titled threads are how a run becomes unreadable at a dozen nodes, and step 5's render only helps if its labels resolve to something you can click.

Retitle a thread if its node is re-cut. A stale title is worse than none, because it resolves to the wrong node.

## The ledger is the state; the thread list is a view

There is no script here, so nothing enforces the schedule. The coordinator is a model, and a model holding a dependency graph in its head will drift — dispatching a node whose `needs` has not merged, or forgetting an `excludes` pair three checkpoints later.

So write the ledger to a file in the repository and treat it as authoritative: nodes, assertions, edges, thread titles, verdicts, integration state. **Re-read it before every dispatch decision.** Update it immediately after every merge and every verdict. When the ledger and the thread list disagree, the ledger is wrong until you have checked the repository — thread state is what the coordinator believes, and git is what is true.

This is the discipline the dynamic-workflow runtime provides for free and Codex does not. It is the main thing to get right.

## What worktrees buy, and what they do not

Each thread in its own worktree and branch satisfies two of step 4's four conditions for free — disjoint working files, and workspace-level isolation so an unverified artifact cannot leak into a sibling's base.

It does **not** satisfy the other two, and they are the ones that bite:

- **No shared open decision.** Two threads can settle the same architectural question in different directions without touching one file. Worktrees make that invisible until merge.
- **Independently verifiable.** A node whose assertions can only be checked once a sibling lands is not independent, however isolated its branch.

Worktrees do not remove integration cost either — they defer it. Parallel branches that both touch a subsystem produce merge conflicts the coordinator has to resolve at the checkpoint, and that resolution is unverified work being done by the thread least equipped to judge it.

So keep step 4's rule: **writes serial by default**, and concurrency only when all four conditions hold. The ease of spinning up threads here is exactly the trap — the mechanism makes the cheap half of isolation free and lets you skip checking the expensive half.

## Dispatching

For each node on the frontier: create the thread, title it with the node id, put it on its own branch and worktree off the **integrated** base, and send the worker brief from `references/briefs.md` as its opening message.

The brief is the entire context. A thread you created inherits nothing from the coordinator's conversation, which is the isolation you want — so everything the node needs must be in that first message: the base, the assertions it owns, its lead and supporting skills, its owned paths, its siblings' scopes, and the shared-state locator.

Cap concurrent threads at what the step 5 render can display and the user can actually follow, and well under the account's rate limits. Both bind sooner than you expect: a run wide enough to exhaust either produces work nobody reviews.

## Skills inside a thread

Skills synced from this repository live at `~/.codex/skills/<name>/` (user-level) or `.codex/skills/<name>/` (project-level, with `codex-sync --project`). The sync copies the whole skill directory, so a node's supporting references are at `<skill>/references/` beside its `SKILL.md`.

Name the lead skill and supporting skills in the brief, and give the resolved path so the node does not hunt for it. A node that cannot find its lead skill is a node running without its method — treat a report of that as a failure to re-dispatch, not a result to accept.

## The repair loop

This is what durability is for:

1. Verifier thread returns `fail` with the single largest gap. Record it in the ledger.
2. **Send that gap to the worker's existing thread.** It still has the base, the brief, the code it wrote, and why. Send the gap only — not the verifier's full reasoning, which invites the worker to argue with the verdict instead of closing it.
3. When the worker reports the repair, open a **new** verifier thread. Never reuse the one that failed it, and never reuse the one that passed a sibling.
4. Repeat until `pass`, or until the node is escalated to the user with the rounds recorded.

On `unjudgeable`, the fix goes to the evidence path — a check that cannot run, an app that will not start — not to the artifact. Sending an `unjudgeable` to the worker as if it were a `fail` produces changes to code that was never shown to be wrong.

A **reference-judged** node runs this same loop as its `gauntlet-loop` rounds — the durable worker thread is the builder, each fresh verifier thread is the round's critic, briefed with only the baseline, a capture taken per the contract's protocol, and the threshold. The rounds stop at the depth approved in step 5, and a budget exhausted without `WIN` is recorded as `fail` with its gaps, never escalated into a pass.

**Do not archive a node's thread until its assertions pass and its handoff is cleared.** Archiving is what destroys the repair path, and it is tempting exactly when a node looks done.

## Handoffs go to files

Ask each worker to write its structured handoff (`references/briefs.md`) to a file in its worktree, not only into its chat. The coordinator reads files reliably; it reads another thread's scrollback partially and at the cost of pulling that thread's framing into its own context. The file is also what the ledger cites and what survives the thread being archived.

Read the handoff before integrating. An unaddressed `issues` or `departures` entry blocks the checkpoint, and the whole reason to record them is that somebody looks.

## Checkpoints

At each boundary: merge passed nodes in dependency order, resolve conflicts in the coordinator, fold settled decisions into shared state, re-render the graph with node classes updated, scope follow-up threads for what failed or was discovered, and recompute the frontier from what actually merged.

Archive only after the checkpoint clears. Keep the coordinator pinned across the whole run so the ledger, the render, and the thread history stay in one place.

## Usage limits and pausing

There is no background script to host a heartbeat, so the coordinator is the heartbeat: check usage headroom at the same moment you re-read the ledger — before every dispatch decision — and log it to shared state so the trend is visible. Threads burn the same account limits the coordinator does, and a run wide enough to be worth this skill is wide enough to exhaust a window mid-run.

At the threshold (90% of any limit by default), run the pause protocol from `SKILL.md` step 6, with one difference durability buys you: **parked threads stay alive.** Stop dispatching, have each in-flight thread write its partial handoff to a file in its worktree, update the ledger, schedule the resume for the window's reset, and stop. Do not archive anything — archiving on pause is how the resume path gets destroyed, for exactly the reason it is banned during the repair loop.

On resume, re-read the ledger and recompute the frontier from what actually merged, then **message each parked thread to continue**. It still holds its base, its brief, and its partial work — this is the same property that makes the repair loop native here, and it means a pause costs a Codex run almost nothing but wall-clock. Re-brief a fresh thread only if the parked one was lost, and say so in the ledger.

## Against the dynamic-workflow runtime

| | Codex threads | Dynamic workflow |
|---|---|---|
| Repair loop | Native — the worker is still alive and in context | Awkward — re-brief a fresh agent with what the last one knew |
| Mid-run inspection | Enter any node's thread and ask it | Read the journal after the fact |
| Isolation | Worktree and branch per thread, built in | `isolation: 'worktree'` per agent, opt-in |
| Ordering | Coordinator discipline against a written ledger | Deterministic — the script is the schedule |
| Output contracts | Prose in the brief; malformed output is a node failure to report | `schema` enforced at the tool layer, with retries |
| Resume after a crash | Threads are durable; the run survives | `resumeFromRunId` replays the cached prefix |
| Pause at a usage limit | Park threads live, message them to continue | `TaskStop`, then relaunch on the cached prefix |

Neither dominates. Codex is stronger where the graph needs to be *worked* — long-lived nodes, repair rounds, a user dipping into one node mid-run. The workflow runtime is stronger where the graph needs to be *executed* — many nodes, strict contracts, an ordering nobody has to remember. The failure modes are the mirror image: a workflow run drifts by discarding context the repair needed, and a thread run drifts by losing track of the schedule.
