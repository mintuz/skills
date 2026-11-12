# React performance and rendering correctness

These rules apply to client-only React 19 applications. Fix the measured bottleneck, not each render. A render is not evidence of a performance defect. Before you add `memo`, `useMemo`, `useCallback` or manually hoisted JSX, check whether React Compiler is enabled:

- Compiler enabled: leave memoisation to the compiler.
- Compiler disabled: add manual memoisation only for measured expensive work.

## Measure the interaction before changing it

Record a repeatable interaction, a representative data size, the build mode, the device and the compiler setting. For example, type the same search term into a 5,000-member directory and compare the input response and the results commit before and after the change. Use the React DevTools Profiler, or a `<Profiler id="member-results" onRender={...}>` around the suspected subtree, to find the responsible subtree. Do not profile unrelated UI. Inspect the network waterfall for route or resource loading. Repeat the same interaction in the same environment after the change. Measure production behaviour with a profiling-enabled build; development Strict Mode work is not a production timing baseline. Record observations, not a promised percentage or an impact label. The examples below show mechanisms. None of them proves a speed result for your application.

When several measured problems compete, fix route and feature loading and duplicate client work before small render optimisations. Leave advanced patterns until their need is established. Server rendering and plain-JavaScript optimisation rules are outside this skill's scope.

## Keep rendering pure

Do not mutate props, state or externally visible objects that existed before this render. React can run a render again or abandon it. Build a new local result instead, such as `seats.slice().sort(...)`. Mutating a fresh local accumulator, such as a new `Map` of totals, is safe while it cannot escape before the computation returns. Keep externally visible changes in the event handler or the lifecycle owner, not in render.

React render purity is separate from domain purity. A business rule should also work without React, but extracting it does not make an impure render safe.

An existing module-level cache used during render is permitted only for a **pure function keyed by all its inputs**, and only when a measured cost justifies it. A cache hit and a cache miss must have the same observable result. Do not cache mutable session or cookie state, omit inputs from keys or expose mutable cached values. This rule restricts an existing measured cache; it does not recommend adding one. A pure local calculation is the correct default.

## Split routes with React.lazy and Suspense

Load route code on demand with `lazy` and show a meaningful `Suspense` fallback.

- Define lazy components outside rendering, so their identity does not change on each render.
- Import the route file itself, not a feature barrel.
- Use the existing router. Do not add a second router.
- Send a rejected lazy import to an error boundary, not to a permanent loading message.

```tsx
// example: react-performance-lazy-routes
const Reports = lazy(() => import('./performance-reports-panel'));
const Notes = lazy(() => import('./performance-note-editor'));

export function ApplicationRoutes() {
  return (
    <RouteLoadBoundary /* renders "This page could not load: <message>. Reload the page to try again." */>
      <Suspense fallback={<p role="status">Loading page…</p>}>
        <Routes>
          <Route path="/reports" element={<Reports />} />
          <Route path="/notes" element={<Notes />} />
        </Routes>
      </Suspense>
    </RouteLoadBoundary>
  );
}
```

Mount `ApplicationRoutes` inside the application's existing React Router provider. A lazy page's props, such as an editor's `initialText`, are creation-time data, not a copy kept in step with future props.

## Load conditional modules and preload on intent

Keep a conditional feature's module out of the eager import path. Load it only when it is activated, or preload it on hover, keyboard focus or an enabling feature flag. Preloading is speculative: measure its network cost as well as the wait it removes. In this client-only scope, no server-bundle claim or `typeof window` guard is needed.

