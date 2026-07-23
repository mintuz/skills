---
name: tdd
description: WHEN adding or changing production behavior, fixing a defect, or auditing whether work followed TDD Red-Green-Refactor; NOT for test-only coverage of unchanged behavior, behavior-preserving refactoring after green, or ad-hoc coding outside a behavior change; proves one observable behavior at a time with evidenced Red, minimal Green, and an explicit Refactor decision.
---

# TDD

A **behavior slice** is one externally observable outcome small enough for one Red-Green pass. Complete one slice before starting the next. Production changes begin only after the current slice is observably Red.

## Choose the branch

| Request | Route |
| --- | --- |
| Add or change production behavior | Follow all four steps |
| Fix a defect | Follow all four steps; the first Red test reproduces the defect through its public boundary |
| Audit whether completed work followed TDD | Follow steps 1 and 4 read-only and load the audit reference |
| Add tests for unchanged behavior | Use the relevant testing skill; use this skill only if production behavior will change |
| Refactor behavior-preserving code after Green | Use `refactoring` |
| Set repository-wide TDD policy or working agreements | Use `expectations` |

Apply `frontend-testing` to rendered DOM contracts and `react-testing` to React render harnesses. They own their testing surfaces; this skill owns Red-Green-Refactor sequencing.

## 1. Inventory behavior slices

Read the repository instructions, requirement, public entry point, callers, current implementation, nearest tests, existing helpers and factories, and configured test commands. For a defect, trace the failing path to its behavior owner.

List every requested observable outcome, including applicable success, error, boundary, and side-effect cases. Record existing coverage, then select the smallest unproved behavior slice.

Read every reference whose condition matches before writing the test:

| Condition | Required reference |
| --- | --- |
| Choosing a public test surface, behavior name, boundary, or test double | [Behavior patterns](references/patterns.md) |
| Creating or changing structured test data, fixtures, or setup | [Test data factories](references/test-factories.md) |
| Needing a worked feature or defect cycle | [Workflow examples](references/workflow-examples.md) |
| Auditing TDD evidence or diagnosing a broken cycle | [Audit evidence and violations](references/violations.md) |

**Complete when:** every requested outcome is inventoried with its coverage state, every matching reference has been read, and one unproved slice has a public test surface and smallest runnable test command.

## 2. RED — prove the gap

Write one test for the selected slice through the public behavior boundary. Give it one reason to fail and a name that states the observable outcome. Reuse the repository's runner, test location, helpers, factories, and boundary fakes.

Run the smallest command that selects the test. The failure must come from the missing or incorrect behavior: an assertion mismatch, expected error, or absent side effect. Repair scoped syntax, import, fixture, and environment failures; isolate or record unrelated baseline failures until the test reaches that diagnostic Red state.

If the test passes before production changes, record that the slice already exists and return to step 1. Keep the production path at its pre-slice state throughout Red.

**Complete when:** exactly one scoped test fails for the expected behavior reason, the command and relevant failure are recorded, and unrelated failures are distinguished from the Red evidence.

## 3. GREEN — satisfy only the slice

Change the smallest production owner that can satisfy the failing test. Every changed production line must serve the current behavior slice. Reuse existing code and installed dependencies; defer the next outcome until its own Red test demands it.

Run the same targeted command until it passes, then run the smallest suite that covers the affected callers. Inspect the diff and remove production code the current and previously green tests do not require.

**Complete when:** the Red test and every previously green affected test pass, the failure disappeared for the intended behavior reason, and each production change maps to the current slice.

Return to step 1 for the next unproved slice. Reach step 4 only after every inventoried outcome is covered or explicitly excluded from scope.

## 4. REFACTOR — decide, prove, report

With all behavior slices Green, load `refactoring` and assess the changed production and test code. Record “no refactor needed” when structure is already clear. When a refactor has current value, preserve a committed Green checkpoint when commit authority exists and follow that skill in a separate behavior-preserving change.

For a TDD audit, use the audit reference to map every changed behavior to temporal Red and Green evidence. Assess the Refactor phase only when it is part of the claim under review.

Run the relevant suite and configured type, lint, format, build, and coverage checks. Treat coverage as evidence for the behavior inventory and repository threshold, rather than a substitute for observable contracts.

For each slice, report:

- the behavior and public test;
- the Red command and expected failure;
- the Green command and result;
- the refactor decision.

**Complete when:** every inventoried outcome has Red and Green evidence or a named coverage or scope disposition, the refactor decision is recorded, every configured check passes, and each unavailable check is named.
