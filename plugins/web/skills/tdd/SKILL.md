---
name: tdd
description: "WHEN working in test-driven development with Red-Green-Refactor; NOT for ad-hoc coding or retrofitting tests; writes failing test cases first, implements minimal passing code, assesses refactoring opportunities, uses factory functions for test data, and enforces behavior-focused testing through public APIs."
---

# TDD Best Practices

Test-Driven Development with behavior-focused testing, factory patterns, and the Red-Green-Refactor cycle.

## Core Principle

**Every single line of production code must be written in response to a failing test.**

This is non-negotiable. If you're typing production code without a failing test demanding it, you're not doing TDD.

## The Sacred Cycle: Red → Green → Refactor

### 1. RED - Write a Failing Test

Write a test that describes the desired behavior. The test must fail because the behavior doesn't exist yet.

**Rules:**

- Start with the simplest behavior
- Test ONE thing at a time
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

### 3. REFACTOR - Assess and Improve

With tests green, assess whether refactoring would add value.

**Rules:**

- Commit working code FIRST
- External APIs stay unchanged
- All tests must still pass
- Commit refactoring separately
- Not all code needs refactoring - if clean, move on

## Quick Reference

| Topic                                                            | Guide                                                   |
| ---------------------------------------------------------------- | ------------------------------------------------------- |
| Red-Green-Refactor examples with step-by-step workflows          | [workflow-examples.md](references/workflow-examples.md) |
| Factory functions, composition, test organization, 100% coverage | [test-factories.md](references/test-factories.md)       |
| Critical violations, high priority issues, style improvements    | [violations.md](references/violations.md)               |
| Behavior testing patterns, test naming, and organization         | [patterns.md](references/patterns.md)                   |

## Inline Example: One TDD Cycle

```typescript
// RED — describe desired behavior
test("applies 10% discount for orders over $100", () => {
  const order = createOrder({ items: [{ price: 150 }] });
  expect(calculateTotal(order)).toBe(135);
});

// GREEN — minimal implementation
function calculateTotal(order: Order): number {
  const subtotal = order.items.reduce((sum, i) => sum + i.price, 0);
  return subtotal > 100 ? subtotal * 0.9 : subtotal;
}

// REFACTOR — extract threshold/rate if needed, commit first
```

## Quick Reference: Decision Trees

### Should I write this code?

```
Is there a failing test demanding this code?
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
│   ├── Yes → Commit and move on
│   └── No → Commit first, then refactor
└── No → Make tests pass first
```

### How much code should I write?

```
Does this code make the current failing test pass?
├── Yes → Is there any code that could be removed
│         and tests still pass?
│   ├── Yes → Remove it
│   └── No → Done, commit
└── No → Keep writing minimal code
```

## Summary Checklist

Before committing, verify:

- [ ] All production code has a test that demanded it
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
