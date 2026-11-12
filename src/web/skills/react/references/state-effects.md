# State, actors and Effects

Use React 19.2 and the project's installed libraries. Give each fact one owner. An Effect synchronises React with an external system; it is not a second render pass and it is not a way to notice that a user acted.

## Choose the owner before the hook

- Derive values from props, local state, URL parameters or actor snapshots during render. Do not copy them into another store or into `useState`.
- Start synchronous component state with `useState`. One event must set its value completely, with no external answer and no interruptible middle. Use `useReducer` only for synchronous updates to several fields.
- Keep filters, search terms and page numbers in router search parameters, not in a mirrored local draft or a global store.
- Use the installed form library for form inputs and validation, if there is one. Otherwise use synchronous local state. Do not add a library unless the user asks.
- Keep server data in the installed query library, not in a global UI store. A machine owns the journey's submit, retry, cancellation and resource lifetime; a query library owns server data, caching and invalidation. Without a query library, an installed XState machine invokes the request. Only the constrained [async Effect fallback](#use-the-async-effect-fallback-only-with-frozen-dependencies) keeps request state locally.
- A request answer, timer, retry, cancellation, polling, optimistic update or interruptible drag is temporal state. Follow `web:xstate`. Do not replace an installed machine with a reducer or an async Effect. Transitions and deferred values address [render cost](performance.md); they do not own requests or cancel them.

Good examples: `state-synchronous-draft` (synchronous edits), `state-synchronous-reducer` (multi-field changes), `state-router-filters` (URL state), `state-shared-save-actor` (actor ownership) and `state-query-owned-cache` (query-library ownership, when one is installed).

## Derive during render and reset by identity

Compute names, filtered lists, validity and actor permissions from their current owner. Never synchronise a copy through an Effect, including a copy of props or of an actor snapshot. An editable draft initialised from a prop is independent state only when the product deliberately lets it diverge from that value. When its identity changes, reset the whole editing boundary with a `key`. Do not reset a field in an Effect that watches a prop.

**Good example — `state-synchronous-draft`.** The full name is derived, the draft is deliberately editable, and a new person gets a new draft. The parent and the child observe the same synchronous change event; no Effect reports the child's state upward. For an expensive derivation, follow [the compiler and measurement rules](performance.md#memoise-only-measured-work-without-the-compiler), not an Effect cache.

```tsx
// example: state-synchronous-draft
import { useState } from "react";

type Person = Readonly<{ id: string; firstName: string; lastName: string }>;

function NameDraft({ person, onEdited }: {
  person: Person;
  onEdited: (fullName: string) => void;
}) {
  const [firstName, setFirstName] = useState(person.firstName);
  const [lastName, setLastName] = useState(person.lastName);
  const fullName = `${firstName} ${lastName}`.trim();

  return (
    <fieldset>
      <legend>Edit name</legend>
      <label>First name<input value={firstName} onChange={(event) => {
        const next = event.currentTarget.value;
        setFirstName(next);
        onEdited(`${next} ${lastName}`.trim());
      }} /></label>
      <label>Last name<input value={lastName} onChange={(event) => {
        const next = event.currentTarget.value;
        setLastName(next);
        onEdited(`${firstName} ${next}`.trim());
      }} /></label>
      <output>{fullName}</output>
    </fieldset>
  );
}

export function PersonEditor({ person }: { person: Person }) {
  const [lastEdit, setLastEdit] = useState("");
  return (
    <section>
      <NameDraft key={person.id} person={person} onEdited={setLastEdit} />
      <p aria-live="polite">Last edit: {lastEdit}</p>
    </section>
  );
}
```

## Keep synchronous updates together

When the next state depends on the previous state, use a functional update, also with React Compiler enabled. Set static or argument-only values directly. A functional update removes stale reads without `useCallback`. Do not chain Effects to calculate the consequences of one click.

**Good example — `state-functional-updates`.** Both queued increments see the latest value; reset and input changes need no updater function.

