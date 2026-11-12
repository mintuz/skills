---
name: frontend-testing
description: "USE WHEN testing non-React UI (vanilla JavaScript or TypeScript DOM code, a web component, or a Vue, Svelte or Angular component) with DOM Testing Library in Vitest or Jest with jsdom: writing, fixing or reviewing a test, or a request to add an end-to-end journey or a layout check to that suite; NOT WHEN the code or project uses React or React Testing Library (use web:react-testing), for XState actors (web:xstate), or for Playwright, Cypress or screenshot-comparison work in a real browser; covers queries, accessible names, userEvent, async results, network stubs and assertions that pass for the wrong reason, and declines what jsdom cannot prove while offering the part that fits."
---

# Front-end testing with DOM Testing Library

Write behaviour-first DOM Testing Library tests for UI built without React. For React components, hooks and providers, load `web:react-testing`. For the TDD workflow, load `tdd`.

## Scope

This skill covers tests that run against a DOM inside a test runner, such as Vitest or Jest with jsdom. Decline these parts of a request:

- **End-to-end and cross-page journeys:** cross-document navigation, redirects, real servers, downloads, extra browser tabs, and real cookie behaviour such as `HttpOnly`, `Secure` and `SameSite`. Reasons: jsdom does not navigate between documents or open real tabs. A real server sets an `HttpOnly` cookie, and page scripts cannot read it, so `document.cookie` in jsdom cannot prove it. Exception: jsdom holds a URL and a cookie jar, so a client-side URL or `document.cookie` check inside one document is in scope.
- **Visual appearance:** computed layout, real fonts, screenshots and visual-regression diffs. Reason: jsdom does not lay out or paint, so it cannot report a size, a position or a rendered colour.

To decline (`principle-state-the-scope`):

1. For each declined part, write its reason from the list above. A named replacement tool is not a reason.
2. Name the replacement: Playwright or Cypress for a journey; a screenshot or visual-regression comparison in a real browser for appearance.
3. Offer the part of the request that fits in the DOM, if any.

Do not offer a jsdom test that fakes the navigation, the server or the rendering as an equivalent.

`@testing-library/dom` exports no `render`. Mount the markup yourself. When a framework wrapper such as `@testing-library/vue` supplies `render`, mount through it; this skill still governs the queries and the interactions.

## Use the project's test libraries

Use the runner, matchers, network stub and helpers the project already has. Do not add a testing dependency or a lint plugin unasked (`principle-reuse-before-building`).

- **Interactions:** Use `userEvent` from `@testing-library/user-event`, created with `userEvent.setup()` in each test. Use `fireEvent` only for an event that `userEvent` does not support, or when the project shows that `user-event` is not installed. In the second case, say that `user-event` would model the interaction more closely.
- **Matchers:** Use jest-dom matchers such as `toBeInTheDocument()` and `toBeDisabled()`. Only when the project shows that its setup does not register jest-dom, assert absence with `toBeNull()`, text with `textContent`, and state with the element's own property, such as `disabled`.
- **Network:** Use the project's existing stub: its MSW `server` and handlers, otherwise its own stub helper. Override an MSW handler for one test with `server.use(...)`. When the project has an MSW server, do not add a `fetch` or `axios` spy. When the code receives its request function by injection, pass a mock for that function.
- **Lint:** When `eslint-plugin-testing-library` and `eslint-plugin-jest-dom` are missing, recommend them. Install them only when asked.

## Test behaviour, not implementation

Test what users see and do through the DOM: clicks, typing and visible text (`principle-test-behavior-not-implementation`). For each assertion, ask which plausible wrong implementation would still pass. Write the assertion that fails on it.

Mount the real component under test. Let it own its markup and event wiring. Do not read or set its internal state. Do not write your own listener and then assert that it ran. Return a runnable test that imports the code under test. When the task does not give the module path, import from an assumed path beside the test file and say that the path is assumed.

## Queries and interactions

