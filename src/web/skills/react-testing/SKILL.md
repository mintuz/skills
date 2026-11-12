---
name: react-testing
description: "USE WHEN writing, fixing or reviewing a React Testing Library test for a component, hook or context provider, even one small test, or when asked for an end-to-end journey inside a Vitest or React Testing Library suite; NOT WHEN changing the component itself (react), testing XState actors or @xstate/react (xstate), or writing a Playwright or Cypress test; covers renderHook, providers, async results, forms and false-pass anti-patterns, and declines end-to-end journeys with the testable slices."
---

# React Testing Library

For a page or widget not built with React, use the `frontend-testing` skill. For the TDD workflow, use the `tdd` skill.

## Core rules

Test behaviour through public APIs: props in, rendered DOM out (`principle-test-behavior-not-implementation`). For each assertion, name a plausible wrong implementation that would still pass. Write the assertion that fails on it.

- Query by accessible role, label or visible text.
- Add `{ name }` to `getByRole` only when the element has an accessible name. Content names a `button`, `link` or `heading`. `aria-label` or `aria-labelledby` names an element whose role accepts an author-supplied name. A plain `<li>` takes no name from its text, so query it by that text.
- Assert the call count with `toHaveBeenCalledTimes` as well as the arguments. `toHaveBeenCalledWith` alone does not prove the number of calls.
- Do not test component state or methods. Do not assert on a class name, test id or handler name when accessible output proves the same behaviour. Do not use shallow rendering.
- Do not wrap `render()`, `userEvent` calls or async queries in `act()`. RTL wraps them.
- Do not call `cleanup()` in a test file. RTL cleans up automatically when the runner exposes a global `afterEach`. In Vitest, that needs `globals: true` or one `afterEach(cleanup)` in a shared setup file. When the project keeps globals off, put that call in the setup file, remove `cleanup` from every test file and leave the config unchanged.
- Render through a factory function in each test, not a shared `beforeEach` render.

## Project libraries

Use the runner, matchers and helpers the project already has. Do not add a testing dependency that nobody asked for (`principle-reuse-before-building`).

- If `@testing-library/user-event` is installed, create `userEvent.setup()` in each test. If not, use `fireEvent` and say that `user-event` models the interaction more closely.
- If the setup registers jest-dom matchers, use them, such as `toBeInTheDocument()`. If not, assert absence with `toBeNull()` and text with `textContent`.
- Before you write a network stub or custom render helper, use the project's existing one, such as a `stubApi` function, an MSW `server` or a `renderWithProviders` helper.

## Scope

RTL renders one component tree, in jsdom or a browser test runner. Keep every test inside that tree.

A request crosses that boundary when it needs a real network, a real email or a redirect to a third-party site. A demand for several real browsers is a coverage matrix for that journey, not a separate boundary. For such a request:

1. Say it is end-to-end work. Name each external system from the request that it crosses.
2. Recommend a browser-driven tool by name, such as Playwright or Cypress, for the journey.
3. Name each slice RTL can still cover with the network boundary mocked: its component and the behaviour to assert (`principle-state-the-scope`).

Do not offer a test that fakes those external systems as an equivalent of the journey.

## Test allocation

Prefer integration tests over unit tests.

| Level | What to test | How many | Tools |
| --- | --- | --- | --- |
| Unit | Pure functions that hold a decision, such as a permission rule, a complex calculation or a shared utility | Each rule outside a component | Vitest, no renderer |
| Integration | Features, user flows, component interactions | Most tests | Vitest + Testing Library |
| E2E | Critical user journeys | Few, critical paths only | Playwright or Cypress |

Test a permission rule in a plain function without rendering React (`react` skill). Test a state machine as an actor (`xstate` skill). Keep those unit tests. Do not move their rule into a rendered test.

## Asynchronous results

A view that loads or updates asynchronously shows its result after the first render. To assert that a value is absent from that result:

1. Await a positive assertion, such as `await screen.findByText(...)`.
2. Then assert the absence with a `queryBy*` query and `not.toBeInTheDocument()`.

An earlier absence check passes while the view still shows its loading state, so it proves nothing. Reach the result with awaited Testing Library APIs, not a fixed delay or an `act()` around `render()`. Use fake timers only when a timer is the behaviour under test. Then pass `advanceTimers` to `userEvent.setup()` and advance the clock with the runner's timer API.

When an `async` handler calls a callback, await the callback assertion, for example `await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1))`.

Assert a synchronous initial state, such as a collapsed panel, directly after `render()`.

## Hooks and context

Use `renderHook` for hook-only behaviour. Its `initialProps` and `rerender(props)` reach the hook callback only, never the `wrapper`. Use the `wrapper` option to mount a provider with fixed props. When the test calls a state-changing hook callback directly, such as `result.current.addItem()`, wrap that call in `act()`. It runs outside RTL's auto-wrapped helpers.

When a provider prop must change, render a small consumer component with `render()`. Change the prop through that render result's `rerender()`. The rendered output is the public seam that the provider change must affect. Do not pass the new value through a mutable variable that the `wrapper` reads, or through a second mounted hook.

## Missing facts

Write every assertion the supplied facts support, and keep that runnable test in the answer. When one expected outcome is undefined:

1. Name the minimum contract in two parts: how the code signals the outcome (for example, a callback that rejects), and how a test can observe it (its role, its text or the callback it fires).
2. Leave only that path as a `test.todo` that states what is needed.
3. Continue the other work (`principle-never-block-on-the-human`).

Do not invent copy, a role or a test id and assert it as though it was supplied. Do not delete the supported assertions because one path is undefined.

## References

| Reference | Read when |
| --- | --- |
| [components.md](references/components.md) | Testing props to output, callbacks or conditional rendering |
| [hooks.md](references/hooks.md) | Using `renderHook`, `result.current`, `act()` or `rerender()` |
| [context.md](references/context.md) | Wrapping in providers or writing a custom render helper |
| [forms.md](references/forms.md) | Testing inputs, submissions or validation |
| [anti-patterns.md](references/anti-patterns.md) | Removing manual `act()`, manual `cleanup()`, `beforeEach` render, internals or shallow rendering |
| [advanced.md](references/advanced.md) | Testing loading states, error boundaries, portals or Suspense |

## Done

- `render()` and `renderHook()` come from `@testing-library/react`. No enzyme `shallow` or `mount`.
- Every rule above holds in each returned test file and setup file.
- An end-to-end request gets the named tool and slices. An undefined outcome stays a `test.todo`.