```tsx
// example: state-functional-updates
import { useState } from "react";

export function QuantityEditor() {
  const [quantity, setQuantity] = useState(0);
  const [note, setNote] = useState("");
  return (
    <section>
      <output>{quantity}</output>
      <button onClick={() => setQuantity((current) => current + 1)}>Add one</button>
      <button onClick={() => {
        setQuantity((current) => current + 1);
        setQuantity((current) => current + 1);
      }}>Add two</button>
      <button onClick={() => setQuantity(0)}>Reset</button>
      <label>Note<input value={note} onChange={(event) => setNote(event.currentTarget.value)} /></label>
    </section>
  );
}
```

Use a pure reducer when one synchronous event updates several fields. Do not model fetch status in a reducer: when XState is installed, loading, response, error, retry and cancellation belong to a machine.

**Good example — `state-synchronous-reducer`.** Placing a card updates the card, the gold count and the round in one transition, with no Effect cascade and no external lifecycle.

```tsx
// example: state-synchronous-reducer
import { useReducer } from "react";

type Card = "ordinary" | "gold";
type Game = Readonly<{ card: Card | null; goldCount: number; round: number }>;
type Move = { type: "PLACE"; card: Card } | { type: "RESET" };
const initialGame: Game = { card: null, goldCount: 0, round: 1 };

export function gameReducer(state: Game, move: Move): Game {
  if (move.type === "RESET") return initialGame;
  if (move.card === "ordinary") return { ...state, card: move.card };
  const nextGoldCount = state.goldCount + 1;
  return {
    card: move.card,
    goldCount: nextGoldCount === 4 ? 0 : nextGoldCount,
    round: nextGoldCount === 4 ? state.round + 1 : state.round,
  };
}

export function CardGame() {
  const [game, dispatch] = useReducer(gameReducer, initialGame);
  return (
    <section>
      <p>Round {game.round}; gold cards {game.goldCount}; last card {game.card ?? "none"}</p>
      <button onClick={() => dispatch({ type: "PLACE", card: "gold" })}>Place gold</button>
      <button onClick={() => dispatch({ type: "PLACE", card: "ordinary" })}>Place ordinary</button>
      <button onClick={() => dispatch({ type: "RESET" })}>Reset</button>
    </section>
  );
}
```

## Initialise expensive local state lazily

Pass an initialiser function to `useState` for a storage read, parsing, an index or a heavy transform, so the work does not repeat on every render. Keep the initialiser free of writes: development Strict Mode can call it twice. A cheap literal or a direct reference needs no wrapper function. Lazy initialisation does not permit storing a derived value that must track changing props.

**Good example — `state-lazy-preference`.** Parse an optional saved preference once per initialisation; this session's synchronous selection can then diverge. Invalid or unavailable storage falls back to the light default.

```tsx
// example: state-lazy-preference
import { useState } from "react";

type Theme = "light" | "dark";

function readInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem("theme-preference");
    if (stored === null) return "light";
    const parsed: unknown = JSON.parse(stored);
    return parsed === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function SessionThemePicker() {
  const [theme, setTheme] = useState(readInitialTheme);
  const [expanded, setExpanded] = useState(false);
  return (
    <section data-theme={theme}>
      <button onClick={() => setExpanded((current) => !current)}>Choose session theme</button>
      {expanded ? <select aria-label="Session theme" value={theme} onChange={(event) => {
        setTheme(event.currentTarget.value === "dark" ? "dark" : "light");
      }}><option value="light">Light</option><option value="dark">Dark</option></select> : null}
    </section>
  );
}
```

## Keep URL state in the router

Read and update filters, search and pagination through the installed router. Parse unknown values at the boundary and keep unrelated parameters. Derive the visible list directly. Browser Back and Forward must change the rendered controls and results without a synchronising Effect. Do not create a `useState` mirror.

For a value that only a click needs, do not subscribe. Read the router's current location inside the click handler. Do not use `window.location` or a render-time snapshot such as a `useHref` result. Read storage that only a callback needs at the time of the callback.

**Good example — `state-router-filters`.** Prerequisites: React Router installed, and `MembersPage` rendered under its provider. `ShareSearchButton` receives the existing data router; it does not create another.

