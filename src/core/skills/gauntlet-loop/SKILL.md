---
name: gauntlet-loop
description: WHEN a user asks for a Gauntlet Loop or relentless improvement of an ambitious artifact against a concrete, inspectable bar; NOT for routine changes with clear acceptance tests; coordinates separate builders and fresh critics until evidence supports stopping.
---

# Gauntlet Loop

Give a lead agent the destination and bar. Let it choose the route. Keep building and judging separate.

## 1. Set the bar

State the goal as an observable outcome while preserving the user's constraints. Use a supplied reference when it is inspectable. Otherwise propose the strongest concrete comparison or measurement available. For a quantitative outcome, state a specific value at a stated scale. For a qualitative outcome, state the reference or the observable criteria. Explain its relevance in one sentence. Ask the user to confirm or amend it before round 1. A placeholder that the user must fill later is not a bar.

Define how a critic can compare the real artifact with the bar:

| Artifact | Useful bar |
|---|---|
| Visual product | Rendered reference, screenshots, or interaction recording |
| Software system | Passing behavior, performance, recovery, or security checks |
| Writing | Reference passages plus factual and structural checks |
| Research | Source quality, coverage criteria, and reproducible calculations |

For a visual bar, fix the capture protocol alongside the reference — viewport, theme, seed data, animation state — so both sides of every comparison are captured the same way. A comparison whose two sides were captured differently returns `UNJUDGEABLE`, and the loop then repairs the inspection path instead of the artifact.

When rounds capture screenshots, choose one capture mechanism for the whole run and use only that one. Number the files per round — for example `round2/01-empty-state.png` — so each round diffs cleanly against the baseline.

For a visual artifact, pin the design tokens, visual motifs, and any taste constraints in the bar before round 1. A taste rejection that arrives after a `WIN` means the bar was incomplete.

When the failure modes depend on scale, build or obtain a realistic-scale fixture before you set the bar. A small fixture hides the defects the loop exists to find.

Name any resource limit. Name the materiality threshold below which a remaining gap does not justify another round. Name the allowed stop conditions. State the limit and the threshold as specific values. Exhaustion is a stopping reason, never evidence that the bar was met.

**Complete when:** the goal, inspectable bar, comparison method, materiality threshold, and stop policy are explicit.

## 2. Split at judging seams

Inspect the task and current artifact, then divide only the important parts that can be built and judged independently. Keep tightly coupled parts together. Use one loop when decomposition adds no independent judgment.

Assign each part to a builder and reserve a separate critic context. Declare dependencies between parts so independent work can run in parallel without conflicting edits.

**Complete when:** every important part has a judging seam, an owner, and declared integration dependencies.

## 3. Build the artifact

Give each builder the goal, relevant bar and rules, the actual inputs, and an isolated editable workspace. When the artifact lives in a git repository, that workspace is the builder's own git worktree on its own branch, and the rest of this section applies. Each builder commits its own round work on its own branch. No builder in a run uses `git stash`: all worktrees of one repository share one stash list, so a stash pop can restore another builder's edits. A builder that must set work aside commits it.

Share one worktree between builders only when the host cannot create separate worktrees. When the host can create them, move each builder into its own worktree before the next round. In a shared worktree, all builders work on the run branch and run no git write commands. State in each brief for a shared worktree that every git command that changes the branch, index, or working tree (stash, checkout, switch, reset, restore, clean, add, commit) is forbidden there. A builder that needs a forbidden operation stops and reports to the lead. A shared worktree has one index, so at the end of each round the lead alone commits, one commit per builder, and each commit contains only that builder's files. The lead obtains the state it needs, such as a baseline on `main`, from a separate worktree or clone. When no separate worktree or clone is available, the lead reports that state as unobtainable instead of changing the shared worktree.

Let the builder choose the implementation. Require it to produce or modify the real artifact and run the smallest checks needed to make that artifact inspectable.

The builder reports the artifact and evidence, not a quality verdict.

**Complete when:** every active part has an inspectable artifact and its checks or render path work.

## 4. Run the gauntlet

For each judging round, launch a fresh critic with only:

- the goal and relevant constraints;
- the bar and comparison method;
- the real artifact and raw evidence.

Withhold the builder's history, rationale, summaries, and claimed quality. Ask the critic to inspect the artifact itself, use a blind A/B comparison when practical, and return:

1. `WIN`, `LOSE`, or `UNJUDGEABLE`;
2. direct comparison evidence;
3. the single largest meaningful gap if the artifact loses.

On `LOSE`, send that gap to the builder, repair it, and use another fresh critic. On `UNJUDGEABLE`, repair the inspection path or sharpen the bar before changing the artifact. Freeze a part only on `WIN` or an explicit stop condition.

**Complete when:** every active part has fresh, artifact-level evidence and either wins or has exactly one next gap.

## 5. Converge

Repeat build and gauntlet rounds without choosing an arbitrary round count. Maintain a compact ledger:

| Round | Part | Verdict | Evidence | Largest gap | Repair |
|---|---|---|---|---|---|

For a git-backed artifact, name a branch for the run and end each round with a commit on it. For any other artifact, end each round with a checkpoint copy of the artifact. When builders have their own branches, the lead merges each builder branch into the run branch. The lead never stashes, resets, or discards a builder's uncommitted edits. An interrupt then strands at most one round of work.

State in each round's report how many rounds the run has used against the agreed budget and stop policy. The loop must end by that policy, not by a user interrupt.

Stop a loop only when the artifact wins, the user stops it, the named resource limit is reached, or the remaining improvement is below the agreed materiality threshold. Record unmet gaps whenever a loop stops without winning.

For long unattended runs, maintain a lightweight progress artifact only when the user needs to observe evolution without interrupting the loop.

**Complete when:** every part has a terminal verdict or named stop reason, with no claimed win unsupported by comparison evidence.

## 6. Integrate and judge whole

Integrate completed parts and run the relevant whole-artifact checks. When separately improved parts conflict, use one fresh smoothing pass to resolve only integration inconsistencies. Then give a fresh critic the complete artifact and original bar.

**Complete when:** the integrated artifact has been inspected against the original bar, relevant checks pass, and every remaining gap or stop reason is explicit.

## Report

Lead with the whole-artifact verdict, bar, and direct evidence. List rounds per part, each closed gap with the round that closed it, verification results, unresolved gaps, and the exact reason for stopping.
