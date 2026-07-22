---
name: acceptance-review
description: WHEN deciding whether a PR, branch, diff, or current code fulfills an issue or specification; NOT for general code review, explanation, or implementation; builds an acceptance contract, proves each criterion, and returns a verdict.
---

# Acceptance Review

Treat the authoritative requirement as a contract and prove it against the implementation. Keep the review read-only; hand requested fixes to an implementation workflow after the verdict.

## 1. Build the contract

Resolve the subject, comparison base, authoritative issue or specification, repository rules, linked decisions, and stated exclusions.

Map every normative statement to one independently decidable criterion. Preserve its source identifier and meaning; split combined statements when their outcomes can differ. Record the observable outcome, affected surfaces and edge cases, assumptions, and exclusions.

**Complete when:** every in-scope normative statement maps exactly once and every ambiguity or exclusion is visible.

## 2. Build the proof

For each criterion, trace the real production path from entry point through state, boundaries, errors, and observable outcome. Search every caller, implementation, and sibling surface that shares the behavior. Compare with the base only to establish regression.

Keep three evidence lanes:

| Lane | What counts |
|---|---|
| Implementation | Production wiring that can produce the outcome |
| Verification | Executed checks or runtime observations; name the command and result |
| Claim | Issue/PR prose, commits, names, and comments; intent only, never behavioral proof |

Cite the exact file and line for code, and the file and case name for tests. Test presence is not a passing result.

**Complete when:** every criterion has a complete traced path or a named break, and every citation directly supports its row.

## 3. Exercise the contract

Run the smallest check that exercises each observable outcome. Broaden only for shared code, cross-surface behavior, regression risk, or high-risk boundaries. Record what each result proves. Keep the subject unchanged; make unavailable checks explicit.

**Complete when:** every criterion has executed evidence, decisive static evidence, or a named verification gap.

## 4. Decide

| Status | Meaning |
|---|---|
| Covered | The complete production path supports the criterion and proportionate evidence passes |
| Partial | Some required outcomes, surfaces, or edge cases are unsupported |
| Missing | The production path is absent or disconnected |
| Regressed | Comparison evidence proves previously supported behavior broke |
| Unverified | Available implementation or execution evidence cannot decide the outcome |

Set the overall verdict:

- **Satisfies** only when every criterion is covered.
- **Does not satisfy** when any criterion is partial, missing, or regressed.
- **Indeterminate** otherwise.

## Report

Lead with the verdict, subject, base, and authoritative sources. Then provide:

| ID | Criterion | Status | Implementation evidence | Verification evidence |
|----|-----------|--------|-------------------------|-----------------------|

List claims only when they clarify intent. Follow with gaps, unavailable checks, and the minimum evidence or implementation needed to close each row. Keep general code-review findings outside this report.
