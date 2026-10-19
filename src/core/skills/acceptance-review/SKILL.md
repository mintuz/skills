---
name: acceptance-review
description: WHEN deciding whether a PR, branch, diff, or current code satisfies an authoritative issue, specification, or decision contract; NOT for reconstructing meetings, tracing decision lineage, general code review, or implementation; returns a criterion-by-criterion proof and acceptance verdict.
---

# Acceptance Review

Treat the authoritative requirement as an acceptance contract and the implementation as its proof. Review read-only (`principle-investigate-read-only`). When fixes are also requested, finish the verdict before handing its gaps to an implementation workflow.

## 1. Build the contract

Resolve the subject, comparison base, authoritative issue, specification, or decision contract, repository rules, linked decisions, and stated exclusions. When authority begins in a meeting or transcript, the claimed decision is disputed, or two policies conflict with neither marked superseded, invoke `product-management:decision-trace` first and consume its acceptance handoff instead of reinterpreting the raw source.

Map every in-scope normative statement to one independently decidable criterion. Preserve its source identifier and meaning; split combined statements only when their outcomes can differ. Record each criterion's observable outcome, affected surfaces, edge cases, assumptions, and exclusions. Represent each missing or conflicting authority question as one ambiguity criterion; defer only criteria that depend on it and continue judging criteria with settled authority.

Never select one of two competing unresolved policies as the authority, and never report a status that holds under only one of them. Test the criterion against every candidate policy, with or without a decision-lineage handoff:

- Candidates produce different statuses: mark the criterion unverified and request the lineage or supersession evidence that would select the authority.
- Every candidate produces the same status: record the conflict and report that status.
- No handoff available: also name the lineage or supersession evidence that would resolve the conflict.

When no authoritative issue, specification, or decision record is supplied, stop, say no acceptance decision is possible without it, and request one. Never build the contract from the diff, the pull request description, or the review request (`principle-fix-the-bar-first`). Route a general code-quality request to a general code review.

**Complete when:** the authoritative contract and implementation subject are explicit, every in-scope normative statement maps exactly once, and every ambiguity and exclusion is recorded.

## 2. Trace the proof

For each criterion, trace the real production path from entry point through state, boundaries, errors, and observable outcome. Search every caller, implementation, and sibling surface sharing the behaviour. Use base comparison to establish regression.

Keep three evidence lanes:

| Lane | What counts |
|---|---|
| Implementation | Production wiring that can produce the outcome |
| Verification | Executed checks or runtime observations; decisive static evidence only when execution adds no information |
| Claim | Issue/PR prose, commits, names, and comments; intent context excluded from behavioral proof |

Cite the exact file and line for code. Every citation must directly support its criterion.

**Complete when:** every criterion has a complete traced path or a named break, with every implementation citation checked.

## 3. Exercise the contract

Run the smallest check that exercises each observable outcome in the environment and for the duration the criterion names; bind live observations to the reviewed revision or deployment. Broaden for shared code, cross-surface behaviour, regression risk, or high-risk boundaries. Record each command, result, and what it proves. Cite tests by file and case name. Test presence is static coverage evidence; a passing run proves execution. Record an unavailable check's reason as a verification gap.

**Complete when:** every criterion has passing or failing executed evidence, decisive static evidence, or a named verification gap.

## 4. Decide

| Status | Meaning |
|---|---|
| Covered | The complete production path and proportionate verification evidence support the criterion |
| Partial | Some required outcomes, surfaces, or edge cases are unsupported |
| Missing | The production path is absent or disconnected |
| Regressed | Comparison evidence proves previously supported behavior broke |
| Unverified | An authority or evidence gap prevents a decision |

Set the overall verdict:

- **Satisfies** only when every criterion is covered.
- **Does not satisfy** when any criterion is partial, missing, or regressed.
- **Indeterminate** when at least one criterion is unverified and all others are covered.

**Complete when:** every criterion has exactly one status and the overall verdict follows these rules.

## 5. Report

Lead with the verdict, subject, base, and authoritative sources. Then provide:

| ID | Criterion | Status | Implementation evidence | Verification evidence |
|----|-----------|--------|-------------------------|-----------------------|

List claims separately only when they clarify intent. Follow with gaps, failed or unavailable checks, and the minimum evidence or implementation needed to close each row. Keep general code-review findings outside the acceptance report.

**Complete when:** every contract criterion appears exactly once, every citation is resolvable, and every partial, missing, regressed, or unverified row names what would close it.