- Choose the variant by timing: `getBy*` for state already present, `findBy*` for state that appears later, `queryBy*` for absence.
- Query through `screen`. Use `within(element)` to scope a query to one region. Do not bind queries to a container, for example with `getQueriesForElement`. Do not use a CSS class selector when an accessible query reaches the element.
- Re-query an element by its new role or accessible name when you must prove it is discoverable under that identity, or when the update can replace the node. An existing reference stays valid when the same node is reused.
- Interact once, outside `waitFor` and every other retrying callback. Put only assertions inside a retrying callback.
- Wait for an observable state with `findBy*` or `waitFor`. Do not put a fixed delay in place of that wait, such as `setTimeout`, a sleep promise or a fake-timer advance.
- Reset markup that you mounted into `document.body` yourself between tests, for example with `document.body.innerHTML = ''` in `afterEach`. Do not call `cleanup()` in a test file.

## Accessible names come from the markup

A role query's `name` option matches the accessible name, not the text. These roles take a name only from `aria-label` or `aria-labelledby`, never from their content: `status`, `alert`, `region`, `dialog`, `navigation` and `form`. Without those attributes they have no name, and `{ name: /order placed/i }` finds nothing. Find such an element by role alone, then assert its text:

```typescript
const status = await screen.findByRole("status");
expect(status).toHaveTextContent(/order placed/i);
```

Use this form only when the role first appears in its terminal state. When an earlier state uses the same role, such as a pending `status`, `findByRole` returns that earlier element at once. Then retry on the terminal text:

```typescript
await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(/order placed/i));
```

Use `{ name }` for roles named by their content, such as `button`, `link`, `heading` and `option`. `<input type="password">` has no ARIA role, so `getByRole('textbox')` does not find it. Find it with `getByLabelText`.

## When no accessible query fits

Work down the priority order in [queries.md](references/queries.md). When an element exposes no role, label, text, alt text or title:

1. Name the queries you tried and say why each fails on the supplied markup.
2. When you own the markup, fix it. Prefer semantic HTML, then a `<label>`, then an ARIA attribute.
3. When you cannot change the markup, for example a third-party widget, use `getByTestId`. Record the reason in a comment beside the query.
4. Read raw attributes and descendants with plain DOM access on the element you already hold, such as `element.querySelector('canvas')` and `getAttribute('data-render-count')`. `screen` has no attribute query; `screen.getByAttribute` does not exist. `queryHelpers` and `buildQueries` can build one; do this only for a pattern repeated across many tests.

Never assume a role, label or accessible name that the supplied markup lacks; the test then fails on the real component. Never invent a query name. The built-in queries on `screen` are the eight `*By*` families in [queries.md](references/queries.md), each with its `get`, `query`, `find` and `All` forms.

## Prove the whole rule

A test proves a rule only when it observes both sides of that rule.

- **Call counts:** Assert `toHaveBeenCalledTimes(n)`. `toHaveBeenCalledWith(...)` proves the arguments of one call, not how many calls happened.
- **Conditional enablement:** Assert that the control is disabled while its condition is unmet, and enabled once the condition is met.
- **Repeated interactions:** Assert the full state cycle for every repetition. A rising call count does not prove that the second attempt reached the same pending and terminal states.
- **Absence:** First await a state that exists only after the async work finished, such as the success text. Then assert absence. An absence assertion straight after an interaction can run before the component reacts, so it passes whether the component is correct or broken. Assert absence with `queryBy*`, which returns null when nothing matches; never with a throwing `getBy*` inside `expect(...).toThrow()`. `queryBy*` still throws when several elements match. Only when the supplied markup can render several matches, use `queryAllBy*` and assert an empty array. `waitForElementToBeRemoved` throws when the element is already gone at call time; use it only for a removal that has not happened yet.

## References

Read a reference when the task needs its detail:

| Reference | Read for |
| --- | --- |
| [queries.md](references/queries.md) | Query priority, variants, query mistakes |
| [user-events.md](references/user-events.md) | `userEvent` against `fireEvent`, `userEvent.setup()`, clicking, typing, keyboard, fake timers |
| [async-testing.md](references/async-testing.md) | `findBy*`, `waitFor`, `waitForElementToBeRemoved`; loading states, API responses, debounced inputs |
| [msw.md](references/msw.md) | MSW `setupServer`, per-test handler overrides |
| [anti-patterns.md](references/anti-patterns.md) | Mistakes and fixes, cleanup, ESLint plugin configuration |
| [accessibility-first-testing.md](references/accessibility-first-testing.md) | ARIA against semantic HTML |
