---
name: arena
description: "WHEN choosing between alternative shapes for a non-trivial artifact (code, interface, prompt, document or visual direction) by producing several independent attempts in one pass, judging them against a rubric, picking a base and grafting in the best parts of the others; NOT for raising one artifact to a confirmed external bar over repeated rounds (gauntlet-loop), tasks with one obvious answer, or broad coverage or exploration partitions; returns one synthesised artifact and a synthesis note"
---

# Arena

Produce N ≥ 2 independent candidates for the same artifact, judge them against one rubric, pick a base and graft the strongest parts of the others into it. One attempt at a non-trivial artifact locks in its first shape; the arena exposes the alternatives before that happens.

The caller supplies the artifact to produce, the shared grounding (paths), N and, optionally, a runner prompt file every candidate follows and extra rubric criteria.

Track the six phases as a checklist before drafting anything: Frame, Fan out, Cross-judge, Pick, Graft, Verify.

## Phase A: Frame

Every candidate gets the same prompt, so the prompt is the contract.

1. State the artifact each candidate produces.
2. Derive the rubric: 3–6 concrete, gradeable criteria for success on _this_ task, plus any criteria the caller supplies. The rubric is the picker's tool in Phase D; candidates see only the task.
3. Choose the mode:
   - **Delegated**: the host provides subagents _and_ the request or an active workflow (such as `adam-mode`) authorises delegation. Each candidate runs as an independent subagent. Prefer runners from different model families or providers when the host offers them. Add runners when the arena covers several design directions; reuse one runner N times when the work is generation-bound rather than judgement-sensitive.
   - **In-session**: every other case. You draft each candidate in turn.

   When the host offers a single model or provider, say so in the synthesis note: every candidate shares its blind spots.
4. Give each candidate its own output location: a git worktree where possible, otherwise a scratch directory such as `/tmp/arena-<slug>/candidate-<n>/` (`principle-separate-before-serializing-shared-state`).

**Complete when:** the artifact, the rubric, the mode, N and each candidate's output location are written down.

## Phase B: Fan out

Give each candidate the task, the shared grounding paths, its output location, the caller's runner prompt file when one exists, and one instruction: produce the artifact plus a short rationale naming the alternatives considered and what was rejected.

- **Delegated:** launch every runner at once, so none sees another's work.
- **In-session:** draft each candidate to completion and save it before reading or starting the next. Commit each to its own shape; a candidate that hedges toward a safe middle defeats the comparison.

If a candidate produces no output, continue with the rest and record the dropout. Rerun the dropouts when fewer than two candidates remain.

**Complete when:** every candidate has saved output or is recorded as a dropout.

## Phase C: Cross-judge

After every candidate finishes, run one read-only judge that wrote no candidate. Prefer a judge from a different model family or provider than the picker's. It sees the rubric and the candidates by path label, scores each criterion and recommends a base with rationale. It runs alongside your own reading in Phase D.

The judge is a subagent, so it needs the delegated mode. In in-session mode you wrote every candidate, so no independent judge exists: score alone in Phase D and record the missing independent judge as a gap in the synthesis note.

**Complete when:** the judge's per-criterion scores and recommended base exist, or the gap is recorded.

## Phase D: Pick a base

Read every candidate end to end before picking. Score each against the rubric criterion by criterion, not on holistic feel, and compare with the judge. Agreement on the base confirms the pick. Disagreement means one of you is biased or the rubric is ambiguous: read both rationales before deciding.

Pick the base a future maintainer can extend most easily without breaking invariants. When two tie, prefer the cleaner boundary or the smaller API (`principle-minimize-reader-load`).

**Complete when:** every candidate has a score per criterion and the base is named with its reason.

## Phase E: Graft

Walk each losing candidate once more for what is worth porting into the base: usually one or two things per candidate, not most of it. Fold each graft in by hand, rewritten in the base's terms, so the result stays coherent under one mental model (`principle-redesign-from-first-principles`).

When the candidates converge on one shape, that is consensus: record it and ship the consensus shape with no graft. When they diverge wildly, Phase A was under-specified: reframe and rerun from Phase A instead of averaging the divergence.

**Complete when:** each losing candidate has its grafts or a reason for none, or the run has returned to Phase A.

## Phase F: Verify

Verify the synthesised artifact like any other output (`principle-prove-it-works`). When verification finds a problem the arena missed, trace it back: either Phase A was wrong (reframe and rerun) or a candidate caught it and the graft was missed (return to Phase E). Fix it in the arena and verify again; the hand-off carries a passing result.

**Complete when:** verification passes on the synthesised artifact.

## Outputs

One synthesised artifact, with a synthesis note beside it naming:

- the base and why;
- the judge's verdict, or the missing independent judge as a gap;
- each graft with its source candidate;
- each rejection with its reason;
- any convergence, dropouts or single-provider run;
- the verification result.

A calling skill such as `architect` copies this note into its own record.
