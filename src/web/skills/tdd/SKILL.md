---
name: tdd
description: WHEN working in TDD Red-Green-Refactor; NOT ad-hoc coding; write tests first, add minimal code to green, then assess refactoring.
---

# TDD Best Practices

Test-Driven Development with behavior-focused testing, factory patterns, and the Red-Green-Refactor cycle.

## Core Principle

**Every line of new or changed behavior must be written in response to a failing test.**

This is non-negotiable. If you're typing production code that adds or changes
behavior without a failing test demanding it, you're not doing TDD. Refactoring
is the one exception: it changes structure while every test stays green, so it
demands no new failing test.

Only a test run is evidence. A compiling build, a rendering page, a type check,
or a manual inspection does not prove behavior. Code that exists without a test
run behind it is ad-hoc coding, not TDD, however well it works. At every
transition, report what you ran, what the result was, and why it counts.

## The Sacred Cycle: Red → Green → Refactor

### 1. RED - Write a Failing Test

Write one test that describes the desired behavior. Run it against the
pre-change production code. The test must fail because the behavior does not
exist yet.

A failure that names the absent unit under test is a valid RED: an unresolved
import of the module you are about to create, an undefined export you are about
to add, or a wrong, missing, or thrown result from the code under test.

Any other failure is not RED. A wrong import path, a typo in the test file, a
missing dependency, a broken runner configuration, or a compile error in
unrelated code is a harness fault. Repair the harness fault first. Preserve
unrelated work and every existing test. Rerun the test before you write
production code.

Never duplicate an existing test.

**Rules:**

- An unexpected pass is a stop condition. Do not add or adapt the
  implementation. Inspect the production code. Name the reason for the pass: the
  behavior already exists, the test is ineffective, or your own production edit
  is already in the working tree. Strengthen an ineffective test. Rerun it. Stop
  the slice when the behavior already exists.
- A pass caused by your own production edit is a false RED, not evidence.
  Reverse only your own edit. Keep the test. Rerun it. Never revert, stash, or
  reset work you did not write.
- Run the narrowest scope that exercises the new test. Then confirm the reported
  failure is the one you intended. A broad run buries that failure in unrelated
  output.
- Start with the simplest behavior
- Test ONE thing at a time. Write the next test only after the current one is
  green. Record the behaviors still to come as a list or as empty placeholders,
  never as further written tests
- Focus on business behavior, not implementation
- Use descriptive test names that document intent
- Use factory functions for test data

### 2. GREEN - Minimal Implementation

Write the **minimum** code to make the test pass. Nothing more.

**Rules:**

- Only enough code to pass the current test
- Resist "just in case" logic
- No speculative features
- If writing more than needed, STOP and question why
- After focused GREEN, run the relevant existing regression suite as a distinct
  check before declaring the slice safe.

### 3. REFACTOR - Assess and Improve

After every GREEN, assess whether refactoring would add value. Assess once per
behavior, not once after a batch of behaviors.

**Rules:**

- Secure a reversible GREEN baseline before you refactor. Commit the green
  code when you are allowed to commit. When the user forbids a commit, keep the
  green state recoverable another way. Refactor in small reversible steps.
  Never refactor code you cannot restore.
- Refactor only code that green tests already cover. To refactor untested code,
  first write a characterisation test. Run the code. Record the actual output it
  produces today. Rerun the test to green. Never change production code to
  satisfy that first expectation. Without that green characterisation test,
  leave the code alone, whether or not it looks trivial.
- External APIs stay unchanged
- All tests must still pass
- Keep the refactor separate from the behavior change
- Not all code needs refactoring - if clean, move on

## Quick Reference

| Topic                                                            | Guide                                                   |
| ---------------------------------------------------------------- | ------------------------------------------------------- |
| Red-Green-Refactor examples with step-by-step workflows          | [workflow-examples.md](references/workflow-examples.md) |
| Factory functions, composition, test organization, 100% coverage | [test-factories.md](references/test-factories.md)       |
| Critical violations, high priority issues, style improvements    | [violations.md](references/violations.md)               |
| Behavior testing patterns, test naming, and organization         | [patterns.md](references/patterns.md)                   |

## When to Use Each Guide

### Workflow Examples

Use [workflow-examples.md](references/workflow-examples.md) when you need:

- Complete TDD workflow examples (free shipping, payment validation)
- Step-by-step RED-GREEN-REFACTOR cycles
- When to refactor vs when to move on
- Refactoring assessment criteria
- Refactoring rules (reversible baseline first, preserve API, etc.)

### Test Factories

Use [test-factories.md](references/test-factories.md) when you need:

- Factory function patterns with overrides
- Why factories beat let/beforeEach
- Composing factories for complex data
- Test organization by behavior
- No 1:1 mapping between tests and implementation
- Achieving 100% coverage through behavior testing

### Violations

Use [violations.md](references/violations.md) when you need:

- Critical violations reference (production code without test, etc.)
- High priority issues (let/beforeEach, testing privates, etc.)
- Style issues (large files, duplication, magic values)
- Behavior vs implementation examples
- Quality gates checklist

### Patterns

Use [patterns.md](references/patterns.md) when you need:

- Behavior-focused testing examples
- Testing through public APIs only
- Factory patterns with schema validation
- Composing factories for complex data
- Descriptive test naming patterns
- Test organization by business behavior

## Quick Reference: Decision Trees

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

### Should I refactor?

```
Are all tests green?
├── Yes → Is the code already clean?
│   ├── Yes → Move on to the next test
│   └── No → Secure a reversible baseline, then refactor
└── No → Make tests pass first
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

## Summary Checklist

Before committing, verify:

- [ ] All new or changed behavior has a test that demanded it
- [ ] Tests verify behavior, not implementation
- [ ] Implementation is minimal (only what's needed)
- [ ] Refactoring assessment completed
- [ ] All tests pass
- [ ] Factory functions used (no `let`/`beforeEach`)
- [ ] Test names describe business behavior
- [ ] Edge cases covered
- [ ] Tests use public API only
- [ ] No testing of implementation details
- [ ] Test organization reflects business features
- [ ] 100% coverage achieved through behavior testing
