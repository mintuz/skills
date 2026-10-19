---
name: react-testing
description: WHEN testing React components/hooks/context with React Testing Library; NOT e2e; covers renderHook, providers, forms, and anti-patterns.
---

# React Testing Library

React-specific testing patterns. For the general DOM rules (query priority, accessible names, `userEvent`, async and absence assertions), load the `frontend-testing` skill. For the TDD workflow, load the `tdd` skill.

## Core Principles

**React components are functions.** Test them as inputs (props) → output (rendered DOM).

**Test behaviour, not implementation** (`principle-test-behavior-not-implementation`):

- ✅ Test what users see and do, through public APIs (props, rendered output), queried by accessible role, label, or visible text
- ✅ Add `{ name }` to `getByRole` only where the element has an accessible name: content names a `button`, a `link`, or a `heading`; `aria-label` or `aria-labelledby` names an element whose role accepts an author-supplied name; a plain `<li>` takes no name from its text, so query it by that text
- ❌ Don't test component state or component methods
- ❌ Don't assert on a class name, a test id, or a handler name while accessible output proves the same behaviour
- ❌ Don't use shallow rendering

**Modern RTL wraps and cleans up for you:**

- No manual `act()` for render, userEvent, or async queries
- No manual `cleanup()`: it runs automatically wherever the test runner exposes a global `afterEach`; in Vitest that needs `globals: true` or a setup file that calls `cleanup()`
- Use factory functions instead of `beforeEach`

## Scope

React Testing Library renders one component tree, in jsdom or a browser test runner. Keep every test inside that tree.

Decline a request that crosses a system the test does not render: a real network, a real email, or a redirect to a third-party site. A demand for several real browsers is a coverage matrix for that journey, not a separate boundary.

1. Name the request as end-to-end work.
2. Recommend a browser-driven tool, such as Playwright or Cypress, for the journey.
3. Name each slice React Testing Library can still cover with the network boundary mocked, by its component and the behaviour you would assert (`principle-state-the-scope`).

Do not offer a test that fakes those external systems as an equivalent substitute for the journey.

## Test Allocation

Prioritise integration tests over unit tests:

| Level | What to test | How many | Tools |
| --- | --- | --- | --- |
| Unit | Shared utilities, complex pure functions | Shared utilities only | Vitest |
| Integration | Features, user flows, component interactions | Most tests | Vitest + Testing Library |
| E2E | Critical user journeys | Few, critical paths only | Playwright |

## Asynchronous Assertions

A view that loads or updates asynchronously reaches its result after the first render. Assert a value is absent from such a view only after its result is observable:

1. Await a positive assertion, such as `await screen.findByText(...)`.
2. Then assert the absence with a `queryBy*` query and `not.toBeInTheDocument()`.

An absence assertion made before the result is observable passes while the view still shows its loading state, so it proves nothing. Reach the result with awaited Testing Library APIs; do not use a fixed delay or a manual `act()` around `render()`. Use fake timers only when a timer is the behaviour under test; then pass `advanceTimers` to `userEvent.setup()` so it keeps working, and advance the clock with the test runner's own timer API.

This rule covers asynchronous results only. Assert a synchronous initial state, such as a collapsed panel, directly after `render()`.

## Hooks and Context

Use `renderHook` for hook-only behaviour. Its `initialProps` and its `rerender(props)` argument reach the hook callback only, never the `wrapper`. Use the `wrapper` option to mount a provider with fixed props.

When a provider prop must change, render a small consumer component with `render()` and change the prop through that render result's `rerender()`. The consumer is the correct public seam because the rendered output is what the provider change must affect.

## Missing Facts

Write every assertion the supplied facts support, and keep that runnable test in your answer. When one expected outcome is undefined, name the minimum contract an assertion needs: how the code signals the outcome, and how a test can observe it (its role, its text, or the callback it fires). Leave only that path as a `test.todo` stating what you need (`principle-never-block-on-the-human`). Do not invent copy, a role, or a test id and assert it as though the packet supplied it. Do not delete the supported assertions because one path is undefined.

## Guides

| Guide | Load for |
| --- | --- |
| [components.md](references/components.md) | Basic component tests, props → output, conditional rendering, correct vs incorrect examples |
| [hooks.md](references/hooks.md) | `renderHook`, `result.current`, `act()`, `rerender()`, hooks with props |
| [context.md](references/context.md) | `wrapper` with providers, multiple providers, custom render functions, context consumers |
| [forms.md](references/forms.md) | Controlled inputs, submissions, validation, form interaction patterns |
| [anti-patterns.md](references/anti-patterns.md) | Manual `act()`, manual `cleanup()`, `beforeEach` render, testing internals, shallow rendering |
| [advanced.md](references/advanced.md) | Loading states, error boundaries, portals, Suspense |

## Summary Checklist

React-specific checks:

- [ ] `render()` from @testing-library/react (not enzyme's shallow/mount)
- [ ] `renderHook()` for hook-only behaviour; a rendered consumer when provider props must change, because hook props do not reach its wrapper
- [ ] `wrapper` option for context providers
- [ ] `act()` around direct state-changing hook callbacks, because they run outside Testing Library's auto-wrapped interaction helpers; `render`, `userEvent`, and async queries rely on RTL's wrapping
- [ ] No manual `cleanup()` calls where the runner exposes a global `afterEach`
- [ ] Component output tested, not internal state, class names, or test ids
- [ ] Asynchronous result awaited before asserting a value is absent from it
- [ ] End-to-end journeys declined, with a browser-driven tool named instead
- [ ] Missing facts named instead of inventing expected output
- [ ] Factory functions, not `beforeEach` render
- [ ] TDD workflow followed (see `tdd` skill)
- [ ] General DOM testing patterns applied (see `frontend-testing` skill)
