---
name: react
description: "USE WHEN changing the logic, data, props, state, Effects or rendered text of a React component, hook or page, even a one-line change; NOT WHEN the request is styling only (class names, Tailwind, CSS, dark mode, spacing, shadows) or tests only, or when it models submit, in-flight, loading, retry or failure states, even for a named React form (xstate covers that, including its React wiring); applies React 19 composition, state, Effect, structure, API and performance rules with only the project's installed libraries."
---

# React

Write React 19 code with only the project's installed libraries. Do not add a dependency unless the user asks for one.

Before you change code, read each guide that matches the change. A change that crosses a boundary needs more than one guide. Follow the conditions and exceptions of each guide rule, not only the summaries below. Use the same guides to review components.

Return complete, type-correct code for each behaviour you claim, including event handlers and data flow. A comment, a `console.log` stub or a no-op callback is not an implementation.

| Change | Guide |
| --- | --- |
| Component APIs, boolean modes, explicit variants, children, compound components, providers, refs or context | [composition.md](references/composition.md) |
| State placement, URL state, handlers, Effects, actor integration or resource lifetimes | [state-effects.md](references/state-effects.md) |
| Feature structure, imports, endpoint schemas, fetchers and hooks, permissions or HTTP errors | [structure-api.md](references/structure-api.md) |
| Rendering, subscriptions, memoisation, deferred rendering, code loading or preloading | [performance.md](references/performance.md) |

Apply `principle-derive-from-one-owner`, `principle-reuse-before-building`, `principle-model-the-domain`, `principle-type-system-discipline`, `principle-hide-representations` and `principle-narrow-state-lifetime` within their own triggers and exclusions.

Render purity is a React rule, not the domain-purity principle. React types (`ReactNode`, ref props, typed actor refs) may cross component boundaries inside UI integration code. Do not let them enter framework-independent domain or API code. Put state in the nearest common UI owner that needs it. Put a temporal lifecycle (a request answer, retry, cancellation, polling, optimistic update or drag) in an actor, and follow `web:xstate`.

## Permissions and API answers

For a permission change, open the role fetcher and the HTTP wrapper that the action uses before you finish. Repair each conflict with the rules below in the same change, not only in the reply. Do not change unrelated endpoints.

- A UI permission check only controls what the UI shows. It cannot stop a crafted request. In the reply, state both facts and state that the server must authenticate the actor, authorise each mutation for that actor and resource, and refuse with 403 before it changes data.
- Put each permission rule in a plain exported function outside components, such as `canInvite(user)`. When access depends on a specific resource, include resource ownership in the predicate. Return `false` when there is no user. The component calls that same function. Test the function directly, without rendering React (`principle-keep-the-core-pure`).
- Call the action from its event handler. Show a rejected 403 as a visible failure in the component where the action happened. For a 403, do not sign the user out, clear the session or redirect; if the wrapper does, repair it. A 401 still signs the user out.
- Use the Fetch API, never axios. The wrapper checks `response.ok`. The fetcher parses the JSON body from `unknown` into the app's type. On this path, replace an existing `as` cast with a parser that narrows the value with `typeof` and `in` checks. Parse an unknown role or permission to an explicit unknown value that grants nothing and differs from each real role (`principle-parse-at-the-boundary`).

## State and Effects

- Derive values from props, state, URL parameters or actor snapshots during render. Do not copy them into state through an Effect.
- Put work that a user action causes in its event handler, not in an Effect that watches a flag.
- Use an Effect only to synchronise with an external system.
- An Effect that synchronises an imperative target (an editor, a chart, a map, a DOM node) applies the current values on each run, including the first run after mount. Do not guard it with a previous-value or transition check: that guard skips the state the component mounts in. List each value it reads as a dependency. Do not add a separate mount-only update Effect.
- Async Effect fallback: use it only when neither XState nor a query library is installed and dependencies cannot change. Each run creates its own `AbortController` when the operation accepts a signal. Cleanup marks the run stale, then aborts it. A stale run writes no state on success or on failure. Detect cancellation by `error.name === "AbortError"`, not by error class, and treat it as no error. Send each other rejection of the current run to the failure state.

### Effects that call a callback prop

When an Effect subscribes outside React and calls a callback prop, wrap the callback in `useEffectEvent`. Call the Effect Event only from that Effect or its subscription callbacks. Do not call it during render, from another hook or component, or from a user handler. Leave it out of the dependency array: its identity changes on each render. Keep reactive subscription values, such as `teamId`, as dependencies. Do not keep the latest callback in a ref. Do not ask callers to wrap it in `useCallback`.

### URL state

Keep filters, search terms and page numbers in router search parameters, not in a store. The URL gives shareable links and Back and Forward history; a store does not. In the component that renders the controls, read the values through the installed router's hook (for example `useSearchParams`). Write them in the handler of each control through the router's setter (for example `setSearchParams`), and show that handler in the code. Keep no `useState` copy and no synchronising Effect. Parse each value at the boundary: an unknown value falls back to a safe default, such as all roles or page 1. Derive the visible list during render. With an installed query library, pass the parsed values to the fetcher and to the query key. To build a link from the current view, read the router's current location inside the click handler, not `window.location`.

## Composition

- Do not add boolean or mode props (`isEditing`, `showAudience`, `variant`) that select behaviour or structure. Create explicitly named variant components. Each composes the shared parts and its own controls. A native attribute such as a button's `disabled` is not a mode prop.
- Compose structure with `children`. Use a render prop only when its owner supplies data, such as an item and index.
- Define each component at module scope, never inside another component.
- When separate parts share one stateful value, a provider owns it. Parts read a typed contract of `state`, named `actions` (such as `changeText` and `publish`) and `meta` from their own root's context. Do not expose a generic `update(updater)` or a raw setter. Providers with different storage (local state, or a value and callback from the page) supply the same contract, so the parts do not change. The provider wraps each consumer, including a preview or action outside the visual frame. Each mounted provider has its own value. Never report child state upward through an Effect. Never read sibling state through a ref.

## Markup that two features show

A feature never imports from another feature, including its `index.ts`. Do not disable the boundary lint rule. A component that two or more features use belongs in `src/components/`; state that reason when you move one. When a feature needs markup that another feature already shows, such as a person's avatar and name, move that markup into a component in `src/components/`. The component takes data as props, imports no feature code, calls no feature hook and is rendered by both features. Rebuilding the markup from shared parts such as `Card` and `Avatar` copies it; it does not share it. Do not add a mode prop to the original component. Do not add a re-export barrel.

The endpoint fetcher and hook stay in the feature that owns the endpoint. Each feature that renders the shared component supplies the data itself: from its own response, or through a feature-local component that calls its own hook. If the moved component called a feature hook, remove that call. The owning feature's component (the original caller or a feature-local wrapper) now calls the hook and passes the result as props. Alternatively, an app-level page composes the two features.
