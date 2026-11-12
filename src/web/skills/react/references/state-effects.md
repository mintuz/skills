# State, actors and Effects

Use React 19.2 and the project's installed libraries. Give each fact one owner. An Effect synchronises React with an external system. It is not a second render pass. It is not a way to notice that a user acted.

## Choose the owner before the hook

- Derive values from props, local state, URL parameters or actor snapshots during render. Do not copy them into another store or into `useState`.
- Start synchronous component state with `useState`. One event must set its value completely, with no external answer and no interruptible middle. Use `useReducer` only for synchronous updates to several fields.
- Keep filters, search terms and page numbers in router search parameters, not in a mirrored local draft or a global store.
- If a form library is installed, use it for form inputs and validation. Otherwise use synchronous local state. Do not add a library unless the user asks.
- Keep server data in the installed query library, not in a global UI store. A machine owns the journey's submit, retry, cancellation and resource lifetime. A query library owns server data, caching and invalidation. Without a query library, an installed XState machine invokes the request. Only the constrained [async Effect fallback](#use-the-async-effect-fallback-only-with-frozen-dependencies) keeps request state locally.
- A request answer, timer, retry, cancellation, polling, optimistic update or interruptible drag is temporal state. Follow `web:xstate`. Do not replace an installed machine with a reducer or an async Effect. Transitions and deferred values address [render cost](performance.md); they do not own requests or cancel them.

## Derive during render and reset by identity

Compute names, filtered lists, validity and actor permissions from their current owner. Never synchronise a copy through an Effect, including a copy of props or of an actor snapshot. An editable draft initialised from a prop is independent state only when the product deliberately lets it diverge from that value. When its identity changes, reset the whole editing boundary with a `key`, for example `<NameDraft key={person.id} person={person} />`. Do not reset a field in an Effect that watches a prop.

When a parent needs a child's edit, the child calls the parent's callback in the same change handler that sets its own state. No Effect reports the child's state upward. For an expensive derivation, follow [the compiler and measurement rules](performance.md#memoise-only-measured-work-without-the-compiler), not an Effect cache.

## Keep synchronous updates together

When the next state depends on the previous state, use a functional update, also with React Compiler enabled. Two queued `setQuantity((current) => current + 1)` calls both see the latest value. Set static or argument-only values directly, such as `setQuantity(0)`. A functional update removes stale reads without `useCallback`. Do not chain Effects to calculate the consequences of one click.

Use a pure reducer when one synchronous event updates several fields, such as a card placement that updates the card, the gold count and the round in one transition. Do not model fetch status in a reducer. When XState is installed, loading, response, error, retry and cancellation belong to a machine.

## Initialise expensive local state lazily

Pass an initialiser function to `useState` for a storage read, parsing, an index or a heavy transform, such as `useState(readInitialTheme)`. The work then does not repeat on each render. Keep the initialiser free of writes, because development Strict Mode can call it twice. Catch unavailable or invalid storage and fall back to a default. A cheap literal or a direct reference needs no wrapper function. Lazy initialisation does not permit storing a derived value that must track changing props.

## Keep URL state in the router

Read and update filters, search and pagination through the installed router. Parse unknown values at the boundary. Keep unrelated parameters. Derive the visible list directly. Browser Back and Forward must change the rendered controls and results without a synchronising Effect. Do not create a `useState` mirror.

When only a click needs a value, do not subscribe to it. Read the router's current location inside the click handler. Do not use `window.location` or a render-time snapshot such as a `useHref` result. When only a callback needs a stored value, read the storage at the time of the callback.

Prerequisites for the example: React Router installed, and `MembersPage` rendered under its provider. `ShareSearchButton` receives the existing data router; it does not create another.

