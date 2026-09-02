---
name: frontend-testing
description: WHEN testing any front-end UI with DOM Testing Library; NOT for end-to-end browser journeys or visual-regression checks; behavior-first queries, userEvent flows, async patterns.
---

# Front-End Testing with DOM Testing Library

Framework-agnostic DOM Testing Library patterns for behavior-driven testing. For React-specific patterns (renderHook, context, components), load the `react-testing` skill. For TDD workflow (RED-GREEN-REFACTOR), load the `tdd` skill.

## Scope

This skill covers tests that run against a DOM inside a test runner, such as Vitest or Jest with jsdom.

Decline these requests and name the correct tool instead of writing the test:

- **End-to-end and cross-page journeys.** Cross-document navigation, redirects, real servers, downloads, extra browser tabs, and real cookie behaviour such as `HttpOnly`, `Secure`, and `SameSite` need Playwright or Cypress. jsdom does not navigate between documents, so a jsdom version of such a journey would prove nothing. jsdom does hold a URL and a cookie jar, so a client-side URL or `document.cookie` check inside one document is still fair game.
- **Visual appearance.** Computed layout, real fonts, screenshots, and visual-regression diffs need a real browser. jsdom does not lay out or paint, so it cannot report a size, a position, or a rendered colour.

State the boundary, name the replacement tool, and offer the part of the request that does fit in the DOM, if any part does.

`@testing-library/dom` itself exports no `render`. Mount the markup yourself. When a framework wrapper supplies `render`, this skill still governs the queries and the interactions; load `react-testing` for the React-specific parts.

## Core Philosophy

**Test behavior users see, not implementation details.**

Testing Library exists to solve a fundamental problem: tests that break when you refactor (false negatives) and tests that pass when bugs exist (false positives).

### Two Types of Users

Your UI components have two users:

1. **End-users**: Interact through the DOM (clicks, typing, reading text)
2. **Developers**: You, refactoring implementation

**Kent C. Dodds principle**: "The more your tests resemble the way your software is used, the more confidence they can give you."

### Why This Matters

**False negatives** (tests break on refactor):

```typescript
// ❌ WRONG - Testing implementation (will break on refactor)
it("should update internal state", () => {
  const component = new CounterComponent();
  component.setState({ count: 5 }); // Coupled to state implementation
  expect(component.state.count).toBe(5);
});
```

**Correct approach** (behavior-driven). Mount the component under test and let it own its markup and its event wiring. A test that writes its own listener and then asserts that listener ran proves nothing about the component:

```typescript
// ✅ CORRECT - Testing user-visible behavior
it("should submit form when user clicks submit", async () => {
  const onSubmit = vi.fn();
  const user = userEvent.setup();

  // mountLoginForm owns the markup and the event wiring under test
  mountLoginForm({ onSubmit });

  await user.type(screen.getByLabelText(/email/i), "test@example.com");
  await user.click(screen.getByRole("button", { name: /submit/i }));

  expect(onSubmit).toHaveBeenCalledTimes(1);
  expect(onSubmit).toHaveBeenCalledWith({ email: "test@example.com" });
});
```

## Quick Reference

| Topic                                  | Guide                                                                       |
| -------------------------------------- | --------------------------------------------------------------------------- |
| Query selection priority and details   | [queries.md](references/queries.md)                                         |
| userEvent patterns and interactions    | [user-events.md](references/user-events.md)                                 |
| Async testing (findBy, waitFor)        | [async-testing.md](references/async-testing.md)                             |
| MSW for API mocking                    | [msw.md](references/msw.md)                                                 |
| Common mistakes and fixes              | [anti-patterns.md](references/anti-patterns.md)                             |
| Accessibility-first testing principles | [accessibility-first-testing.md](references/accessibility-first-testing.md) |

## When to Use Each Guide

### Queries

Use [queries.md](references/queries.md) when you need:

- Query priority order (getByRole → getByLabelText → ...)
- Query variant decisions (getBy vs queryBy vs findBy)
- Common query mistakes and fixes

### User Events

Use [user-events.md](references/user-events.md) when you need:

- userEvent vs fireEvent guidance
- userEvent.setup() pattern
- Common interaction patterns (clicking, typing, keyboard)

### Async Testing

Use [async-testing.md](references/async-testing.md) when you need:

- findBy queries for async elements
- waitFor for complex conditions
- waitForElementToBeRemoved
- Loading states, API responses, debounced inputs

### MSW

Use [msw.md](references/msw.md) when you need:

- Network-level API mocking
- setupServer pattern
- Per-test handler overrides

### Anti-Patterns

Use [anti-patterns.md](references/anti-patterns.md) when you need:

- List of all common mistakes
- Quick reference of what NOT to do
- ESLint plugin setup

### Accessibility-First Testing

Use [accessibility-first-testing.md](references/accessibility-first-testing.md) when you need:

- Why accessible queries improve tests and accessibility
- When to add ARIA attributes vs semantic HTML
- Semantic HTML priority principles

## Accessible Names Come From the Markup

A role query's `name` option matches the element's accessible name. It does not match the element's text.

Some roles take their name from the author, not from their content: `status`, `alert`, `region`, `dialog`, `navigation`, and `form` among them. Their visible text is never their accessible name. Unless the markup gives them `aria-label` or `aria-labelledby`, they have no name, and `{ name: /order placed/i }` finds nothing.

Find such a region by role alone, then assert its text:

```typescript
const status = await screen.findByRole("status");
expect(status).toHaveTextContent(/order placed/i);
```

Use `{ name }` for roles that do take their name from their content, such as `button`, `link`, `heading`, and `option`.

## When No Accessible Query Fits

Work down the priority order in [queries.md](references/queries.md). An element sometimes exposes no role, label, text, alt text, or title.

Then do this:

1. Name the queries you tried and say why each one fails on the supplied markup.
2. Fix the markup when you own it. Prefer semantic HTML, then a `<label>`, then an ARIA attribute.
3. Use `getByTestId` when you cannot change the markup, for example a third-party widget. Record the reason in a comment beside the query.
4. Read raw attributes and descendants with plain DOM access on the element you already hold, such as `element.querySelector('canvas')` and `getAttribute('data-render-count')`. `screen` exposes no built-in attribute query, and no `screen.getByAttribute` exists. Testing Library can build one through `queryHelpers` and `buildQueries`, which is worth the effort only for a pattern you repeat across many tests.

Never assume a role, label, or accessible name that the supplied markup does not have. An invented accessible name produces a test that fails on the real component. Never invent a query name either: the built-in queries on `screen` are the eight `*By*` families listed in [queries.md](references/queries.md), each with its `get`, `query`, `find`, and `All` forms.

## Prove the Whole Rule

A test proves a rule only when it observes both sides of that rule.

- **Call counts.** Assert `toHaveBeenCalledTimes(n)`. `toHaveBeenCalledWith(...)` proves the arguments of one call; it does not prove how many calls happened.
- **Conditional enablement.** Assert that the control is disabled while its condition is unmet, and enabled once the condition is met.
- **Repeated interactions.** Assert the full state cycle for every repetition. A rising call count does not prove that the second attempt reached the same pending state and the same terminal state.
- **Absence.** Anchor each absence assertion to a state that can only exist after the async work finished. An absence assertion made straight after an interaction is anchored to nothing: depending on how fast the promise settles, it may run before the component could react, so it passes whether the component is correct or broken. Assert absence with `queryBy*`, which returns null for no match. It still throws when several elements match, so use `queryAllBy*` and assert an empty array when duplicates are possible. `waitForElementToBeRemoved` throws when the element is already gone at the moment you call it, so reserve it for a removal that has not happened yet.

## Summary Checklist

Before merging UI tests, verify:

- [ ] Choosing the query variant by timing: `getBy*` for state already present, `findBy*` for state that appears later, `queryBy*` for absence
- [ ] Constraining a role query by `name` only when that role has an accessible name; otherwise assert the visible text separately
- [ ] Re-querying an element by its new role or accessible name when you must prove it is discoverable under that new identity, or when the update may replace the node; an existing reference stays valid when the same node is reused
- [ ] Anchoring every absence assertion to an observable state that proves the async work finished
- [ ] Using `userEvent` with `setup()`; `fireEvent` only for an event `userEvent` does not support
- [ ] Using `screen` by default, and `within(element)` when a query must be scoped to one region; not queries bound to a container variable
- [ ] Keeping interactions and other side effects outside `waitFor` and every other retrying callback
- [ ] Asserting call counts with `toHaveBeenCalledTimes`, not with `toHaveBeenCalledWith` alone
- [ ] Using `jest-dom` matchers (`toBeInTheDocument`, `toBeDisabled`, etc.)
- [ ] Testing behavior users see, not implementation details
- [ ] ESLint plugins installed (`eslint-plugin-testing-library`, `eslint-plugin-jest-dom`)
- [ ] Resetting markup you mounted into `document.body` yourself; no manual `cleanup()` call
- [ ] MSW when the test crosses the network boundary (not `fetch` or `axios` spies); a mock for the injected function when the component receives its request function by injection
- [ ] Following TDD workflow (see `tdd` skill)
- [ ] For framework-specific patterns (React hooks, context, components), see `react-testing` skill
