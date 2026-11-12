---
name: react
description: "USE WHEN adding to or changing a React component, hook or page, even a one-line change to what a card shows; NOT WHEN the state changes when a request answers or an interaction has an interruptible middle, such as a double submit, a loading flag, a retry or a drag (use web:xstate), or when writing tests or styling; applies React 19 composition, state, Effect, structure, API and performance rules with only the project's installed libraries."
---

# React

Write React 19 code with only the project's installed libraries. Do not add a dependency unless the user asks for one.

Before changing code, read every guide that matches the change. A change that crosses a boundary needs more than one guide. Each guide rule has a good example; follow its conditions and exceptions, not only the summaries below. Use the same guides to review components.

Return complete, type-correct code for every behaviour you claim, including event handlers and data flow; a comment is not an implementation.

| Change | Required guide |
| --- | --- |
| Component APIs, boolean modes, explicit variants, children, compound components, providers, refs or context | [composition.md](references/composition.md) |
| State placement, URL state, handlers, Effects, actor integration or resource lifetimes | [state-effects.md](references/state-effects.md) |
| Feature structure, imports, endpoint schemas, fetchers and hooks, permissions or HTTP errors | [structure-api.md](references/structure-api.md) |
| Rendering, subscriptions, memoisation, deferred rendering, code loading or preloading | [performance.md](references/performance.md) |

Apply these principles within their own triggers and exclusions:

- `principle-derive-from-one-owner` for a fact repeated across modules, services or stores.
- `principle-reuse-before-building` before you add a helper or a dependency.
- `principle-model-the-domain` for legal states and transitions.
- `principle-type-system-discipline` for distinctions the compiler must enforce.
- `principle-hide-representations` for private shapes that cross module boundaries.
- `principle-narrow-state-lifetime` for state that outlives its work.

Render purity is a React rule, not the domain-purity principle. React types (`ReactNode`, ref props, typed actor refs) may cross component boundaries inside UI integration. They must not enter framework-independent domain or API code. State belongs to the nearest common UI owner that needs it. Temporal lifecycles (a request answer, retry, cancellation, polling, optimistic update or drag) belong to an actor; follow `web:xstate`.

## Permissions and API answers

For a permission change, open the role fetcher and the HTTP wrapper that the action uses before you finish. Repair conflicts with the rules below in the same change, not only in the reply. Leave unrelated endpoints unchanged.

- A UI permission check decides only what the UI shows; it cannot stop a crafted request. State both facts in the reply: the check only controls what the page shows, and the server must authenticate the actor, authorise each mutation for that actor and resource, and refuse with 403 before it changes data.
- Put each permission rule in a plain exported function outside components, such as `canInvite(user)`. Include resource ownership in the predicate when access depends on a specific resource. Return `false` when there is no user. The component calls that same function. Test it directly without rendering React (`principle-keep-the-core-pure`).
- Call the action from its event handler. Show a rejected 403 as a visible failure in the component where the action happened. Do not sign the user out, clear the session or redirect for a 403; repair the wrapper if it does. A 401 still signs the user out.
- Use the Fetch API, never axios. The wrapper checks `response.ok`. The fetcher parses the JSON body from `unknown` into the app's type; replace an existing `as` cast on this path with a parser that narrows the value with `typeof` and `in` checks. Parse an unknown role or permission to an explicit unknown value that grants nothing, distinct from every real role (`principle-parse-at-the-boundary`).

## State and Effects

- Derive values from props, state, URL parameters or actor snapshots during render. Do not copy them into state through an Effect.
- Work that a user action causes belongs in its event handler, not in an Effect that watches a flag.
- Use an Effect only to synchronise with an external system.
- An Effect that synchronises an imperative target (an editor, a chart, a map, a DOM node) applies the current values on every run, including the first run after mount. Do not guard it with a previous-value or transition check: that guard skips the state the component mounts in. List every value it reads as a dependency. Do not add a separate mount-only update Effect.
- Async Effect fallback: use it only when neither XState nor a query library is installed and dependencies cannot change. Each run creates its own `AbortController` when the operation accepts a signal. Cleanup marks the run stale, then aborts it. A stale run writes no state on success or on failure. Detect cancellation by `error.name === "AbortError"`, not by error class, and treat it as no error. Every other rejection of the current run reaches the failure state.

### Effects that call a callback prop

When an Effect subscribes outside React and calls a callback prop, wrap the callback in `useEffectEvent`. Call the Effect Event only from that Effect or its subscription callbacks, not during render, from another hook or component, or from a user handler. Exclude it from the dependency array: its identity changes every render. Keep reactive subscription values, such as `teamId`, as dependencies. Do not keep the latest callback in a ref, and do not ask callers to wrap it in `useCallback`.

### URL state

Keep filters, search terms and page numbers in router search parameters, not in a store: the URL gives shareable links and browser Back and Forward history, and a store gives neither. Read them through the installed router and write them in each control's handler through the router's setter (for example `setSearchParams`), with no `useState` copy and no synchronising Effect. Parse each value at the boundary: an unknown value falls back to a safe default, such as all roles or page 1. Derive the visible list during render. With an installed query library, pass the parsed values to the fetcher and the query key. To build a link from the current view, read the router's current location inside the click handler, not `window.location`.

## Composition

- Do not add boolean or mode props (`isEditing`, `showAudience`, `variant`) that select behaviour or structure. Create explicitly named variant components; each composes the shared parts and its own controls. A native attribute such as a button's `disabled` is not a mode prop.
- Compose structure with `children`. Use a render prop only when its owner supplies data, such as an item and index.
- Define every component at module scope, never inside another component.
- When separate parts share one stateful value, a provider owns it. Parts read a typed contract of `state`, named `actions` (such as `changeText` and `publish`) and `meta` from their own root's context. Do not expose a generic `update(updater)` or raw setter. Providers with different storage (local state, or a value and callback from the page) supply the same contract, so the parts do not change. The provider wraps every consumer, including a preview or action outside the visual frame. Each mounted provider has its own value. Never report child state upward through an Effect and never read sibling state through a ref.

## Markup that two features show

A feature never imports from another feature, including its `index.ts`. Do not disable the boundary lint rule. A component that two or more features use belongs in `src/components/`; state that reason when you move one. When a feature needs markup that another feature already shows, such as a person's avatar and name, move that markup into a component in `src/components/`. The component takes data as props, imports no feature code, calls no feature hook and is rendered by both features. Rebuilding the markup from shared parts such as `Card` and `Avatar` copies it; it does not share it. Do not add a mode prop to the original component and do not add a re-export barrel.

The endpoint fetcher and hook stay in the feature that owns the endpoint. Each feature that renders the shared component supplies the data itself: from its own response, or through a feature-local component that calls its own hook. If the moved component called a feature hook, remove that call; the owning feature's component (the original caller or a feature-local wrapper) now calls the hook and passes the result as props. Alternatively, an app-level page composes the two features.
