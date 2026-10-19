---
name: frontend-testing
description: WHEN testing any front-end UI with DOM Testing Library; NOT for end-to-end browser journeys or visual-regression checks; behavior-first queries, userEvent flows, async patterns.
---

# Front-End Testing with DOM Testing Library

Framework-agnostic DOM Testing Library patterns for behaviour-driven testing. For React-specific patterns (renderHook, context, components), load the `react-testing` skill. For the TDD workflow (RED-GREEN-REFACTOR), load the `tdd` skill.

## Scope

This skill covers tests that run against a DOM inside a test runner, such as Vitest or Jest with jsdom.

Decline these requests and name the correct tool instead of writing the test:

- **End-to-end and cross-page journeys.** Cross-document navigation, redirects, real servers, downloads, extra browser tabs, and real cookie behaviour such as `HttpOnly`, `Secure`, and `SameSite` need Playwright or Cypress. jsdom does not navigate between documents, so a jsdom version of such a journey proves nothing. jsdom does hold a URL and a cookie jar, so a client-side URL or `document.cookie` check inside one document is still fair game.
- **Visual appearance.** Computed layout, real fonts, screenshots, and visual-regression diffs need a real browser. jsdom does not lay out or paint, so it cannot report a size, a position, or a rendered colour.

State the boundary, name the replacement tool, and offer the part of the request that fits in the DOM, if any (`principle-state-the-scope`).

`@testing-library/dom` exports no `render`; mount the markup yourself. When a framework wrapper supplies `render`, this skill still governs the queries and the interactions; load `react-testing` for the React-specific parts.

## Core Philosophy

**Test behaviour users see, not implementation details.** Implementation-coupled tests break on refactor, a false negative; shallow tests pass while bugs exist, a false positive (`principle-test-behavior-not-implementation`).

The UI has two users: **end-users**, who interact through the DOM (clicks, typing, reading text), and **developers**, who refactor the implementation. Kent C. Dodds: "The more your tests resemble the way your software is used, the more confidence they can give you."

```typescript
// ❌ WRONG - Testing implementation (will break on refactor)
it("should update internal state", () => {
  const component = new CounterComponent();
  component.setState({ count: 5 }); // Coupled to state implementation
  expect(component.state.count).toBe(5);
});
```

Mount the component under test and let it own its markup and event wiring. A test that writes its own listener and then asserts that listener ran proves nothing about the component:

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

## Guides

| Guide | Load for |
| --- | --- |
| [queries.md](references/queries.md) | Query priority order (getByRole → getByLabelText → ...), variant choice (getBy vs queryBy vs findBy), common query mistakes |
| [user-events.md](references/user-events.md) | userEvent vs fireEvent, the `userEvent.setup()` pattern, clicking, typing, keyboard |
| [async-testing.md](references/async-testing.md) | findBy, waitFor, waitForElementToBeRemoved; loading states, API responses, debounced inputs |
| [msw.md](references/msw.md) | Network-level API mocking, setupServer, per-test handler overrides |
| [anti-patterns.md](references/anti-patterns.md) | Every common mistake and its fix, ESLint plugin setup |
| [accessibility-first-testing.md](references/accessibility-first-testing.md) | Why accessible queries help, ARIA vs semantic HTML, semantic HTML priority |

## Accessible Names Come From the Markup

A role query's `name` option matches the element's accessible name, not its text.

Some roles take their name from the author, not their content: `status`, `alert`, `region`, `dialog`, `navigation`, and `form` among them. Their visible text is never their accessible name. Without `aria-label` or `aria-labelledby` in the markup they have no name, and `{ name: /order placed/i }` finds nothing.

Find such a region by role alone, then assert its text:

```typescript
const status = await screen.findByRole("status");
expect(status).toHaveTextContent(/order placed/i);
```

Use `{ name }` for roles named by their content, such as `button`, `link`, `heading`, and `option`.

## When No Accessible Query Fits

Work down the priority order in [queries.md](references/queries.md). When an element exposes no role, label, text, alt text, or title:

1. Name the queries you tried and say why each fails on the supplied markup.
2. Fix the markup when you own it. Prefer semantic HTML, then a `<label>`, then an ARIA attribute.
3. Use `getByTestId` when you cannot change the markup, for example a third-party widget. Record the reason in a comment beside the query.
4. Read raw attributes and descendants with plain DOM access on the element you already hold, such as `element.querySelector('canvas')` and `getAttribute('data-render-count')`. `screen` has no attribute query; no `screen.getByAttribute` exists. `queryHelpers` and `buildQueries` can build one, worth the effort only for a pattern repeated across many tests.

Never assume a role, label, or accessible name the supplied markup lacks: an invented accessible name produces a test that fails on the real component. Never invent a query name either: the built-in queries on `screen` are the eight `*By*` families in [queries.md](references/queries.md), each with its `get`, `query`, `find`, and `All` forms.

## Prove the Whole Rule

A test proves a rule only when it observes both sides of that rule.

- **Call counts.** Assert `toHaveBeenCalledTimes(n)`. `toHaveBeenCalledWith(...)` proves one call's arguments, not how many calls happened.
- **Conditional enablement.** Assert the control is disabled while its condition is unmet, and enabled once it is met.
- **Repeated interactions.** Assert the full state cycle for every repetition. A rising call count does not prove the second attempt reached the same pending and terminal states.
- **Absence.** Anchor each absence assertion to a state that can only exist after the async work finished. An absence assertion straight after an interaction is anchored to nothing: it may run before the component could react, so it passes whether the component is correct or broken. Assert absence with `queryBy*`, which returns null for no match. It still throws when several elements match, so use `queryAllBy*` and assert an empty array when duplicates are possible. `waitForElementToBeRemoved` throws when the element is already gone at call time, so reserve it for a removal that has not happened yet.

## Summary Checklist

Before merging UI tests, verify:

- [ ] Query variant chosen by timing: `getBy*` for state already present, `findBy*` for state that appears later, `queryBy*` for absence
- [ ] Role query constrained by `name` only when that role has an accessible name; otherwise visible text asserted separately
- [ ] Element re-queried by its new role or accessible name when you must prove it is discoverable under that identity, or when the update may replace the node; an existing reference stays valid when the same node is reused
- [ ] Every absence assertion anchored to an observable state proving the async work finished
- [ ] `userEvent` with `setup()`; `fireEvent` only for an event `userEvent` does not support
- [ ] `screen` by default, `within(element)` to scope a query to one region; no queries bound to a container variable
- [ ] Interactions and other side effects outside `waitFor` and every other retrying callback
- [ ] Call counts asserted with `toHaveBeenCalledTimes`, not `toHaveBeenCalledWith` alone
- [ ] `jest-dom` matchers (`toBeInTheDocument`, `toBeDisabled`, etc.)
- [ ] User-visible behaviour tested, not implementation details
- [ ] ESLint plugins installed (`eslint-plugin-testing-library`, `eslint-plugin-jest-dom`)
- [ ] Markup you mounted into `document.body` yourself is reset; no manual `cleanup()` call
- [ ] MSW when the test crosses the network boundary (not `fetch` or `axios` spies); a mock for the injected function when the component receives its request function by injection
- [ ] TDD workflow followed (see `tdd` skill)
- [ ] Framework-specific patterns (React hooks, context, components): see `react-testing` skill