```tsx
// example: state-router-filters
import { useSearchParams, type DataRouter } from "react-router";

function readPage(raw: string | null): number {
  if (raw === null || !/^[1-9]\d*$/.test(raw)) return 1;
  const page = Number(raw);
  return Number.isSafeInteger(page) ? page : 1;
}

export function MembersPage({ members }: { members: readonly Member[] }) {
  const [params, setParams] = useSearchParams();
  const search = params.get("q") ?? "";
  const rawRole = params.get("role");
  const role = rawRole === "admin" || rawRole === "member" ? rawRole : "all";
  const page = readPage(params.get("page"));
  const filtered = members.filter((member) =>
    (role === "all" || member.role === role) &&
    member.name.toLowerCase().includes(search.toLowerCase()));
  const visible = filtered.slice((page - 1) * 10, page * 10);

  function update(name: string, value: string) {
    setParams((current) => {
      const next = new URLSearchParams(current);
      next.set(name, value);
      if (name !== "page") next.set("page", "1");
      return next;
    });
  }

  return (
    <section>
      <label>Search<input value={search} onChange={(event) => update("q", event.currentTarget.value)} /></label>
      <select aria-label="Role" value={role} onChange={(event) => update("role", event.currentTarget.value)}>
        <option value="all">All</option><option value="admin">Admin</option><option value="member">Member</option>
      </select>
      <ul>{visible.map((member) => <li key={member.id}>{member.name}</li>)}</ul>
      <button disabled={page === 1} onClick={() => update("page", String(page - 1))}>Previous</button>
      <button disabled={page * 10 >= filtered.length} onClick={() => update("page", String(page + 1))}>Next</button>
    </section>
  );
}

export function ShareSearchButton({ router }: { router: DataRouter }) {
  function share() {
    const current = router.state.location;
    const params = new URLSearchParams(current.search);
    const destination = new URLSearchParams({ from: current.pathname, q: params.get("q") ?? "" });
    void router.navigate(`/share?${destination.toString()}`);
  }
  return <button onClick={share}>Share current search</button>;
}
```

## Use the installed form library without adding one

If React Hook Form is already installed, let it own input values and validation. Do not copy them into another store. Without a form library, synchronous `useState` is correct. A submit that starts a request still sends a typed event to its actor; a form library does not own the request lifecycle.

## Place shared state at its narrowest common owner

Keep state local until siblings need it. Then lift it only to their nearest common parent or provider. Do not make each component value global. Low-frequency values such as theme, user information and flags can use context. A context provider wraps all its consumers, owns no unrelated page state and exposes named actions (such as `toggleTheme`), not a generic storage updater. Leave provider-value memoisation to React Compiler; do not add manual memoisation without a measured cost. For other shared state, reuse an installed selector-based store when its narrow subscriptions fit. Do not install one to satisfy a preference.

For shared machine state, including fast-changing values, use `createActorContext` and focused selectors, not a context value that holds a copied snapshot. Never call `use(ActorContext)`: it is not a React context. Use `ActorContext.useSelector()` and `ActorContext.useActorRef()`. The parts of a stateful compound widget consume their root's state; shared presentational parts still receive props. See [composition.md](composition.md) for interchangeable providers, and for static children compared with render props that pass data.

## Let handlers send events and machines own time

A click or submit handler does synchronous work directly, or sends a named, typed event to the installed actor. Do not set a `submitted` flag for an Effect to watch. The machine, not the handler, does temporal work such as a POST request. The machine owns its completion, failure, cancellation and cleanup.

- Define machines at module scope.
- Pass per-instance creation data through `input`. Supply dependencies through `.provide()`, which keeps the machine configuration. Never rely on `useMemo` for actor identity.
- `input` is not a reactive prop channel. When the journey identity changes, key the boundary or send a typed event to the running actor. An Effect may send that event, because the running actor is an external system. Never copy the actor's snapshot back into React state.
- Machine context holds facts that survive transitions. It does not hold derived flags such as `canSave` or copies of cached server data. Derive permissions and status in selectors. For a selector that creates a new object, pass a comparator. Do not wrap a whole snapshot in `useMemo`.

XState's `setup.types` assertions are documented compile-time type declarations, not casts of runtime input. A consumed network response body still needs parsing; see [structure-api.md](structure-api.md). `web:xstate` owns the full lifecycle design and its verification.

Prerequisites for the example: XState 5 and `@xstate/react` 6 installed. One named team-change event cancels the old invocation and clears its draft. A late result from a stopped invocation cannot move the current journey.