```tsx
// example: state-router-filters
import { useSearchParams, type DataRouter } from "react-router";

type Member = Readonly<{ id: string; name: string; role: "admin" | "member" }>;

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
      <output>Page {page}</output>
    </section>
  );
}

export function ShareSearchButton({ router }: { router: DataRouter }) {
  function share() {
    const current = router.state.location;
    const params = new URLSearchParams(current.search);
    const destination = new URLSearchParams({
      from: current.pathname,
      q: params.get("q") ?? "",
    });
    void router.navigate(`/share?${destination.toString()}`);
  }
  return <button onClick={share}>Share current search</button>;
}
```

## Use the installed form library without adding one

If React Hook Form is already installed, let it own input values and validation; do not copy them into another store. Without a form library, synchronous `useState` is correct. A submit that starts a request still sends a typed event to its actor; a form library does not own the request lifecycle.

**Good example — `state-installed-form`.** Prerequisite: `react-hook-form` installed. Validation and field values belong to the form. An explicit submit commits an independent preview; it is not a mirrored live field or a fake request result.

```tsx
// example: state-installed-form
import { useState } from "react";
import { useForm } from "react-hook-form";

type NameFields = { name: string };

export function NamePreviewForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<NameFields>({
    defaultValues: { name: "" },
  });
  const [preview, setPreview] = useState("");
  return (
    <section>
      <form onSubmit={handleSubmit(({ name }) => setPreview(name.trim()))}>
        <label>Name<input {...register("name", {
          validate: (value) => value.trim().length > 0 || "Enter a name",
        })} /></label>
        {errors.name ? <p role="alert">{errors.name.message}</p> : null}
        <button type="submit">Update preview</button>
      </form>
      <output>Committed preview: {preview}</output>
    </section>
  );
}
```

## Place shared state at its narrowest common owner

Keep state local until siblings need it. Then lift it only to their nearest common parent or provider. Do not make every component value global. Low-frequency values such as theme, user information and flags can use context. For other shared state, reuse an installed selector-based store when its narrow subscriptions fit; do not install one to satisfy a preference.

**Good example — `state-local-context`.** The provider wraps both consumers but owns no unrelated page state. Its named action states intent; it is not a generic storage updater. Leave provider-value memoisation to React Compiler; do not add manual memoisation without a measured cost.

```tsx
// example: state-local-context
import { createContext, useContext, useState, type ReactNode } from "react";

type Theme = "light" | "dark";
type ThemeControls = Readonly<{ theme: Theme; toggleTheme: () => void }>;
const ThemeContext = createContext<ThemeControls | null>(null);

function useTheme() {
  const value = useContext(ThemeContext);
  if (value === null) throw new Error("Theme controls require ThemeProvider");
  return value;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  function toggleTheme() {
    setTheme((current) => current === "light" ? "dark" : "light");
  }
  return <ThemeContext value={{ theme, toggleTheme }}>{children}</ThemeContext>;
}

function ThemePreview() {
  const { theme } = useTheme();
  return <p>Preview theme: {theme}</p>;
}

function ThemeButton() {
  const { toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>Change theme</button>;
}

export function AppearancePanel() {
  return <ThemeProvider><ThemePreview /><ThemeButton /></ThemeProvider>;
}
```

For shared machine state, including fast-changing values, use `createActorContext` and focused selectors, not a context value that holds a copied snapshot. Never call `use(ActorContext)`: it is not a React context. Use `ActorContext.useSelector()` and `ActorContext.useActorRef()`. The parts of a stateful compound widget consume their root's state; shared presentational parts still receive props. See [composition.md](composition.md) for interchangeable providers, and for static children compared with render props that pass data.

## Let handlers send events and machines own time

A click or submit handler does synchronous work directly or sends a named, typed event to the installed actor. Do not set a `submitted` flag for an Effect to watch. The machine, not the handler, does temporal work such as a POST request and owns its completion, failure, cancellation and cleanup.

- Define machines at module scope.
- Pass per-instance creation data through `input`. Supply dependencies through `.provide()`, which keeps the machine configuration. Never rely on `useMemo` for actor identity.
- `input` is not a reactive prop channel. When the journey identity changes, key the boundary or send a typed event to the running actor. An Effect may send that event, because the running actor is an external system. Never copy the actor's snapshot back into React state.
- Machine context holds facts that survive transitions, not derived flags such as `canSave` and not copies of cached server data. Derive permissions and status in selectors. For a selector that creates a new object, pass a comparator; do not wrap a whole snapshot in `useMemo`.

