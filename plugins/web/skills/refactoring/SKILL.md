---
name: refactoring
description: WHEN assessing code after green tests, deciding whether duplicated code should share an abstraction, or implementing or reviewing a behavior-preserving refactor; NOT for new behavior, defect fixes, or whole-system mechanism reduction; protects a green baseline and selects the smallest valuable structural slice.
---

# Refactoring

Use a **green baseline**: passing evidence for the observable behavior that must remain unchanged while internal structure improves.

## Choose the branch

| Request | Route |
| --- | --- |
| Assess after the TDD Green step | Follow steps 1 and 2; finish with a ranked assessment or “no refactor needed” |
| Decide whether to abstract similar code | Follow steps 1 and 2; apply the change-together test |
| Implement a requested refactor | Follow all four steps |
| Review a completed refactor | Follow steps 1, 2, and 4 read-only against the pre-refactor revision |
| Refactor front-end UI or React tests | Load `frontend-testing` and, for React, `react-testing`; use their behavior contracts as the green baseline, then follow all four steps |
| Add behavior or fix a defect | Use `tdd` until the changed behavior is green, then return here |
| Reduce branches, state, dependencies, layers, or moving parts across a whole system | Use `reducer` |

## 1. Lock the green baseline

Read the repository instructions, current diff and recent commits, target code, every caller, sibling implementation, public entry point, and affected tests. Reuse the repository's existing test and static-analysis commands.

For each affected behavior, record:

- the entry point and callers;
- the observable outcome, side effects, errors, and ordering;
- the passing test or other stable oracle that proves it.

Run the smallest affected test first, then the relevant suite. Implementation requires a committed green checkpoint before structure changes begin. When committing is outside the current authority, complete the assessment and request that checkpoint before editing.

**Complete when:** every affected behavior has a passing oracle or named proof gap; implementation has no affected proof gaps and the green baseline commit is recorded.

## 2. Select the smallest valuable slice

Inspect the complete caller path and classify each opportunity:

| Priority | Evidence | Action |
| --- | --- | --- |
| Critical | One live policy has multiple owners, or shared state or control ownership makes the current change unsafe | Refactor first |
| High | The change removes clear comprehension or change cost from live code | Refactor this session |
| Nice | The change offers a local readability gain without current leverage | Defer |
| Skip | The change is cosmetic, speculative, or couples code that only looks alike | Leave the code as-is |

Apply the **change-together test** before sharing an abstraction: the code represents the same business knowledge, its requirements would change together, and one owner is clearer than separate owners. Similar structure with independent reasons to change stays separate.

For each Critical or High candidate, name the behavior preserved, structural problem, smallest coherent change, affected callers, expected value, risk, and verification. Judge impact from real callers, change history, and affected behavior; numeric thresholds are weak evidence.

**Complete when:** every candidate is classified and the result is either “no refactor needed” with evidence or an ordered plan whose first slice has exact boundaries and proof.

## 3. Refactor in green slices

For each authorized slice:

1. Confirm the affected tests are green before the slice.
2. Make one coherent structural change while preserving public APIs, outcomes, side effects, errors, and ordering.
3. Keep behavior-facing tests unchanged. For test-code refactors, preserve `frontend-testing` behavior contracts and `react-testing` render harnesses where applicable.
4. Run the smallest affected test immediately and inspect every caller.
5. Remove superseded code, imports, branches, helpers, and comments.

Keep new helpers private to the narrowest existing owner. A failed oracle ends the slice; restore only that slice to the last green state before continuing.

**Complete when:** every selected slice passes its affected tests, every caller uses the intended structure, all superseded code is removed, and every remaining addition serves the selected slice.

## 4. Prove and report

Run the affected tests, relevant full suite, and configured type, lint, format, and build checks. Compare the final public surface and observable outcomes with the green baseline, then inspect the complete diff for behavior changes and unrelated edits.

Commit the refactor separately from feature or defect work. When a commit is requested, load `commit-messages` for its wording.

Report the green baseline, priority decision, structure changed or intentionally retained, behavior-preservation evidence, and commands and outcomes. For a review, cite each behavior change or unsupported claim with file evidence.

**Complete when:** every affected behavior matches the green baseline, every configured check passes, the refactor is isolated from behavior changes, and each unavailable verification is named.