```tsx
// example: state-shared-save-actor
type SaveInput = Readonly<{ teamId: string; draft: string }>;
type PersistDraft = (input: SaveInput, signal: AbortSignal) => Promise<void>;

function saveActor(persist: PersistDraft) {
  return fromPromise<void, SaveInput>(({ input, signal }) => persist(input, signal));
}

const saveMachine = setup({
  types: {
    context: {} as { teamId: string; draft: string; error: unknown },
    events: {} as
      | { type: "DRAFT_CHANGED"; value: string }
      | { type: "TEAM_CHANGED"; teamId: string }
      | { type: "SAVE" }
      | { type: "CANCEL" },
    input: {} as { teamId: string },
  },
  actors: { persist: saveActor(persistDraft) }, // persistDraft: Fetch POST that throws when !response.ok
}).createMachine({
  context: ({ input }) => ({ teamId: input.teamId, draft: "", error: null }),
  initial: "editing",
  on: {
    TEAM_CHANGED: {
      guard: ({ context, event }) => context.teamId !== event.teamId,
      target: ".editing",
      actions: assign(({ event }) => ({ teamId: event.teamId, draft: "", error: null })),
    },
  },
  states: {
    editing: {
      on: {
        DRAFT_CHANGED: { actions: assign({ draft: ({ event }) => event.value }) },
        SAVE: { guard: ({ context }) => context.draft.trim().length > 0, target: "saving" },
      },
    },
    saving: {
      invoke: {
        src: "persist",
        input: ({ context }) => ({ teamId: context.teamId, draft: context.draft }),
        onDone: { target: "saved" },
        onError: { target: "failed", actions: assign({ error: ({ event }) => event.error }) },
      },
      on: { CANCEL: { target: "editing" } },
    },
    saved: { on: { DRAFT_CHANGED: { target: "editing", actions: assign({ draft: ({ event }) => event.value }) } } },
    failed: {
      on: {
        SAVE: { target: "saving", actions: assign({ error: null }) },
        DRAFT_CHANGED: { target: "editing", actions: assign({ draft: ({ event }) => event.value, error: null }) },
      },
    },
  },
});

export function bindSaveDraft(persist: PersistDraft) {
  return saveMachine.provide({ actors: { persist: saveActor(persist) } });
}
const SaveContext = createActorContext(bindSaveDraft(persistDraft));

function TeamBridge({ teamId }: { teamId: string }) {
  const actor = SaveContext.useActorRef();
  useEffect(() => { actor.send({ type: "TEAM_CHANGED", teamId }); }, [actor, teamId]);
  return null;
}

function SaveControls() {
  const actor = SaveContext.useActorRef();
  const controls = SaveContext.useSelector((snapshot) => ({
    canSave: snapshot.can({ type: "SAVE" }),
    busy: snapshot.matches("saving"),
    error: snapshot.context.error,
  }), (previous, next) => previous.canSave === next.canSave && previous.busy === next.busy &&
    Object.is(previous.error, next.error));
  return (
    <aside>
      <button disabled={!controls.canSave} onClick={() => actor.send({ type: "SAVE" })}>Save</button>
      <button disabled={!controls.busy} onClick={() => actor.send({ type: "CANCEL" })}>Cancel</button>
      {controls.error !== null ? <p role="alert">{String(controls.error)}</p> : null}
    </aside>
  );
}
// DraftInput selects context.draft and sends DRAFT_CHANGED.

export function TeamDraft({ teamId }: { teamId: string }) {
  return (
    <SaveContext.Provider options={{ input: { teamId } }}>
      <TeamBridge teamId={teamId} />
      <section><DraftInput /></section>
      <SaveControls />
    </SaveContext.Provider>
  );
}
```

## Keep server cache ownership in the installed query library

Do not put API responses in a global UI store. Do not copy the query cache into machine context. A machine may call the query library's API and own the refresh journey while the view reads data through its query hook. A mutation invalidates the owning query after the server succeeds. Reuse the library already installed (TanStack Query or SWR). Do not add one. Do not replace it with a hand-written cache. If neither library is installed, use only the constrained fallback below.

With `@tanstack/react-query`, XState 5 and `@xstate/react` 6 installed, the query cache holds the data and the actor holds only the refresh lifecycle and error facts:

```tsx
// example: state-query-owned-cache
const usersQuery = { queryKey: usersKey, queryFn: ({ signal }: { signal: AbortSignal }) => loadUsers(signal) };

const refreshMachine = setup({
  types: { context: {} as { error: unknown }, events: {} as { type: "REFRESH" } },
  actors: {
    refresh: fromPromise(async () => {
      await queryClient.invalidateQueries({ queryKey: usersKey, refetchType: "none" });
      await queryClient.fetchQuery(usersQuery);
    }),
  },
}).createMachine({
  context: { error: null },
  initial: "ready",
  states: {
    ready: { on: { REFRESH: { target: "refreshing", actions: assign({ error: null }) } } },
    refreshing: {
      invoke: {
        src: "refresh",
        onDone: { target: "ready" },
        onError: { target: "ready", actions: assign({ error: ({ event }) => event.error }) },
      },
    },
  },
});
// The view calls useQuery(usersQuery) for data and useActorRef(refreshMachine) for the Refresh button.
```

The query owns the shared request and cache lifetime. Stopping the refresh actor stops its observation of the transition. It does not stop requests that other query consumers depend on. Do not claim that stopping an actor cancels work that the query library owns.

## Subscribe to the smallest rendered value

When the UI needs only a boolean or a selected primitive, subscribe to that value, not to a continuous value or a whole snapshot. For actors, use selectors and a comparator, as in `state-shared-save-actor`. Do not memoise a copy of the snapshot. For a media breakpoint, subscribe to `MediaQueryList` changes, not to each resize pixel. The subscription removes exactly the listener it added:

```tsx
// example: state-derived-media-subscription
function subscribe(onChange: () => void) {
  const media = window.matchMedia(compactQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}
const compact = useSyncExternalStore(subscribe, () => window.matchMedia(compactQuery).matches);
```

## Synchronise imperative targets from the current value

Name the external system before you keep an Effect. Valid uses: synchronising the DOM or a third-party widget, subscriptions with cleanup, integration with non-React code, and analytics caused by display rather than by a click. Put interaction-specific analytics in the handler. A resource lifecycle with an interruptible middle still belongs to the installed actor.

Apply the current prop or state on the first run and on each later run. A previous-value or transition guard skips the state the component mounts in. Use primitive dependencies for the values the Effect reads, not a whole `user` object, so a change to an unrelated `user` field does not rerun the Effect. Derive a boolean outside the Effect only when the external target needs that boolean. Then apply both branches: entering and leaving the condition must both synchronise.

```tsx
// example: state-imperative-current-values
const compact = width < 768;
const userId = user.id;
useEffect(() => {
  const video = videoRef.current;
  if (video !== null) video.muted = compact; // runs for compact and wide, including on mount
}, [compact]);
useEffect(() => {
  const meter = meterRef.current;
  if (meter !== null) meter.dataset.owner = userId;
}, [userId]);
```

When the existing feature records page views, display-time analytics can use an Effect. Do not move click-specific analytics into an Effect. Do not add telemetry that the user did not request. Report a refused `navigator.sendBeacon` call; do not label it as sent. Development can replay Effect setup, so an Effect does not guarantee one event per app load.

## Declare real dependencies and split independent Effects

List each reactive value that the Effect reads. Do not suppress the dependency check.

