---
name: frontend-testing
description: "USE WHEN writing, fixing or reviewing a DOM Testing Library test in Vitest or Jest with jsdom for a page or widget not built with React (plain TypeScript markup, a web component, or a Vue, Svelte or Angular component), including a request to put an end-to-end journey or visual check of such a page in a jsdom suite; NOT WHEN testing React components, hooks or providers (web:react-testing), XState actors (web:xstate), or writing a Playwright or Cypress test; covers query choice, accessible names, userEvent flows, async results, network stubs and assertions that pass for the wrong reason, and declines jsdom journeys or visual checks while offering the part that fits in the DOM."
---

# Front-end testing with DOM Testing Library

Write behaviour-first DOM Testing Library tests for pages and widgets not built with React. Load `web:react-testing` for React components, hooks and providers; it carries its own copy of the rules they need. For the TDD workflow, load `tdd`.

## Scope

This skill covers tests that run against a DOM inside a test runner, such as Vitest or Jest with jsdom.

Decline these requests and name the correct tool instead of writing the test:

- **End-to-end and cross-page journeys.** Cross-document navigation, redirects, real servers, downloads, extra browser tabs, and real cookie behaviour such as `HttpOnly`, `Secure` and `SameSite` need Playwright or Cypress. jsdom does not navigate between documents or open real tabs, so a jsdom version of the journey proves nothing. A real server sets an `HttpOnly` cookie, and page scripts cannot read it, so `document.cookie` in jsdom cannot prove it. jsdom does hold a URL and a cookie jar, so a client-side URL or `document.cookie` check inside one document is in scope.
- **Visual appearance.** Computed layout, real fonts, screenshots and visual-regression diffs need a real browser. jsdom does not lay out or paint, so it cannot report a size, a position or a rendered colour.

When you decline (`principle-state-the-scope`):

1. For each declined part, state the jsdom limit above that blocks it.
2. Name the replacement: Playwright or Cypress for a journey, and a screenshot or visual-regression comparison in a real browser for appearance.
3. Offer the part of the request that fits in the DOM, if any.

Do not offer a jsdom test that fakes the navigation, the server or the rendering as an equivalent of the journey or the visual check.

`@testing-library/dom` exports no `render`; mount the markup yourself. When another framework's Testing Library wrapper, such as `@testing-library/vue`, supplies `render`, mount through it. This skill still governs the queries and the interactions.

## Use the project's test libraries

Use the runner, matchers, network stub and helpers the project already has. Do not add a testing dependency or a lint plugin that nobody asked for (`principle-reuse-before-building`). The examples in this skill and its references use `userEvent`, jest-dom and MSW; apply them as written when the project has them.

- **Interactions.** Use `userEvent` from `@testing-library/user-event`, created with `userEvent.setup()` in each test. Only when the project shows that `user-event` is not installed, use `fireEvent` and say that `user-event` would model the interaction more closely.
- **Matchers.** Use the jest-dom matchers, such as `toBeInTheDocument()`. Only when the project shows that its test setup does not register jest-dom, assert absence with `toBeNull()`, text with `textContent`, and state with the element's own property, such as `disabled`.
- **Network.** Stub the network with the project's existing mechanism: its MSW `server` and handlers when it has them, otherwise its own stub helper. When the code under test receives its request function by injection, pass a mock for that function instead.
- **Lint.** When `eslint-plugin-testing-library` and `eslint-plugin-jest-dom` are missing, recommend them. Install them only when asked.

## Test behaviour, not implementation

Test what end-users see and do through the DOM: clicks, typing and visible text. An implementation-coupled test fails when a developer refactors correct code, a false negative. A shallow test passes while a bug exists, a false positive (`principle-test-behavior-not-implementation`). Ask which plausible wrong implementation would still pass, and write the assertion that fails on it.

Mount the component under test and let it own its markup and event wiring. Do not read or set its internal state. Return a runnable test: import the code under test, and when the task does not give its module path, import it from an assumed path beside the test file and say that the path is assumed. A test that writes its own listener and then asserts that the listener ran proves nothing about the component.

