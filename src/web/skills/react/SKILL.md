---
name: react
description: WHEN building or changing React components, pages, hooks, effects, or apps, including edits to existing components; NOT for test code (react-testing) or styling (css, tailwind); enforces scalable architecture, state management, API layer, performance patterns.
---

# React Best Practices

## Core Principles

1. **Easy to start** - patterns new team members can follow
2. **Simple to maintain** - readable code with obvious intent
3. **Clean boundaries** - separate features and layers
4. **Early issue detection** - catch problems at build time, not runtime
5. **Consistency** - same patterns throughout the codebase

## Rules for Every Change

**Authorization.** A client permission check decides only what the UI shows; it cannot stop a crafted request. The server must authenticate the actor, authorize each mutation for that actor and resource, and refuse with 403 before it changes data. When a user action receives a 403, show the failure in the component that made the request. Do not redirect the app or log the user out for a per-action 403. See [api-layer.md](./references/api-layer.md).

**Effects.** Use an effect only to synchronise with an external system. Work caused by a user action belongs in the event handler. For an async effect, cleanup marks that run stale; a stale run writes no state, on success or on failure. When the operation accepts an `AbortSignal`, also create one `AbortController` per run and abort it in cleanup. Identify cancellation by the operation's own contract: a DOM `AbortError` by its `name`, an axios request by `axios.isCancel(error)`. Treat cancellation as no error. Every rejection that is not cancellation is a failure of the current run; write it to state, whatever its class. A class check such as `instanceof DOMException` must not decide which failures reach state. An effect that synchronises an imperative target (an editor, a map, a chart) with a prop or state applies the current value on every run, including the first run after mount. Do not guard it with a previous-value or transition check: such a guard skips the state the component mounts in. See [useeffect.md](./references/useeffect.md).

**Boundaries.** A feature imports from shared code only, never from another feature. Do not disable the boundary lint rule. When two features need one component, move it to `src/components/`. A shared component receives its data through props and does not import a feature API hook. The API module stays in the feature that owns the endpoint. Each feature that renders the shared component supplies that data itself: from its own API response, or through a feature-local component that calls the feature's own API hook. Alternatively, the app-level page composes the two features. See [project-structure.md](./references/project-structure.md).

**URL state.** Filters, search terms, and page numbers live in the URL search params. The URL gives shareable links and browser back and forward history for free; a store does not. Read and update the params through the router, with no `useState` copy to keep in sync. See [state-management.md](./references/state-management.md).

**Dependencies.** The decision trees below name preferred libraries. Use a library only when the project already has it. When a task forbids new dependencies, use the built-in hook or browser API.

## Guides

| Guide                                                         | Read for                                                                                                    |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| [project-structure.md](./references/project-structure.md)     | Directory layout (app, features, components), feature modules, unidirectional imports, ESLint boundaries, file naming |
| [component-patterns.md](./references/component-patterns.md)   | Colocation, composition over props, wrapping third-party components, avoiding nested render functions       |
| [compound-components.md](./references/compound-components.md) | Multi-part components (Card, Accordion), flexible composition, semantic structure                          |
| [state-management.md](./references/state-management.md)       | State categories (component, application, server cache), useState vs useReducer, React Query, state placement |
| [api-layer.md](./references/api-layer.md)                     | API client, request structure (schema, fetcher, hook), error handling (interceptors, boundaries), security (auth, sanitization, authorization) |
| [performance.md](./references/performance.md)                 | Code splitting, state optimisation, children optimisation, styling performance, images                      |
| [useeffect.md](./references/useeffect.md)                     | When not to use useEffect (most cases), when it fits (external systems), dependency arrays, alternatives    |
| [testing-strategy.md](./references/testing-strategy.md)       | Testing pyramid (prioritise integration over unit), what to test per level (unit, integration, E2E), querying by accessible names |
| [project-standards.md](./references/project-standards.md)     | Required tooling (ESLint, Prettier, TypeScript, Husky), pre-commit hooks                                    |

## Decision Trees

### Where should this component live?

```
Is it used by multiple features?
├── Yes → src/components/
└── No → Is it specific to one feature?
    ├── Yes → src/features/[feature]/components/
    └── No → Colocate with the component that uses it
```

### What state solution should I use?

```
Is this data from an API?
├── Yes → React Query / SWR (if installed)
└── No → Is it form data?
    ├── Yes → React Hook Form (if installed)
    └── No → Is it URL state (filters, pagination, search)?
        ├── Yes → URL search params via the router (React Router if installed)
        └── No → Is it needed globally?
            ├── Yes → Zustand / Jotai / Context
            └── No → useState / useReducer
```

### Should I create a new feature folder?

```
Does this functionality have:
- Its own routes/pages?
- Its own API endpoints?
- Components not shared elsewhere?
├── Yes to 2+ → Create feature folder
└── Otherwise → Add to existing feature or shared
```

### Do I need useEffect?

```
Why does this code need to run?

"Because the component was displayed"
├── Is it synchronizing with an external system?
│   ├── Yes → useEffect is appropriate
│   └── No → Probably don't need useEffect
│
"Because the user did something"
└── Put it in the event handler, not useEffect

"Because I need to compute a value"
└── Calculate during render (or useMemo if expensive)

See useeffect.md for detailed guidance.
```