**Good example — `state-shared-save-actor`.** Prerequisites: XState 5 and `@xstate/react` 6 installed. A module-scope machine receives an injected Fetch implementation through `.provide()`. An actor-context provider shares only the actor reference; UI parts select their own data. One named team-change event cancels the old invocation and clears its draft. A late result from a stopped invocation cannot move the current journey. `web:xstate` owns the full lifecycle design and its verification.

```tsx
// example: state-shared-save-actor
import { useEffect } from "react";
import { createActorContext } from "@xstate/react";
import { assign, fromPromise, setup } from "xstate";

type SaveInput = Readonly<{ teamId: string; draft: string }>;
type PersistDraft = (input: SaveInput, signal: AbortSignal) => Promise<void>;
type Context = { teamId: string; draft: string; error: unknown };
type Event =
  | { type: "DRAFT_CHANGED"; value: string }
  | { type: "TEAM_CHANGED"; teamId: string }
  | { type: "SAVE" }
  | { type: "CANCEL" };

export const persistDraft: PersistDraft = async ({ teamId, draft }, signal) => {
  const response = await fetch(`/api/teams/${encodeURIComponent(teamId)}/draft`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ draft }),
    signal,
  });
  if (!response.ok) throw new Error(`Save failed (${response.status})`);
};

function saveActor(persist: PersistDraft) {
  return fromPromise<void, SaveInput>(({ input, signal }) => persist(input, signal));
}

const saveMachine = setup({
  types: {
    context: {} as Context,
    events: {} as Event,
    input: {} as { teamId: string },
  },
  actors: { persist: saveActor(persistDraft) },
}).createMachine({
  id: "saveDraft",
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
    saved: {
      on: { DRAFT_CHANGED: { target: "editing", actions: assign({ draft: ({ event }) => event.value }) } },
    },
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

const providedMachine = bindSaveDraft(persistDraft);
const SaveContext = createActorContext(providedMachine);

function TeamBridge({ teamId }: { teamId: string }) {
  const actor = SaveContext.useActorRef();
  useEffect(() => { actor.send({ type: "TEAM_CHANGED", teamId }); }, [actor, teamId]);
  return null;
}

function DraftInput() {
  const actor = SaveContext.useActorRef();
  const draft = SaveContext.useSelector((snapshot) => snapshot.context.draft);
  const busy = SaveContext.useSelector((snapshot) => snapshot.matches("saving"));
  return <label>Draft<input disabled={busy} value={draft} onChange={(event) => {
    actor.send({ type: "DRAFT_CHANGED", value: event.currentTarget.value });
  }} /></label>;
}

function SaveControls() {
  const actor = SaveContext.useActorRef();
  const controls = SaveContext.useSelector((snapshot) => ({
    canSave: snapshot.can({ type: "SAVE" }),
    busy: snapshot.matches("saving"),
    saved: snapshot.matches("saved"),
    error: snapshot.context.error,
  }), (previous, next) => previous.canSave === next.canSave && previous.busy === next.busy &&
    previous.saved === next.saved && Object.is(previous.error, next.error));
  return (
    <aside>
      <button disabled={!controls.canSave} onClick={() => actor.send({ type: "SAVE" })}>Save</button>
      <button disabled={!controls.busy} onClick={() => actor.send({ type: "CANCEL" })}>Cancel</button>
      {controls.saved ? <p role="status">Saved</p> : null}
      {controls.error !== null ? <p role="alert">{String(controls.error)}</p> : null}
    </aside>
  );
}

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

XState's `setup.types` assertions are documented compile-time type declarations, not casts of runtime input. A consumed network response body still needs parsing; see [structure-api.md](structure-api.md).

## Keep server cache ownership in the installed query library

Do not put API responses in a global UI store, and do not copy the query cache into machine context. A machine may call the query library's API and own the refresh journey while the view reads data through its query hook. A mutation invalidates the owning query after the server succeeds. Reuse the library already installed (TanStack Query or SWR); do not add one and do not replace it with a hand-written cache.

**Good example — `state-query-owned-cache`.** Prerequisites: `@tanstack/react-query` installed, with XState 5 and `@xstate/react` 6. The server returns an array of `{ id: string, name: string }`. The query cache holds the data; the actor holds only refresh lifecycle and error facts. If neither library is installed, use only the constrained fallback below.

```tsx
// example: state-query-owned-cache
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { useActorRef, useSelector } from "@xstate/react";
import { assign, fromPromise, setup } from "xstate";

