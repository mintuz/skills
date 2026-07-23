---
name: frontend-testing
description: WHEN writing, debugging, reviewing, or refactoring front-end UI tests with DOM Testing Library; NOT for React-only APIs or browser-level end-to-end tests; proves user-visible behavior through accessible queries, realistic interactions, async outcomes, and network boundaries.
---

# Front-End Testing

Treat each test as a **behavior contract**: given a user-visible state, when the user acts through the DOM, an observable outcome follows.

## Choose the branch

| Request | Route |
| --- | --- |
| Write or fix a UI test | Follow all four steps; for new or changed production behavior, load `tdd` and begin with a red behavior contract |
| Review UI tests | Follow steps 1, 2, and 4 read-only; report each broken contract with evidence |
| Refactor UI tests | Preserve the behavior contracts, then follow all four steps |
| Test React components, hooks, or context | Load `react-testing` for React setup and apply this skill to the rendered DOM behavior |
| Test a browser journey across pages or services | Use the repository's end-to-end testing conventions |

## 1. Define the behavior contract

Read the repository test setup, the rendered UI, its public inputs, and the production path that owns the behavior. Reuse the existing runner, render helper, factories, matchers, and network setup.

For every behavior in scope, state:

- the user-visible starting state;
- the user action, if any;
- the observable DOM outcome;
- whether the outcome is immediate, asynchronous, disappearing, or network-driven.

Assert through the public UI. Internal state, private methods, component instances, CSS selectors, and client implementation details do not prove a behavior contract.

**Complete when:** every scoped behavior has one observable contract and its existing test coverage or missing coverage is known.

## 2. Choose the observation surface

Read every reference whose condition matches before editing the test:

| Condition | Required reference |
| --- | --- |
| Selecting a query or choosing `getBy*`, `queryBy*`, or `findBy*` | [Query selection](references/queries.md) |
| Accessible names, semantic HTML, or ARIA affect what the test can observe | [Accessibility-first testing](references/accessibility-first-testing.md) |
| Clicking, typing, selecting, clearing, or keyboard input | [User events](references/user-events.md) |
| Appearance, disappearance, loading, debounce, or another delayed outcome | [Async testing](references/async-testing.md) |
| API success, failure, or per-test response behavior | [MSW integration](references/msw.md) |
| Reviewing, refactoring, configuring lint, or correcting a Testing Library smell | [Anti-patterns](references/anti-patterns.md) |

Query through `screen`. Prefer role plus accessible name, then the next accessible query that matches how a user finds the element; use a test ID only when the UI exposes no semantic surface. Match the query variant to the contract: `getBy*` for present now, `queryBy*` for absence, and `findBy*` for eventual presence. Use `jest-dom` matchers for DOM state.

**Complete when:** every assertion uses the most user-facing available query and a variant that matches the outcome's timing and cardinality.

## 3. Exercise the UI

Create `userEvent.setup()` inside each test and await each interaction. Drive the complete user action rather than dispatching its implementation events; use `fireEvent` only for an event that `userEvent` cannot express.

Keep retry callbacks assertion-only. Use `findBy*` for eventual elements, `waitForElementToBeRemoved` for disappearance, and `waitFor` for one retrying assertion that no query can express. At an API boundary, intercept requests with MSW and reset per-test overrides through the shared test setup.

Keep each test independent: render fresh state per test, build data through factory functions rather than shared fixtures, and rely on the runner's automatic DOM cleanup. Load `tdd` when factory patterns are needed.

**Complete when:** each behavior contract is exercised through public inputs, all interactions are awaited, and no shared state or retrying side effect can change another test.

## 4. Prove every contract

Run the smallest affected test first, then the relevant test suite and configured Testing Library or `jest-dom` lint rules. For new behavior under TDD or a defect reproduction, confirm the targeted test fails for the intended reason before the production change and passes afterward.

Inspect every scoped contract for:

- a user-visible assertion rather than an implementation assertion;
- an accessible query and correct query variant;
- the complete user interaction and awaited async outcome;
- isolated render, user, data, and network state;
- coverage of the requested success, error, loading, empty, and disappearance outcomes that exist.

**Complete when:** every scoped behavior contract has passing evidence, every configured check passes, and each unavailable or intentionally omitted outcome is named.