```typescript
it("submits the form when the user clicks Submit", async () => {
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

## References

Read a reference when the task needs its detail:

| Reference | Read for |
| --- | --- |
| [queries.md](references/queries.md) | Query priority order, variant choice (`getBy*`, `queryBy*`, `findBy*`), common query mistakes |
| [user-events.md](references/user-events.md) | `userEvent` against `fireEvent`, the `userEvent.setup()` pattern, clicking, typing, keyboard |
| [async-testing.md](references/async-testing.md) | `findBy*`, `waitFor`, `waitForElementToBeRemoved`; loading states, API responses, debounced inputs |
| [msw.md](references/msw.md) | Network-level stubs when the project uses MSW, `setupServer`, per-test handler overrides |
| [anti-patterns.md](references/anti-patterns.md) | Common mistakes and their fixes, cleanup, ESLint plugin recommendation |
| [accessibility-first-testing.md](references/accessibility-first-testing.md) | Accessible queries, ARIA against semantic HTML |

## Accessible names come from the markup

A role query's `name` option matches the element's accessible name, not its text.

Some roles take their name from the author, not from their content: `status`, `alert`, `region`, `dialog`, `navigation` and `form` among them. Their visible text is never their accessible name. Without `aria-label` or `aria-labelledby` in the markup they have no name, and `{ name: /order placed/i }` finds nothing.

Find such a region by role alone, then assert its text:

```typescript
const status = await screen.findByRole("status");
expect(status).toHaveTextContent(/order placed/i);
```

Use `{ name }` for roles named by their content, such as `button`, `link`, `heading` and `option`.

`<input type="password">` has no ARIA role, so `getByRole('textbox')` does not find it. Find it with `getByLabelText`.

## When no accessible query fits

Work down the priority order in [queries.md](references/queries.md). When an element exposes no role, label, text, alt text or title:

1. Name the queries you tried and say why each fails on the supplied markup.
2. When you own the markup, fix it. Prefer semantic HTML, then a `<label>`, then an ARIA attribute.
3. When you cannot change the markup, for example a third-party widget, use `getByTestId`. Record the reason in a comment beside the query.
4. Read raw attributes and descendants with plain DOM access on the element you already hold, such as `element.querySelector('canvas')` and `getAttribute('data-render-count')`. `screen` has no attribute query; `screen.getByAttribute` does not exist. `queryHelpers` and `buildQueries` can build one; do this only for a pattern repeated across many tests.

Never assume a role, label or accessible name that the supplied markup lacks: an invented accessible name produces a test that fails on the real component. Never invent a query name: the built-in queries on `screen` are the eight `*By*` families in [queries.md](references/queries.md), each with its `get`, `query`, `find` and `All` forms.

## Prove the whole rule

A test proves a rule only when it observes both sides of that rule.

- **Call counts.** Assert `toHaveBeenCalledTimes(n)`. `toHaveBeenCalledWith(...)` proves the arguments of one call, not how many calls happened.
- **Conditional enablement.** Assert that the control is disabled while its condition is unmet, and enabled once the condition is met.
- **Repeated interactions.** Assert the full state cycle for every repetition. A rising call count does not prove that the second attempt reached the same pending and terminal states.
- **Absence.** Anchor each absence assertion to a state that can only exist after the async work finished. An absence assertion straight after an interaction is anchored to nothing: it can run before the component reacts, so it passes whether the component is correct or broken. Assert absence with `queryBy*`, which returns null when nothing matches. `queryBy*` still throws when several elements match; when duplicates are possible, use `queryAllBy*` and assert an empty array. `waitForElementToBeRemoved` throws when the element is already gone at call time; use it only for a removal that has not happened yet.

## Checklist

Before you finish UI tests, verify:

- [ ] Query variant chosen by timing: `getBy*` for state already present, `findBy*` for state that appears later, `queryBy*` for absence
- [ ] Role query constrained by `name` only when that role has an accessible name; otherwise visible text asserted separately
- [ ] Element re-queried by its new role or accessible name when you must prove it is discoverable under that identity, or when the update can replace the node; an existing reference stays valid when the same node is reused
- [ ] Every absence assertion anchored to an observable state that proves the async work finished
- [ ] `userEvent` with `setup()`; `fireEvent` only for an event `userEvent` does not support, or when the project shows `user-event` is not installed
- [ ] `screen` by default, `within(element)` to scope a query to one region; no queries bound to a container variable
- [ ] Interactions and other side effects outside `waitFor` and every other retrying callback
- [ ] Call counts asserted with `toHaveBeenCalledTimes`, not with `toHaveBeenCalledWith` alone
- [ ] jest-dom matchers (`toBeInTheDocument`, `toBeDisabled` and others) unless the project shows the setup does not register them
- [ ] User-visible behaviour tested, not implementation details
- [ ] ESLint plugins (`eslint-plugin-testing-library`, `eslint-plugin-jest-dom`) recommended when missing, installed only when asked
- [ ] Markup you mounted into `document.body` yourself is reset between tests; no manual `cleanup()` call in a test file
- [ ] The project's network stub when the test crosses the network boundary: its MSW server when it has one, not a new `fetch` or `axios` spy; a mock for the injected function when the code receives its request function by injection
- [ ] No testing dependency added unasked
- [ ] React components, hooks and providers left to `web:react-testing`