An import that finishes after the feature is disabled, replaced or unmounted must not restore an obsolete feature or report an obsolete failure. `import()` cannot be aborted. When XState is installed, let an invoked actor own the loading attempt: stopping the actor discards its outcome, not the module download. If neither an actor nor an installed data library is available and dependencies are frozen, an async Effect needs the stale-run guard on **both** success and failure described in [state-effects.md](state-effects.md#use-the-async-effect-fallback-only-with-frozen-dependencies).

In the example, the machine has `idle`, `loading` (invokes the import), `ready` and `failed` states. `LOAD` moves `idle` and `failed` to `loading`; `ready` ignores repeated hover and focus loads. `RESET` from any state clears the module and error and returns to `idle`, which stops a running invocation. The view reads the actor's status, not another React loading flag. A failure shows a `role="alert"` with a retry button that sends `LOAD`. An open toggle is synchronous UI state that only the user controls.

```tsx
// example: react-performance-conditional-preload
const loadEditor = fromPromise(async () => import('./performance-note-editor'));

export function IntentLoadedEditor() {
  const actor = useActorRef(editorModuleMachine);
  const [isOpen, setIsOpen] = useState(false);
  const preload = () => actor.send({ type: 'LOAD' });
  return (
    <>
      <button onMouseEnter={preload} onFocus={preload} onClick={() => { setIsOpen(true); preload(); }}>Open editor</button>
      {isOpen && <EditorContents actor={actor} />}
    </>
  );
}

export function FlagLoadedEditor({ enabled }: { enabled: boolean }) {
  const actor = useActorRef(editorModuleMachine);
  useEffect(() => {
    actor.send({ type: enabled ? 'LOAD' : 'RESET' });
    return () => { actor.send({ type: 'RESET' }); };
  }, [actor, enabled]);
  return enabled ? <EditorContents actor={actor} /> : null;
}
```

The Effect applies the **current** `enabled` value on its first run and on each later run, with no previous-value comparison. Unmount stops the actor, so a late import outcome does no harm.

## Narrow subscriptions and move state below unrelated children

Split global state by usage. Do not make each reader subscribe to unrelated user, theme, notification and cart updates. A selector-capable store can keep one underlying store if each reader subscribes narrowly. With an actor, use focused `useSelector` subscriptions, not a whole snapshot followed by destructuring. See [state-effects.md](state-effects.md#subscribe-to-the-smallest-rendered-value).

For an expensive initial value, pass a pure initialiser to `useState`, not the result of running the computation on each render. See [state-effects.md](state-effects.md#initialise-expensive-local-state-lazily).

Create an unrelated subtree outside the component that owns frequently changing state, then pass it as `children`, for example `<Counter><SeatReport seats={seats} /></Counter>`. The owning component then does not recreate the child element on its own updates. This does **not** stop the child's own state, context, actor or parent-supplied prop changes from rendering it.

## Memoise only measured work without the compiler

**Prerequisite:** manual memoisation requires **React Compiler disabled** and profiling that shows these computations or renders are costly on the real dataset. With the compiler enabled, keep component boundaries, early returns and pure computations, and remove manual `memo` and `useMemo` wrappers. Keep a placeholder inline, not manually hoisted. Compiler configuration is a prerequisite; a component does not enable it.

Put expensive work in a child that the parent does not render while it returns a loading or empty view. Do not calculate it with a parent hook before the parent's early return. If manual memoisation is justified, a `memo` child can also skip renders caused by the parent when its props are unchanged. That is an optimisation, not a correctness guarantee.

When measured computations depend on different inputs, memoise them separately, so a change to one input does not rerun work that does not use it. A dependent stage depends on the result of its previous stage. Do not split a cheap expression into more hooks. Independent Effects follow the same dependency rule; see [state-effects.md](state-effects.md#declare-real-dependencies-and-split-independent-effects).

```tsx
// example: react-performance-measured-memo (compiler off, cost measured)
const UsageHistogram = memo(function UsageHistogram({ readings }: { readings: readonly Reading[] }) {
  const totals = useMemo(() => totalsByDay(readings), [readings]);
  return <ul>{totals.map(([day, total]) => <li key={day}>{day}: {total} seats</li>)}</ul>;
});

export function UsagePanel({ readings, loading }: { readings: readonly Reading[]; loading: boolean }) {
  if (loading) return <p role="status">Loading usage…</p>;
  return <UsageHistogram readings={readings} />;
}

// example: react-performance-independent-memos
const filtered = useMemo(() => products.filter(product => product.category === category), [products, category]);
const sorted = useMemo(() => filtered.slice().sort(byPrice(order)), [filtered, order]);
```

Do not use `useCallback` as a general way to remove Effect dependencies. First move an Effect-only helper inside the Effect, and keep each reactive dependency. Use an Effect Event only for genuinely non-reactive Effect logic, not as a stable callback prop. Without the compiler, a callback's identity may be worth keeping when profiling shows that it invalidates an expensive memoised child. Keep its real dependencies; a cache does not permit a stale closure. For example, `useCallback((id) => setSelected(current => current.includes(id) ? current : [...current, id]), [])` uses a functional update, so it does not capture an old selection. With the compiler, leave this memoisation to the compiler. A cheap list without a measured cost needs neither manual wrapper.

Calculate a cheap primitive expression directly, in either compiler mode. A boolean OR, a string concatenation or a small arithmetic expression does not need `useMemo` or a second state variable, for example `const loading = membersLoading || rolesLoading`.

## Hoist static JSX only without the compiler

With React Compiler enabled, leave static JSX in the component. Without it, move genuinely static JSX out of rendering only when its recreation is a measured cost. Do not hoist elements that depend on props, state or context.

## Keep numeric values off the left of JSX &&

When the condition can be `0` or `NaN`, use an explicit ternary, because React can render those values as text. A genuinely boolean condition may use `&&`. Do not ban or rewrite it only for consistency.

```tsx
// example: react-performance-boolean-condition
{Number.isFinite(count) && count > 0 ? <span>{count} unread</span> : null}
{showHelp && <p>Choose a message to read it.</p>}
```

## Preserve hidden UI with Activity without promising frozen renders

Use `<Activity mode={visible ? 'visible' : 'hidden'}>` (React 19.2 or later) when a frequently hidden subtree must keep its state and DOM. Hidden children **still re-render** for new props at a lower priority. React cleans up their Effects while they are hidden and recreates the Effects when they become visible. Do not use Activity to promise that hidden code stops rendering or that an external subscription keeps running. The external target must receive its current value again when Effects restart, including on first display.

## Use transitions for render scheduling, not request ownership

Use `startTransition` for non-urgent state updates, and `useTransition` when the UI needs React's pending-render status. Keep text input updates urgent. A transition schedules React rendering. It does not move synchronous computation to a worker, cancel a fetch, abort an earlier import or guard against an out-of-order response. `isPending` describes transition work, not a request, retry or cancel lifecycle. The existing actor owns that lifecycle, and the installed query library owns server data.

After measuring costly results rendering, keep the draft input immediate and mark only the result-query update as non-urgent. With the compiler on, remove `memo` from the results component; a manual memo boundary is only for the measured, compiler-off case.

```tsx
// example: react-performance-render-transition
const [draft, setDraft] = useState('');
const [resultQuery, setResultQuery] = useState('');
const [isPending, startTransition] = useTransition();
<input value={draft} onChange={event => {
  const value = event.currentTarget.value;
  setDraft(value);
  startTransition(() => setResultQuery(value));
}} />
{isPending && <p role="status">Updating results…</p>}
<div aria-busy={isPending}><MemberResults members={members} query={resultQuery} /></div>
```

The result query is a deliberately scheduled render version of the draft, not a second owner of a URL filter or server response. For a shareable filter, keep its authoritative value in router search parameters and defer only its rendering.

If an asynchronous operation comes before a React state update, each state update **after an `await`** needs a new `startTransition` call to be a transition, even if earlier code was already inside one. That does not fix response ordering: the current owner must reject stale results on success and on failure. Do not wrap an async fetch in a transition as a cancellation pattern; the fetch itself is not inside an async transition.

**Prerequisite for the next example:** use the async Effect fallback only when **neither XState nor a query library is installed and dependencies cannot change**. When either is installed, keep temporal work in that owner; this example does not permit replacing it. Measurement must show that rendering the fetched directory is costly enough to schedule as non-urgent. Key the owner by `teamId` (`<DirectoryForTeam key={teamId} teamId={teamId} />`), so it cannot show the previous team's results while the next Effect starts.

```tsx
// example: react-performance-post-await-transition
useEffect(() => {
  const controller = new AbortController();
  let stale = false;
  async function load(): Promise<void> {
    try {
      const members = await loadMembers(teamId, controller.signal); // checks response.ok, parses unknown
      if (stale) return;
      startTransition(() => setState({ status: 'success', members })); // new scope after await
    } catch (error: unknown) {
      if (stale || isAbortError(error)) return;
      setState({ status: 'failure', error });
    }
  }
  void load();
  return () => {
    stale = true;
    controller.abort();
  };
}, [teamId]);
```

The loading and failure branches belong only to this constrained Effect recipe, not to `isPending`. A transition can defer a React commit; it neither cancels the request nor makes its answer current. A key change or unmount stops the old owner, and its cleanup rejects late successes and ordinary failures.

## Defer expensive derived rendering

Use `useDeferredValue` when a measured expensive result depends on a value whose updates you do not control, or when React must keep the previous results while the input updates. Defer a primitive or stable value, not a new object created on each render. On the first render, the deferred value is current unless you supply an initial value. Deferral is not a fixed debounce delay, request deduplication or cancellation.

Without the compiler, and when measurement justifies both the expensive work and the manual memo boundary, memoise the costly computation by its deferred input and keep a memoised result boundary, so an urgent input render can reuse the old results. With React Compiler, keep `useDeferredValue` and remove the manual memo wrappers; the compiler provides that reuse.

```tsx
// example: react-performance-deferred-results
const deferredQuery = useDeferredValue(query);
const stale = query !== deferredQuery;
<input value={query} onChange={event => setQuery(event.currentTarget.value)} />
{stale && <p role="status">Showing the previous search while results update.</p>}
<div aria-busy={stale}><DeferredMemberList members={members} query={deferredQuery} /></div>
```

## Share requests through the data library already installed

Use the installed client data library's query key and cache scope to share requests, cached results and revalidation between consumers.

- Do not add SWR to an application that already uses another cache.
- Do not create a parallel hand-written cache. Do not copy cache data into actor or React state.
- Truly immutable data can use the installed library's immutable-query option.
- For mutations, use that library's mutation API. The actor owns submit, failure and retry state; the cache owns server data.
- If no such library is installed, keep the existing owner and the guarded fetching recipe in [state-effects.md](state-effects.md#use-the-async-effect-fallback-only-with-frozen-dependencies). This rule does not permit adding a dependency.

**Prerequisite for the SWR examples:** **SWR 2.x** is already installed. `swr`, `swr/immutable` and `swr/mutation` are real exports that need default imports. These examples do not tell you to install SWR. For another installed library, use its equivalent cache API.

Consumers that use the same key inside the same SWR cache provider share one request. Disable revalidation only for data that the endpoint contract defines as immutable, such as a build identifier for this deployment. Fetch failures and invalid payloads must reach SWR as errors: the fetcher checks `response.ok` and parses the `unknown` body.

```tsx
// example: react-performance-swr-cache
const { data, error } = useSWR<readonly Member[], Error>('/api/members', fetchMembers);
const { data: buildId } = useSWRImmutable<string, Error>('/api/build-id', fetchBuildId);
```

For a mutation (`react-performance-swr-mutation`), SWR performs the mutation and revalidates the profile key. A module-scope machine owns the submit attempt (`idle`, `saving`, `saved`, `failed`). It does not copy the returned profile into its context. `input` supplies the creation-time name, and `.provide()` installs the real SWR mutation actor without a placeholder implementation:

```tsx
const { trigger } = useSWRMutation('/api/profile', renameProfile);
const actor = useActorRef(saveMachine.provide({
  actors: {
    saveProfile: fromPromise<void, { name: string }>(async ({ input, signal }) => {
      await trigger({ name: input.name, signal }, { throwOnError: true, revalidate: true });
    }),
  },
}), { input: { initialName } });
```

The machine accepts no new submit while saving. Each failure that is not a cancellation is visible in the submitting feature. The draft is synchronous local state. `initialName` is creation-time draft data, not a live cache subscription; key or remount the editor to start a different editing journey. Unmount stops the invoked attempt and aborts its Fetch signal. SWR's cache policy still owns the server data. Stopping a client actor cannot undo a mutation that the server already accepted. The example's endpoint returns success only after the profile change is committed.

## Share global listeners only through an installed subscription owner

When many components need the same global event, share its source subscription through the installed library. Do not add one native listener for each instance. Do not add SWR only for keyboard shortcuts. If SWR is not installed, reuse the application's existing listener or actor owner. Do not build a second module-level event bus for this rule.

**Prerequisite:** the example needs **SWR 2.1 or later** already installed and React 19.2. All users of this hook must share the application's single SWR cache scope. A separate cache or provider needs its own subscription owner and callback registry; do not mix scopes. The registry holds subscriptions, not cached render data. Each callback is registered and removed by its Effect. The Effect Event reads the latest callback; it is not a dependency and is not passed directly to another hook. The last SWR subscriber releases the native listener.

```tsx
// example: react-performance-shared-keyboard-listener
const callbacks = new Map<string, Set<() => void>>();

const subscribeKeyboard: SWRSubscription<string, never, Error> = () => {
  const listener = (event: KeyboardEvent) => {
    if (event.metaKey) for (const callback of callbacks.get(event.key) ?? []) callback();
  };
  window.addEventListener('keydown', listener);
  return () => { window.removeEventListener('keydown', listener); };
};

export function useSharedShortcut(key: string, callback: () => void): void {
  const onShortcut = useEffectEvent(callback);
  useEffect(() => {
    const subscriber = () => onShortcut();
    const existing = callbacks.get(key);
    const subscribers = existing ?? new Set<() => void>();
    subscribers.add(subscriber);
    if (existing === undefined) callbacks.set(key, subscribers);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) callbacks.delete(key);
    };
  }, [key]);
  useSWRSubscription<never, Error>('application-global-keydown', subscribeKeyboard);
}
```

## Select React DOM resource hints by the resource's job

Use hints only for resources you expect to need. Inspect the resulting network waterfall before you call the change an improvement. When the application's existing framework or route loader already manages those resources, prefer it. These React DOM APIs also work on the client; they do not need server rendering.

| API | Appropriate resource |
| --- | --- |
| `prefetchDNS` | A third-party origin likely to be used later; resolve its DNS without opening the full connection |
| `preconnect` | An origin you will contact immediately; open its connection early |
| `preload` | A critical current-page resource, such as a font; fetch it without applying or executing it |
| `preloadModule` | A module likely to be needed on the next route; fetch it without executing it |
| `preinit` | A stylesheet or script that must be fetched and applied or executed early |
| `preinitModule` | An ES module that must be fetched and executed early |

Use the real deployed asset URLs. In a Vite application, a guessed `/dashboard.js` does not name its hashed output chunk. Use the resource URL that the build or runtime knows, or use a literal dynamic-import preload so that the build tool resolves the chunk. Do not use an early-execution hint for a speculative module with unwanted top-level side effects.

Call hints for the current page's declared critical resources during render, call `preloadModule` on route intent (hover or focus), and call `preinit` or `preinitModule` only on an explicit activation:

```tsx
// example: react-performance-resource-hints
preload(resources.currentFontUrl, { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' });
preinit(resources.criticalStylesheetUrl, { as: 'style' });
const prepareNextRoute = () => preloadModule(resources.nextRouteModuleUrl, { as: 'script' });
```

`preinit` fetches **and executes or applies**; `preload` only fetches. An activation that calls `preinit` requests execution; it does not mean loading has finished. Before you expose dependent actions, the integration's existing lifecycle owner must supply readiness and failure handling.