type User = Readonly<{ id: string; name: string }>;
const queryClient = new QueryClient();
const usersKey = ["users"];

async function loadUsers(signal: AbortSignal): Promise<User[]> {
  const response = await fetch("/api/users", { signal });
  if (!response.ok) throw new Error(`Users failed (${response.status})`);
  const body: unknown = await response.json();
  if (!Array.isArray(body)) throw new Error("Expected a user list");
  return body.map((item: unknown) => {
    if (typeof item !== "object" || item === null || !("id" in item) ||
        !("name" in item) || typeof item.id !== "string" || typeof item.name !== "string") {
      throw new Error("Invalid user");
    }
    return { id: item.id, name: item.name };
  });
}

const usersQuery = {
  queryKey: usersKey,
  queryFn: ({ signal }: { signal: AbortSignal }) => loadUsers(signal),
};

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

function Users() {
  const users = useQuery(usersQuery);
  const actor = useActorRef(refreshMachine);
  const refreshing = useSelector(actor, (snapshot) => snapshot.matches("refreshing"));
  const refreshError = useSelector(actor, (snapshot) => snapshot.context.error);
  return (
    <section>
      <button disabled={refreshing} onClick={() => actor.send({ type: "REFRESH" })}>Refresh</button>
      {users.isPending ? <p>Loading users</p> : null}
      {users.error !== null ? <p role="alert">{users.error.message}</p> : null}
      {refreshError !== null ? <p role="alert">{String(refreshError)}</p> : null}
      <ul>{users.data?.map((user) => <li key={user.id}>{user.name}</li>)}</ul>
    </section>
  );
}

export function UsersPage() {
  return <QueryClientProvider client={queryClient}><Users /></QueryClientProvider>;
}
```

The query owns the shared request and cache lifetime. Stopping the refresh actor stops its observation of the transition; it does not stop requests that other query consumers depend on. Do not claim that stopping an actor cancels work the query library owns.

## Subscribe to the smallest rendered value

Subscribe to a boolean or a selected primitive when that is all the UI needs, not to a continuous value or a whole snapshot. For actors, use the selectors and comparator in `state-shared-save-actor`; do not memoise a copy of the snapshot. For a media breakpoint, subscribe to `MediaQueryList` changes, not to every resize pixel.

**Good example — `state-derived-media-subscription`.** React sees only a breakpoint boolean. The subscription removes exactly the listener it added.

```tsx
// example: state-derived-media-subscription
import { useSyncExternalStore } from "react";

const compactQuery = "(max-width: 767px)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(compactQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(compactQuery).matches;
}

export function ResponsiveNavigation() {
  const compact = useSyncExternalStore(subscribe, getSnapshot);
  return <nav aria-label={compact ? "Compact navigation" : "Wide navigation"}>
    <a href="/members">{compact ? "Members" : "Team members"}</a>
  </nav>;
}
```

## Synchronise imperative targets from the current value

Name the external system before you keep an Effect. Valid uses: synchronising the DOM or a third-party widget, subscriptions with cleanup, integration with non-React code, and analytics caused by display rather than by a click. Put interaction-specific analytics in the handler. A resource lifecycle with an interruptible middle still belongs to the installed actor.

Apply the current prop or state on the first run and on every later run. A previous-value or transition guard skips the state the component mounts in. Use primitive dependencies for the values the Effect reads, not a whole `user` object. Derive a boolean outside the Effect only when the external target needs that boolean, and apply both branches: entering and leaving the condition must both synchronise.

**Good example — `state-imperative-current-values`.** The DOM meter receives the current values on mount, and the muted mode updates for both compact and wide widths. A change to an unrelated `user` field cannot rerun the owner synchronisation.

```tsx
// example: state-imperative-current-values
import { useEffect, useRef } from "react";

