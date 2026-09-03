---
name: react-testing
description: WHEN testing React components/hooks/context with React Testing Library; NOT e2e; covers renderHook, providers, forms, and anti-patterns.
---

# React Testing Library

This skill focuses on React-specific testing patterns. For general DOM testing patterns (queries, userEvent, async, accessibility), load the `frontend-testing` skill. For TDD workflow, load the `tdd` skill.

## Core Principles

**React components are functions** - Test them like functions: inputs (props) → output (rendered DOM).

**Test behavior, not implementation:**

- ✅ Test what users see and do
- ✅ Test through public APIs (props, rendered output)
- ✅ Query by accessible role, label, or visible text
- ✅ Add `{ name }` to `getByRole` only where the element has an accessible name: content gives one to a `button`, a `link`, or a `heading`, and `aria-label` or `aria-labelledby` gives one to an element whose role accepts an author-supplied name; a plain `<li>` takes no name from its text, so query it by that text
- ❌ Don't test component state
- ❌ Don't test component methods
- ❌ Don't assert on a class name, a test id, or a handler name while accessible output proves the same behaviour; those names change without changing what a user experiences
- ❌ Don't use shallow rendering

**Modern RTL handles cleanup automatically:**

- No manual `act()` for render, userEvent, or async queries
- No manual `cleanup()` - it runs automatically wherever the test runner exposes a global `afterEach`; in Vitest that needs `globals: true` or a setup file that calls `cleanup()`
- Use factory functions instead of `beforeEach`

## Scope

React Testing Library renders one component tree, in jsdom or in a browser test
runner. Keep every test inside that tree.

Decline a request that crosses a system the test does not render: a real
network, a real email, or a redirect to a third-party site. A demand for several
real browsers is a coverage matrix for that journey, not a separate boundary. Name it as end-to-end work. Recommend
a browser-driven tool, such as Playwright or Cypress, for the journey. Then name each
slice React Testing Library can still cover with the network boundary mocked.
Name every slice by its component and by the behaviour you would assert. Do not
offer a test that fakes those external systems as an equivalent substitute for
the journey.

## Asynchronous Assertions

A view that loads or updates asynchronously reaches its result after the first
render. Assert that a value is absent from such a view only after its result is
observable. First await a positive assertion, such as
`await screen.findByText(...)`. Then use a `queryBy*` query with
`not.toBeInTheDocument()` for the absence. An absence assertion made before the
result is observable passes while the view still shows its loading state, so it
proves nothing. Reach the result with awaited Testing Library APIs; do not use a
fixed delay or a manual `act()` around `render()`. Use fake timers only when a
timer is the behaviour under test. Then pass `advanceTimers` to
`userEvent.setup()` so it keeps working, and advance the clock with the test
runner's own timer API.

This rule applies to asynchronous results only. Assert a synchronous initial
state, such as a collapsed panel, directly after `render()`.

## Hooks and Context

Use `renderHook` for hook-only behaviour. Its `initialProps` and its
`rerender(props)` argument reach the hook callback only; they never reach the
`wrapper`. Use the `wrapper` option to mount a provider with fixed props.

When a provider prop must change, render a small consumer component with
`render()` and change the prop through that render result's `rerender()`. The
consumer is the correct public seam because the rendered output is what the
provider change must affect.

## Missing Facts

Write every assertion that the supplied facts support, and keep that runnable
test in your answer. When one expected outcome is undefined, name the minimum
contract an assertion needs for it: how the code signals the outcome, and how a
test can observe it, such as its role, its text, or the callback it fires. Leave
only that path as a `test.todo` which states what you need. Do not invent
copy, a role, or a test id and then assert it as though the packet supplied it.
Do not delete the supported assertions because one path is undefined.

## Quick Reference

| Topic                                                | Guide                                           |
| ---------------------------------------------------- | ----------------------------------------------- |
| Testing components, props, and conditional rendering | [components.md](references/components.md)       |
| Testing custom hooks with renderHook                 | [hooks.md](references/hooks.md)                 |
| Testing context providers and consumers              | [context.md](references/context.md)             |
| Testing form inputs, submissions, and validation     | [forms.md](references/forms.md)                 |
| Common React testing mistakes to avoid               | [anti-patterns.md](references/anti-patterns.md) |
| Loading states, error boundaries, portals, Suspense  | [advanced.md](references/advanced.md)           |

## When to Use Each Guide

### Components

Use [components.md](references/components.md) when you need:

- Basic component testing patterns
- Testing how props affect rendered output
- Testing conditional rendering
- Examples of correct vs incorrect component tests

### Hooks

Use [hooks.md](references/hooks.md) when you need:

- Testing custom hooks with `renderHook`
- Using `result.current`, `act()`, and `rerender()`
- Testing hooks with props

### Context

Use [context.md](references/context.md) when you need:

- Using the `wrapper` option with providers
- Setting up multiple providers
- Creating custom render functions for context
- Testing components that consume context

### Forms

Use [forms.md](references/forms.md) when you need:

- Testing controlled inputs
- Testing form submissions
- Testing form validation
- User interaction patterns with forms

### Anti-Patterns

Use [anti-patterns.md](references/anti-patterns.md) when you need:

- When to avoid manual `act()` wrapping
- Why manual `cleanup()` is unnecessary
- Avoiding `beforeEach` render patterns
- Why to avoid testing component internals
- Why shallow rendering is problematic

### Advanced

Use [advanced.md](references/advanced.md) when you need:

- Testing loading states
- Testing error boundaries
- Testing portals
- Testing React Suspense

## Summary Checklist

React-specific checks:

- [ ] Using `render()` from @testing-library/react (not enzyme's shallow/mount)
- [ ] Using `renderHook()` for hook-only behavior; rendering a consumer when provider props must change because hook props do not reach its wrapper
- [ ] Using `wrapper` option for context providers
- [ ] Using `act()` for direct state-changing hook callbacks because they run outside Testing Library's auto-wrapped interaction helpers; `render`, `userEvent`, and async queries rely on RTL's wrapping
- [ ] No manual `cleanup()` calls where the runner exposes a global `afterEach`
- [ ] Testing component output, not internal state, class names, or test ids
- [ ] Awaiting an asynchronous result before asserting a value is absent from it
- [ ] Declining end-to-end journeys and naming a browser-driven tool instead
- [ ] Naming missing facts instead of inventing expected output
- [ ] Using factory functions, not `beforeEach` render
- [ ] Following TDD workflow (see `tdd` skill)
- [ ] Using general DOM testing patterns (see `frontend-testing` skill)
