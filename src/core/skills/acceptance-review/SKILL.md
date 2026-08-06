---
name: acceptance-review
description: WHEN deciding whether a PR, branch, diff, or current code satisfies an authoritative issue, specification, or decision contract; NOT for reconstructing meetings, tracing decision lineage, general code review, or implementation; returns a criterion-by-criterion proof and acceptance verdict.
---

# Acceptance Review

Treat the authoritative requirement as an acceptance contract and the implementation as its proof. Run the review read-only. When fixes are also requested, finish the verdict before handing its gaps to an implementation workflow.

## 1. Build the contract

Resolve the subject, comparison base, authoritative issue, specification, or decision contract, repository rules, linked decisions, and stated exclusions. When authority begins in a meeting or transcript, or the claimed decision is disputed, invoke `decision-trace` first and consume its acceptance handoff rather than reinterpreting the raw meeting here.

Map every in-scope normative statement to one independently decidable criterion. Preserve its source identifier and meaning; split combined statements only when their outcomes can differ. Record each criterion's observable outcome, affected surfaces, edge cases, assumptions, and exclusions. Record missing or conflicting authority as an ambiguity criterion.

**Complete when:** the authoritative contract and implementation subject are explicit, every in-scope normative statement maps exactly once, and every ambiguity and exclusion is recorded.

## 2. Trace the proof

For each criterion, trace the real production path from entry point through state, boundaries, errors, and observable outcome. Search every caller, implementation, and sibling surface that shares the behavior. Use base comparison to establish regression.

Keep three evidence lanes:

| Lane | What counts |
|---|---|
| Implementation | Production wiring that can produce the outcome |
| Verification | Executed checks or runtime observations; decisive static evidence only when execution adds no information |
| Claim | Issue/PR prose, commits, names, and comments; intent context excluded from behavioral proof |

Cite the exact file and line for code. Every citation must support the criterion directly.

**Complete when:** every criterion has a complete traced path or a named break, with every implementation citation checked.

## 3. Exercise the contract

Run the smallest check that exercises each observable outcome. Broaden for shared code, cross-surface behavior, regression risk, or high-risk boundaries. Record each command, result, and what it proves. Cite tests by file and case name. Treat test presence as static coverage evidence; a passing run proves execution.

When a check is unavailable, record its reason as a verification gap.

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
