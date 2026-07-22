---
name: acceptance-review
description: WHEN verifying whether a PR, branch, current code, or diff satisfies a GitHub issue, specification, acceptance criteria, or stated outcome; NOT for general code review, diff explanation, or implementation; returns a criterion-by-criterion evidence matrix and verdict.
---

# Acceptance Review

Verify behavior against an acceptance contract in a read-only pass. If the user also requests fixes, finish and report the review first, then hand the gaps to the applicable implementation workflow.

## 1. Establish the contract

Identify the review subject and comparison base, when applicable. Read the authoritative issue, specification, linked decisions, repository instructions, and stated exclusions.

Convert every normative requirement into an independently decidable criterion. Preserve source identifiers and wording; split combined requirements only where their outcomes can differ. Record the observable outcome, required surfaces and edge cases, source, assumptions, and exclusions.

**Complete when:** every in-scope requirement appears exactly once in the contract and every ambiguity is explicit.

## 2. Trace the evidence

Inspect the subject, relevant changes, and production code. For each criterion:

- Trace the real entry point through state, integrations, errors, and user-visible outcomes.
- Search every caller, implementation, and sibling surface sharing the affected behavior.
- Compare with the base only when deciding whether behavior regressed.
- Cite precise files and lines; cite tests by file and case name.

Keep evidence in separate lanes:

- **Implementation:** production wiring that can produce the required outcome.
- **Verification:** inspected tests and executed commands or runtime observations; distinguish test presence from a passing run.
- **Claims:** issue or PR prose, commit messages, names, and comments. Use these for intent, never as proof of behavior.

**Complete when:** every criterion has a traced production path or an explicit missing path, and each citation directly supports the criterion.

## 3. Check proportionally

Run the smallest checks that exercise each observable outcome. Start focused; broaden for shared code, cross-surface behavior, regressions, or higher-risk boundaries. Record each command, result, and what it proves.

Keep the reviewed subject unchanged. If a check is unavailable or cannot run, record why and leave the affected behavior unresolved.

**Complete when:** every criterion has executed evidence, decisive static evidence, or an explicit verification gap.

## 4. Decide

Assign exactly one status to each criterion:

- **Covered:** the complete production flow supports the criterion and proportionate checks pass; decisive static evidence may substitute when execution adds no information.
- **Partial:** only some required outcomes, surfaces, or edge cases are supported.
- **Missing:** the required production flow is absent or disconnected.
- **Regressed:** comparison evidence establishes that the subject broke previously supported behavior.
- **Untested:** implementation appears plausible, but neither execution nor static evidence decides the outcome.

Set the overall verdict:

- **Satisfies** only when every criterion is covered.
- **Does not satisfy** when any criterion is partial, missing, or regressed.
- **Indeterminate** when no criterion fails but at least one remains untested.

## Report

Lead with the verdict, subject, base, and authoritative sources. Then provide:

| ID | Criterion | Status | Implementation evidence | Verification evidence |
|----|-----------|--------|-------------------------|-----------------------|

List claims separately when they clarify intent. Follow with gaps, failed or unavailable checks, and the minimum next evidence or implementation needed. Keep unrelated code-review findings out of the report.
