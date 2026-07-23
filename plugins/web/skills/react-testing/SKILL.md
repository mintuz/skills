---
name: react-testing
description: WHEN writing, debugging, reviewing, or refactoring React component, custom Hook, context, form, or lifecycle tests with React Testing Library; NOT for framework-agnostic DOM assertions or browser-level end-to-end tests; builds minimal render harnesses and delegates rendered behavior to frontend-testing.
---

# React Testing

Use a **render harness**: the smallest React tree that exposes the current public contract through rendered DOM or, when a custom Hook's API is itself the contract, through its returned value and observable effects.

## Prerequisite

Apply `frontend-testing` to every rendered assertion and interaction. It owns behavior contracts, accessible queries, user events, async DOM outcomes, network boundaries, isolation, and TDD routing; this skill owns the React render harness.

## Choose the branch

| Request | Route |
| --- | --- |
| Write or fix a component, provider, or form test | Apply `frontend-testing` and follow all four steps |
| Test a custom Hook's public API | Follow all four steps; prefer rendering its consumer when the contract is user-visible |
| Test a rerender, unmount, error boundary, portal, or Suspense transition | Follow all four steps and load the matching lifecycle reference in step 2 |
| Review React tests | Follow steps 1, 2, and 4 read-only; report each harness flaw with behavior evidence |
| Refactor React tests | Identify and preserve every public contract, then follow all four steps |
| Test framework-agnostic DOM behavior | Use `frontend-testing` |
| Test a browser journey across pages or services | Use the repository's end-to-end testing conventions |

## 1. Define the render harness

Read the repository instructions, installed React and Testing Library versions, test setup, nearest tests, subject and consumers, existing render helpers, providers, and network setup. Reuse the local runner, renderer, factories, matchers, and provider composition.

For every behavior in scope, identify:

- the public contract: rendered DOM and callbacks, or a custom Hook's returned API and observable effects;
- the minimum props, provider state, and external boundaries needed to reach it;
- the update source: user interaction, changed input, direct Hook call, timer, subscription, or network response;
- the lifecycle phases required: initial render, rerender, unmount, fallback, recovery, or cleanup;
- its existing coverage.

**Complete when:** every scoped behavior has one public contract, one minimal render harness, and known existing or missing coverage.

## 2. Load only the matching reference

Read every reference whose condition matches before writing the harness:

| Condition | Required reference |
| --- | --- |
| Rendering props, callback output, or conditional UI | [Components](references/components.md) |
| Exercising a custom Hook through `renderHook`, `result.current`, or `rerender` | [Hooks](references/hooks.md) |
| Supplying one or more providers through `wrapper` or a custom renderer | [Context](references/context.md) |
| Testing a controlled input, form submission, or validation state | [Forms](references/forms.md) and `frontend-testing` |
| Reviewing, refactoring, or correcting `act`, cleanup, shared render, shallow render, or internal-state tests | [React anti-patterns](references/anti-patterns.md) |
| Testing a loading transition, error boundary, portal, or Suspense fallback | [Advanced patterns](references/advanced.md) and `frontend-testing` |

Treat the repository's installed APIs as authoritative. A reference supplies a pattern, not a reason to upgrade or replace the runner or renderer.

**Complete when:** every matching reference has been read and the chosen harness works with the repository's installed versions and existing setup.

## 3. Build the harness

Render the full component tree through the repository's renderer. Supply shared providers through its existing custom renderer or the `wrapper` option; keep one-off providers beside the test. Create a local setup function only when it makes repeated arrangement easier to read.

For component behavior, render public props and prove DOM outcomes and callbacks through `frontend-testing`. Drive input changes through the owning component when that interaction is in scope; otherwise use `rerender` to exercise a public prop transition.

Prefer rendering a Hook through its real consumer. Use `renderHook` when the Hook's returned API is the direct contract; read committed values from `result.current`, pass changed arguments through `rerender`, and use `unmount` when cleanup is part of the contract.

Let `render`, `renderHook`, and Testing Library interactions provide their built-in `act` boundary. Wrap a direct call to a returned Hook updater, timer, or external subscription in `act` when it causes a React update outside those helpers.

Create a fresh harness inside each test. Use the repository's automatic cleanup when its runner supplies a global `afterEach`; register `cleanup` only for a runner that does not.

**Complete when:** each test renders a fresh, full tree; exposes only public inputs and outputs; supplies every required provider; and models each required render, update, and cleanup phase.

## 4. Prove every React contract

Run the smallest affected test first, then the relevant suite and configured React Testing Library lint rules. For new production behavior or a defect reproduction, load `tdd` and confirm the targeted test goes red for the intended reason before it goes green.

Inspect every scoped test for:

- a `frontend-testing` behavior contract for rendered UI;
- a public returned value or observable effect for a Hook-only contract;
- the minimum props, providers, and external boundaries;
- the correct initial render, rerender, unmount, fallback, recovery, and cleanup phases that apply;
- full rendering and a fresh harness per test;
- manual `act` and `cleanup` only at the external boundaries described in step 3.

**Complete when:** every scoped public contract has passing evidence, every configured check passes, and each unavailable or intentionally omitted lifecycle phase is named.
