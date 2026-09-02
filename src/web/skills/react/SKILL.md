---
name: react
description: WHEN building or changing React components, pages, hooks, effects, or apps, including edits to existing components; NOT for test code (react-testing) or styling (css, tailwind); enforces scalable architecture, state management, API layer, performance patterns.
---

# React Best Practices

Production-grade React development with feature-based architecture, type-safe state management, and performance optimization.

## Core Principles

1. **Easy to get started with** - Clear patterns that new team members can follow
2. **Simple to understand and maintain** - Readable code with obvious intent
3. **Clean boundaries** - Clear separation between features and layers
4. **Early issue detection** - Catch problems at build time, not runtime
5. **Consistency** - Same patterns throughout the codebase

## Rules for Every Change

**Authorization.** A client permission check decides only what the UI shows. It cannot stop a crafted request. The server must authenticate the actor. The server must authorize each mutation for that actor and resource. The server must refuse with 403 before it changes data. When a user action receives a 403, show the failure in the component that made the request. Do not redirect the app for a per-action 403. Do not log the user out for a per-action 403. See [api-layer.md](./references/api-layer.md).

**Effects.** Use an effect only to synchronise with an external system. Work caused by a user action belongs in the event handler. For an async effect, cleanup marks that run stale. A stale run writes no state, on success or on failure. When the operation accepts an `AbortSignal`, also create one `AbortController` per run. Abort that controller in cleanup. Identify cancellation by the operation's own contract: a DOM `AbortError` by its `name`, an axios request by `axios.isCancel(error)`. Treat cancellation as no error. Every rejection that is not cancellation is a failure of the current run; write it to state, whatever its class. An effect that synchronises an imperative target (an editor, a map, a chart) with a prop or state applies the current value on every run, including the first run after mount. Do not guard it with a previous-value or transition check. Such a guard skips the state the component mounts in. See [useeffect.md](./references/useeffect.md).

**Boundaries.** A feature imports from shared code only, never from another feature. Do not disable the boundary lint rule. When two features need one component, move the component to `src/components/`. A shared component receives its data through props. A shared component does not import a feature API hook. The API module stays in the feature that owns the endpoint. Each feature that renders the shared component supplies that data itself: from its own API response, or through a feature-local component that calls the feature's own API hook. Alternatively, the app-level page composes the two features. See [project-structure.md](./references/project-structure.md).

**URL state.** Filters, search terms, and page numbers live in the URL search params. The URL gives shareable links and browser back and forward history for free; a store does not. Read and update the params through the router, with no `useState` copy to keep in sync. See [state-management.md](./references/state-management.md).

**Dependencies.** The decision trees below name the libraries this skill prefers. Use a library only when the project already has it. When a task forbids new dependencies, use the built-in hook or browser API instead.

## Quick Reference

| Topic                                | Guide                                                         |
| ------------------------------------ | ------------------------------------------------------------- |
| Directory layout and feature modules | [project-structure.md](./references/project-structure.md)     |
| Component design patterns            | [component-patterns.md](./references/component-patterns.md)   |
| Compound components (Card pattern)   | [compound-components.md](./references/compound-components.md) |
| State categories and solutions       | [state-management.md](./references/state-management.md)       |
| API client and request structure     | [api-layer.md](./references/api-layer.md)                     |
| Code splitting and optimization      | [performance.md](./references/performance.md)                 |
| useEffect guidance and alternatives  | [useeffect.md](./references/useeffect.md)                     |
| Testing pyramid and strategy         | [testing-strategy.md](./references/testing-strategy.md)       |
| Project tooling standards            | [project-standards.md](./references/project-standards.md)     |

## When to Use Each Guide

### Project Structure

Use [project-structure.md](./references/project-structure.md) when you need:

- Directory organization (app, features, components)
- Feature module structure
- Import architecture (unidirectional flow)
- ESLint boundary enforcement
- File naming conventions

### Component Patterns

Use [component-patterns.md](./references/component-patterns.md) when you need:

- Colocation principles
- Composition over props patterns
- Wrapping third-party components
- Avoiding nested render functions

### Compound Components

Use [compound-components.md](./references/compound-components.md) when you need:

- Multi-part components (Card, Accordion, etc.)
- Flexible composition patterns
- Semantic component structure

### State Management

Use [state-management.md](./references/state-management.md) when you need:

- State category decisions (component, application, server cache)
- useState vs useReducer guidance
- Server cache with React Query
- State placement guidelines

### API Layer

Use [api-layer.md](./references/api-layer.md) when you need:

- API client configuration
- Request structure (schema, fetcher, hook)
- Error handling (interceptors, boundaries)
- Security patterns (auth, sanitization, authorization)

### Performance

Use [performance.md](./references/performance.md) when you need:

- Code splitting strategies
- State optimization
- Children optimization patterns
- Styling performance
- Image optimization

### useEffect

Use [useeffect.md](./references/useeffect.md) when you need:

- When NOT to use useEffect (most cases)
- When useEffect IS appropriate (external systems)
- Dependency array rules
- Alternatives to useEffect

### Testing Strategy

Use [testing-strategy.md](./references/testing-strategy.md) when you need:

- Testing pyramid (prioritize integration over unit)
- What to test at each level (unit, integration, E2E)
- Testing Library principles (query by accessible names)

### Project Standards

Use [project-standards.md](./references/project-standards.md) when you need:

- Required tooling (ESLint, Prettier, TypeScript, Husky)
- Pre-commit hook configuration

## Quick Reference: Decision Trees

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