- Move a helper that only the Effect uses inside the Effect.
- Use a functional state update when the previous value is the only reason for a dependency.
- Put a synchronous multi-field rule in a reducer, not in an Effect chain.
- For non-reactive callback-prop logic, use the next section. Do not use `useCallback` as a general way to escape a dependency. Manual memoisation, including `useCallback`, follows [the compiler and measurement conditions](performance.md#memoise-only-measured-work-without-the-compiler).

Split independent tasks with different dependencies into separate Effects. For example, a `document.title` Effect depends on `[title]` and a `keydown` subscription depends on `[step]`. Do not tie a subscription's lifetime to an unrelated document title. The same split for expensive `useMemo` work is in [performance.md](performance.md#memoise-only-measured-work-without-the-compiler).

## Read callback props through Effect Events

When an Effect's subscription calls a callback prop, wrap the non-reactive callback logic in `useEffectEvent`. Call the Effect Event only inside that Effect or in a callback of the subscription that the Effect creates. Do not pass it to another component or hook. Do not call it during render or from a user handler. Do not hide reactive inputs in it: a changed subscription target stays in the dependency list.

Leave the Effect Event out of the dependencies. Its identity is not stable; do not claim that it is. It reads the latest callback and values without reconnecting when only non-reactive logic changes. Do not use a latest-handler ref or a custom `useLatest` instead. Do not require callers to memoise their callbacks.

```tsx
// example: state-effect-event-subscription
export function TeamMessages({ teamId, onMessage }: { teamId: string; onMessage: (text: string) => void }) {
  const reportMessage = useEffectEvent(onMessage);
  useEffect(() => {
    const channel = new BroadcastChannel(`team:${teamId}`);
    function receive(event: MessageEvent<unknown>) {
      if (typeof event.data === "string") reportMessage(event.data);
    }
    channel.addEventListener("message", receive);
    return () => {
      channel.removeEventListener("message", receive);
      channel.close();
    };
  }, [teamId]);
  return <p>Receiving messages for team {teamId}</p>;
}
```

## Use the async Effect fallback only with frozen dependencies

Use this recipe only when **neither XState nor a query library is installed and dependencies cannot change**. It is not an alternative to the installed actor examples above. When a query library is installed, use it. When XState is installed, use an invoked promise actor and its lifecycle.

Each Effect run owns its own request:

1. Create an `AbortController` inside the Effect when the operation accepts a signal.
2. In cleanup, mark that run stale first, then abort it.
3. A stale run writes no state on success or on failure, including ordinary errors. If the operation cannot be cancelled, keep the stale guard without a controller. An `import()` promise also cannot be aborted; see [conditional loading](performance.md#load-conditional-modules-and-preload-on-intent).

Detect Fetch cancellation by `error.name === "AbortError"`, not by a particular error class. Cancellation is not an error state. Each other rejection of the current run reaches the failure state, including thrown strings, ordinary `Error` objects and unexpected values. Development Strict Mode's setup, cleanup, setup sequence aborts and ignores the first request; only the current run can settle. Do not claim that a transition cancels a request.

Tag the result with its input, such as the user ID, so the component does not show the previous person's data during a prop change before the next Effect runs.

```tsx
// example: state-frozen-dependency-fetch
type RequestState =
  | { status: "loading"; userId: string }
  | { status: "success"; userId: string; user: User }
  | { status: "failure"; userId: string; error: unknown };

function isAbortError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "name" in error && error.name === "AbortError";
}

export function UserDetails({ userId }: { userId: string }) {
  const [state, setState] = useState<RequestState>({ status: "loading", userId });
  useEffect(() => {
    const controller = new AbortController();
    let stale = false;
    setState({ status: "loading", userId });
    void loadUser(userId, controller.signal).then( // loadUser checks response.ok and parses unknown JSON
      (user) => {
        if (!stale) setState({ status: "success", userId, user });
      },
      (error: unknown) => {
        if (stale || isAbortError(error)) return;
        setState({ status: "failure", userId, error });
      },
    );
    return () => {
      stale = true;
      controller.abort();
    };
  }, [userId]);

  if (state.userId !== userId || state.status === "loading") return <p role="status">Loading user</p>;
  if (state.status === "failure") return <p role="alert">{String(state.error)}</p>;
  return <h2>{state.user.name}</h2>;
}
```

## Keep per-frame values in refs, not lifecycle flags

A temporary DOM-adjacent value that does not drive declarative UI can live in a ref, such as a pointer position that only moves a DOM marker through `style.transform` during hover. Updating a ref does not render. Rendered labels, counts and permissions need their real state owner, not a ref snapshot. Refs do not own drag start, pointer capture, Escape cancellation, document listeners or release on unmount. Give that interruptible drag lifecycle to `web:xstate`.

## Initialise the application once, not on every mount

Put work that must run once per app load in the entry module or behind a module guard (`let initialised = false`), before React mounts. Do not put it in a component's `useEffect(..., [])`: components can remount, and Strict Mode can replay Effects. Do not confuse app-wide initialisation with a subscription or resource that must clean up and restart with its mounted owner. Per-user request state and actor instances are not app-wide initialisation.

[composition.md](composition.md) owns the rule that component definitions stay at module scope. [performance.md](performance.md) owns measured memoisation, simple expressions, transitions and deferred values.