type User = Readonly<{ id: string; displayName: string }>;

export function SeatGauge({ used, limit, width, user }: {
  used: number; limit: number; width: number; user: User;
}) {
  const meterRef = useRef<HTMLMeterElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const compact = width < 768;
  const userId = user.id;

  useEffect(() => {
    const meter = meterRef.current;
    if (meter === null) return;
    meter.max = Math.max(1, limit);
    meter.value = used;
  }, [used, limit]);

  useEffect(() => {
    const video = videoRef.current;
    if (video !== null) video.muted = compact;
  }, [compact]);

  useEffect(() => {
    const meter = meterRef.current;
    if (meter !== null) meter.dataset.owner = userId;
  }, [userId]);

  return <section>
    <meter ref={meterRef} aria-label="Seats used" />
    <video ref={videoRef} controls src="/media/seat-guide.mp4" />
  </section>;
}
```

When the existing feature records page views, display-time analytics can use an Effect. Do not move click-specific analytics into an Effect and do not add telemetry the user did not request.

**Good example — `state-display-analytics`.** The browser queues an existing page-view event; a refusal is reported, not labelled as sent. Development can replay Effect setup, so this does not guarantee one event per app load.

```tsx
// example: state-display-analytics
import { useEffect } from "react";

export function PageView({ pathname }: { pathname: string }) {
  useEffect(() => {
    const payload = new Blob([JSON.stringify({ event: "page_view", pathname })], {
      type: "application/json",
    });
    if (!navigator.sendBeacon("/analytics/event", payload)) {
      console.error("The browser could not queue the page-view event");
    }
  }, [pathname]);
  return null;
}
```

## Declare real dependencies and split independent Effects

List every reactive value the Effect reads. Do not suppress the dependency check.

- Move a helper that only the Effect uses inside the Effect.
- Use a functional state update when the previous value is the only reason for a dependency.
- Put a synchronous multi-field rule in a reducer, not in an Effect chain.
- For non-reactive callback-prop logic, use the next section; do not use `useCallback` as a general way to escape a dependency. Manual memoisation, including `useCallback`, follows [the compiler and measurement conditions](performance.md#memoise-only-measured-work-without-the-compiler).

Split independent tasks with different dependencies into separate Effects. Do not tie a subscription's lifetime to an unrelated document title. The same split for expensive `useMemo` work is in [performance.md](performance.md#memoise-only-measured-work-without-the-compiler).

**Good example — `state-independent-effects`.** The title and the keyboard subscription have separate Effects and dependency lists. The helper is inside its Effect and the count uses a functional update. Each ArrowUp updates the local count synchronously, with no external answer and no interruptible middle.

```tsx
// example: state-independent-effects
import { useEffect, useState } from "react";

export function KeyboardCounter({ title, step }: { title: string; step: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    document.title = `${title} | Team settings`;
  }, [title]);

  useEffect(() => {
    function increment(event: KeyboardEvent) {
      if (event.key === "ArrowUp") setCount((current) => current + step);
    }
    window.addEventListener("keydown", increment);
    return () => window.removeEventListener("keydown", increment);
  }, [step]);

  return <output aria-live="polite">Count: {count}</output>;
}
```

## Read callback props through Effect Events

When an Effect's subscription calls a callback prop, wrap the non-reactive callback logic in `useEffectEvent`. Call the Effect Event only inside that Effect or in a callback of the subscription the Effect creates. Do not pass it to another component or hook, call it during render, or call it from a user handler. Do not hide reactive inputs in it: a changed subscription target stays in the dependency list.

Exclude the Effect Event from dependencies. Its identity is not stable; do not claim that it is. It reads the latest callback and values without reconnecting when only non-reactive logic changes. Do not use a latest-handler ref or a custom `useLatest` instead, and do not require callers to memoise their callbacks.

**Good example — `state-effect-event-subscription`.** A team change reattaches the browser subscription; a callback change does not. The installed listener may call the Effect Event because this Effect created the subscription.

```tsx
// example: state-effect-event-subscription
import { useEffect, useEffectEvent } from "react";

