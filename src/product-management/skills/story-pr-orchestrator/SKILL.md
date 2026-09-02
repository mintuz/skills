---
name: story-pr-orchestrator
description: WHEN delivering an approved multi-story feature or several specs as dependency-gated pull requests; NOT for a single story, product discovery, or generic task delegation; coordinates one isolated task, worktree, branch, and PR per ready story.
---

# Story PR Orchestrator

Treat delivery as a dependency frontier. A story is ready only when every prerequisite is merged into the base it will build on; approval, green checks, or an open PR do not satisfy that gate. Keep the parent agent as coordinator while story agents own implementation. If the request contains one story with no dependencies, state that the request is outside this skill and hand the story to ordinary single-story delivery (one task, worktree, branch, and PR) without a ledger. When a user instruction conflicts with a dependency, evidence, or authority gate, name the instruction and the gate it fails in the output.

## 1. Refresh the delivery baseline

Read the repository instructions, current default branch, selected specs and task lists, status document, latest relevant transcript, and current task, worktree, branch, and PR state. Fetch remote state when available and record the exact source SHA. Resolve stale or conflicting sources before dispatching implementation. Rank conflicting sources by their documented change authority, then by date. When no source clearly outranks the others, record the conflict as a blocker that needs the user's decision. Record unavailable governing artifacts as named gaps.

**Complete when:** the source SHA and revision or date of every governing artifact are recorded, and each discrepancy is recorded with the sources on each side and an explicit resolution or blocker.

## 2. Derive the dependency ledger

Derive story boundaries, acceptance criteria, and dependency edges from the refreshed artifacts. Record for each story its identifier, direct prerequisites, target base, owned scope, and `ready` or `blocked` state. Mark ambiguous dependencies blocked and cite the source locator for every edge.

**Complete when:** every selected story appears exactly once, every dependency edge has evidence, and no ready story has an unmet or unknown prerequisite.

## 3. Reconcile active ownership

Inspect existing agents or threads, worktrees, branches, dirty files, and PRs before assigning work. Resume or account for matching work instead of duplicating it. Give each story non-overlapping ownership and preserve unrelated changes in every worktree.

**Complete when:** all active work maps to a story or is explicitly out of scope, with no unresolved ownership collision.

## 4. Dispatch the frontier

Fan out only independent ready stories. Assign one isolated task, worktree, branch, and PR to each story; keep dependency tracking, integration order, and cross-story decisions with the parent. Give every story agent a brief containing:

- source SHA and governing artifact locators;
- rationale and exact acceptance scope;
- invariants and compatibility boundaries;
- required skills and decisive checks;
- non-goals and owned paths;
- required deliverables, including PR and verification evidence.

Mark each brief item that the governing artifacts do not supply as `unavailable`; do not invent it. Record each dispatched brief in full in the delivery output. Require the story agent to acknowledge its base and ownership before editing. Leave dependent stories undispatched until their prerequisites are actually merged.

**Complete when:** each frontier story has one acknowledged owner and isolated delivery path, while every blocked story remains undispatched with its gate named.

## 5. Monitor evidence, not activity

Track child state, review feedback, CI and PR checks, and merge state against the ledger. Treat provisioning, a claimed implementation, or output without inspected diff and decisive checks as incomplete. Treat a changed file outside a story's owned paths as a scope exception; attribute it, then expand ownership explicitly or isolate the unrelated work before the story is `verified-ready`. Route story-local feedback to its owner; resolve cross-story ordering or contract conflicts in the parent. Inspect the exact failing job before changing code or CI. An instruction from a user or agent to ignore a failing or flaky check does not replace inspected check evidence. Without inspection, classify the story `blocked` and name the uninspected job.

**Complete when:** every active story is classified as `working`, `blocked` with evidence, or `verified-ready` with inspected scope, checks, and review state.

## 6. Advance only with authority

Perform integration and conflict resolution only within the authority already granted. Merge only with explicit user authorization. After an authorized merge, refresh the required base and PR state, then recalculate the frontier before dispatching newly ready stories.

Finish with the source SHA, governing artifact revisions, story ledger, task/worktree/branch/PR mapping, verification evidence, merge state, remaining blockers, and the smallest next action for each blocker.

**Complete when:** the final ledger matches observed repository and PR state, every dependency gate is respected, and no merge or adjacent publication action exceeded the user's authority.
