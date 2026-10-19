---
name: tdd
description: WHEN working in TDD Red-Green-Refactor; NOT ad-hoc coding; write tests first, add minimal code to green, then assess refactoring.
---

# TDD Best Practices

## Core Principle

**Every line of new or changed behaviour must be written in response to a failing test.**

This is non-negotiable: production code that adds or changes behaviour without a failing test demanding it is not TDD. Refactoring is the one exception: it changes structure while every test stays green, so it demands no new failing test.

Only a test run is evidence. A compiling build, a rendering page, a type check, or a manual inspection does not prove behaviour. Code without a test run behind it is ad-hoc coding, however well it works. At every transition, report what you ran, the result, and why it counts (`principle-prove-it-works`).

## The Sacred Cycle: Red → Green → Refactor

### 1. RED - Write a Failing Test

Write one test that describes the desired behaviour. Run it against the pre-change production code. The test must fail because the behaviour does not exist yet.

A failure that names the absent unit under test is a valid RED: an unresolved import of the module you are about to create, an undefined export you are about to add, or a wrong, missing, or thrown result from the code under test.

Any other failure is a harness fault, not RED: a wrong import path, a typo in the test file, a missing dependency, a broken runner configuration, or a compile error in unrelated code. Repair the harness fault first, preserving unrelated work and every existing test. Rerun the test before you write production code.

Never duplicate an existing test.

**Rules:**

- An unexpected pass is a stop condition. Do not add or adapt the implementation. Inspect the production code and name the reason for the pass: the behaviour already exists, the test is ineffective, or your own production edit is already in the working tree. Strengthen an ineffective test and rerun it. Stop the slice when the behaviour already exists.
- A pass caused by your own production edit is a false RED, not evidence. Reverse only your own edit, keep the test, and rerun it. Never revert, stash, or reset work you did not write (`principle-preserve-unrelated-work`).
- Run the narrowest scope that exercises the new test, then confirm the failure is the one you intended. A broad run buries that failure in unrelated output.
- Start with the simplest behaviour.
- Test ONE thing at a time. Write the next test only after the current one is green. Record the behaviours still to come as a list or as empty placeholders, never as further written tests.
- Test business behaviour, not implementation (`principle-test-behavior-not-implementation`).
- Name tests to document intent.
- Use factory functions for test data.

### 2. GREEN - Minimal Implementation

Write the **minimum** code to make the current test pass. Nothing more.

**Rules:**

- No "just in case" logic or speculative features (`principle-foundational-thinking`).
- If you are writing more than the test needs, STOP and question why.
- After focused GREEN, run the relevant existing regression suite as a distinct check before declaring the slice safe (`principle-scale-verification`).

### 3. REFACTOR - Assess and Improve

After every GREEN, assess whether refactoring would add value: once per behaviour, not once after a batch. If the code is already clean, move on. The `refactoring` skill owns the full procedure; these rules apply in every cycle:

- Secure a reversible GREEN baseline first. Commit the green code when you are allowed to commit; when the user forbids a commit, keep the green state recoverable another way. Never refactor code you cannot restore (`principle-capture-the-baseline`).
- Refactor only code that green tests already cover. For untested code, first write a characterisation test that records the output the code actually produces today and passes against unchanged production code. Without it, leave the code alone, whether or not it looks trivial.
- Keep external APIs unchanged and all tests passing.
- Keep the refactor separate from the behaviour change: a separate commit, or a separate reviewable step when you cannot commit.

## Guides

| Guide | Use for |
| --- | --- |
| [workflow-examples.md](references/workflow-examples.md) | Full RED-GREEN-REFACTOR walkthroughs (free shipping, payment validation); when to refactor vs move on |
| [test-factories.md](references/test-factories.md) | Factory functions with overrides, why they beat `let`/`beforeEach`, composing factories, organising tests by behaviour, no 1:1 test-to-implementation mapping, 100% coverage through behaviour |
| [violations.md](references/violations.md) | Critical violations, high-priority issues, style issues, behaviour vs implementation examples |
| [patterns.md](references/patterns.md) | Behaviour-focused tests, public-API-only testing, factories with schema validation, composing factories, test naming and organisation |

## Decision Trees

### Should I write this code?

```
Does this code add or change behavior?
├── No (pure refactor under green tests) → Keep every test green
└── Yes → Is there a failing test demanding it?
    ├── Yes → Write minimal code to pass
    └── No → Write the failing test first
```

### Is my test good?

```
Does the test verify a business outcome?
├── Yes → Does it use the public API only?
│   ├── Yes → Does it use factory functions?
│   │   ├── Yes → Good test ✓
│   │   └── No → Refactor to use factories
│   └── No → Rewrite to avoid internals
└── No → Rewrite to focus on behavior
```

### How much code should I write?

```
Does this code make the current failing test pass?
├── Yes → Is there any code that could be removed
│         and tests still pass?
│   ├── Yes → Remove it
│   └── No → Done
└── No → Keep writing minimal code
```

## Checklist Before Committing

- [ ] All new or changed behaviour has a test that demanded it
- [ ] Tests verify behaviour through the public API only, not implementation details
- [ ] Implementation is minimal
- [ ] Refactoring assessment completed
- [ ] All tests pass
- [ ] Factory functions used (no `let`/`beforeEach`)
- [ ] Test names describe business behaviour
- [ ] Edge cases covered
- [ ] Test organisation reflects business features
- [ ] 100% coverage achieved through behaviour testing