export function TeamMessages({ teamId, onMessage }: {
  teamId: string;
  onMessage: (text: string) => void;
}) {
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

Detect Fetch cancellation by `error.name === "AbortError"`, not by requiring a particular error class. Cancellation is not an error state. Every other rejection of the current run reaches the failure state, including thrown strings, ordinary `Error` objects and unexpected values. Development Strict Mode's setup, cleanup, setup sequence aborts and ignores the first request; only the current run can settle. Do not claim that a transition cancels a request.

**Good example — `state-frozen-dependency-fetch`.** A real Fetch request checks its HTTP status and parses an unknown response. The result is tagged with the user ID, so it cannot show the previous person's data during a prop change before the next Effect runs. At this endpoint, `User` is `{ id: string, name: string }`.

```tsx
// example: state-frozen-dependency-fetch
import { useEffect, useState } from "react";

type User = Readonly<{ id: string; name: string }>;
type RequestState =
  | { status: "loading"; userId: string }
  | { status: "success"; userId: string; user: User }
  | { status: "failure"; userId: string; error: unknown };

async function loadUser(userId: string, signal: AbortSignal): Promise<User> {
  const response = await fetch(`/api/users/${encodeURIComponent(userId)}`, { signal });
  if (!response.ok) throw new Error(`User request failed (${response.status})`);
  const value: unknown = await response.json();
  if (typeof value !== "object" || value === null || !("id" in value) ||
      !("name" in value) || typeof value.id !== "string" || typeof value.name !== "string") {
    throw new Error("Invalid user response");
  }
  return { id: value.id, name: value.name };
}

function isAbortError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "name" in error && error.name === "AbortError";
}

export function UserDetails({ userId }: { userId: string }) {
  const [state, setState] = useState<RequestState>({ status: "loading", userId });
  useEffect(() => {
    const controller = new AbortController();
    let stale = false;
    setState({ status: "loading", userId });
    void loadUser(userId, controller.signal).then(
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

A temporary DOM-adjacent value that does not drive declarative UI can live in a ref; updating it does not render. Rendered labels, counts and permissions need their real state owner, not a ref snapshot. Refs do not own drag start, pointer capture, Escape cancellation, document listeners or release on unmount: give that interruptible drag lifecycle to `web:xstate`.

**Good example — `state-transient-pointer-ref`.** The pointer position only moves a DOM marker while the pointer hovers. Inline-block display enables CSS transforms. There is no pointer capture, no drag lifecycle and no React state update per movement. React sets only the static display property; the ref owns the transform.

```tsx
// example: state-transient-pointer-ref
import { useRef } from "react";

export function PointerMarker() {
  const marker = useRef<HTMLSpanElement>(null);
  const lastX = useRef(0);
  return (
    <div onPointerMove={(event) => {
      lastX.current = event.clientX - event.currentTarget.getBoundingClientRect().left;
      const node = marker.current;
      if (node !== null) node.style.transform = `translateX(${lastX.current}px)`;
    }}>
      <p>Move the pointer across this area.</p>
      <span ref={marker} aria-hidden="true" style={{ display: "inline-block" }}>|</span>
    </div>
  );
}
```

## Initialise the application once, not on every mount

Work that must run once per app load belongs in the entry module or behind a module guard, not in a component's `useEffect(..., [])`. Components can remount, and Strict Mode can replay Effects. Do not confuse app-wide initialisation with a subscription or resource that must clean up and restart with its mounted owner. Per-user request state and actor instances are not app-wide initialisation.

**Good example — `state-app-once-init`.** Set the document language once per module load, before React mounts. The guard lets the entry helper run again without repeating app-wide work; no component Effect or per-component ref controls it.

```tsx
// example: state-app-once-init
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

let initialised = false;

function initialiseApplication() {
  if (initialised) return;
  const language = navigator.language || "en-GB";
  document.documentElement.lang = language;
  initialised = true;
}

function App() {
  return <main><h1>Team settings</h1></main>;
}

export function mountApplication(container: HTMLElement) {
  initialiseApplication();
  const root = createRoot(container);
  root.render(<StrictMode><App /></StrictMode>);
  return () => root.unmount();
}
```

[composition.md](composition.md) owns the rule that component definitions stay at module scope. [performance.md](performance.md) owns measured memoisation, simple expressions, transitions and deferred values.
