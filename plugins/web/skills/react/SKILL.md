---
name: react
description: WHEN building, changing, debugging, or reviewing React components, hooks, state, effects, data flow, or feature architecture; NOT for React test-only work or framework-specific server rendering and routing; uses local reasoning to preserve pure rendering, clear ownership, repository boundaries, and measured performance.
---

# React

Use **local reasoning**: each component or Hook should be understandable from its inputs, owned state, rendered output, and explicit synchronization boundaries.

## Choose the branch

| Request | Route |
| --- | --- |
| Build or change React UI | Follow all four steps |
| Design or restructure a React feature | Follow all four steps and load the structure, component, and state references in step 2 |
| Debug or review React code | Follow all four steps read-only; edit only when implementation is in scope |
| Investigate React performance | Reproduce and measure in step 1, then load the performance reference |
| Write or change React tests only | Load `react-testing` for React setup and `frontend-testing` for rendered DOM behavior |
| Change server components, routing, loaders, or framework data flow | Follow the repository's framework conventions; apply this skill to the client React subtree |

## 1. Establish the render contract

Read the repository instructions, package versions, framework conventions, nearby components, callers, state and data boundaries, and affected tests. Reuse its component, styling, validation, data-fetching, error, and test patterns.

For every component or Hook in scope, identify:

- its public inputs and user-visible output;
- the event or data change that updates it;
- the closest owner for each state value;
- each external system it synchronizes with;
- its loading, empty, error, and success states where applicable.

For a performance request, capture a reproducible symptom and baseline measurement before proposing an optimization.

**Complete when:** every scoped component and Hook has a known render contract, owner, synchronization boundary, and existing coverage status.

## 2. Load only the matching reference

Read every reference whose condition matches before choosing the design:

| Condition | Required reference |
| --- | --- |
| Placing a feature or enforcing import boundaries | [Project structure](references/project-structure.md) |
| Designing a component API, composition, colocation, or dependency wrapper | [Component patterns](references/component-patterns.md) |
| Building a multi-part shared component with coordinated subcomponents | [Compound components](references/compound-components.md) |
| Choosing, lifting, sharing, or deriving state | [State management](references/state-management.md) |
| Adding, changing, or removing an Effect | [Effects](references/useeffect.md) |
| Defining API requests, server data, validation, authorization, or error boundaries | [API layer](references/api-layer.md) |
| Addressing a measured render, loading, image, or bundle problem | [Performance](references/performance.md) |
| Choosing test levels or coverage boundaries | [Testing strategy](references/testing-strategy.md), then load `react-testing` and `frontend-testing` for implementation |
| Establishing or changing lint, format, typecheck, or commit tooling | [Project standards](references/project-standards.md) |

Treat the repository's installed framework and libraries as the default. Use a reference's named dependency as an example unless that dependency already exists or the task explicitly includes adopting it.

**Complete when:** every design decision is backed by repository precedent or a matching reference, and each new dependency or convention is explicitly in scope.

## 3. Implement through React's boundaries

Keep rendering pure and idempotent from props, state, and context. Treat props, state, Hook arguments, Hook results, and values passed to JSX as immutable snapshots. Call Hooks at the top level of React components or custom Hooks, and render components through JSX.

Keep each state value with its closest owner, derive renderable values during render, and update event-driven state in the event that caused it. Use an Effect as an escape hatch for synchronizing with an external system; include every reactive dependency and return cleanup when the synchronization creates a subscription or resource.

Expose the smallest component and feature API that supports current callers. Colocate feature-specific UI and logic, compose shared behavior at an existing boundary, and preserve semantic HTML, keyboard behavior, focus, accessible names, and visible feedback.

Preserve the repository's data and error boundaries. Represent every applicable loading, empty, error, and success state, and keep authorization enforcement at its trusted boundary even when the UI also hides unavailable actions.

**Complete when:** every scoped render contract is implemented without duplicated state, hidden render side effects, broken Hook rules, or a new boundary that current behavior does not require.

## 4. Prove the change

Run the smallest affected test first, then the relevant test suite, typecheck, lint, and build commands available in the repository. For changed user-visible behavior, apply `react-testing` and `frontend-testing` and prove the behavior through the rendered DOM.

Inspect every scoped component and Hook for:

- pure rendering and immutable inputs;
- one owner for each state value;
- Effects justified by an external system, with complete dependencies and cleanup;
- loading, empty, error, and success behavior where applicable;
- stable public APIs, repository import boundaries, and accessible interaction;
- measured evidence for every performance optimization.

For review or debug-only work, return findings with file and behavior evidence. For implementation work, report the commands and outcomes.

**Complete when:** every scoped render contract has passing evidence, every configured check passes, and each unavailable or intentionally omitted check is named.
