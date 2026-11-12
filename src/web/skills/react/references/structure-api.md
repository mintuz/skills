# Project structure and API boundaries

Read this guide before you move code between features, add an endpoint, change a permission or change HTTP error handling. Keep the project's existing conventions and installed tools. Do not add a library only because an example uses it.

## Place code by its owner

- `app/` holds routes, the router and application providers.
- A feature folder holds one business capability.
- Shared folders hold code that several features use. A component that several features use belongs in `src/components/`. A component specific to one feature belongs in that feature's `components/`. Otherwise, colocate it with its consumer.

Keep related components, hooks, styles and state close to where they are used. Test authoring is outside this skill.

Create a feature folder when at least two of these are true: it has its own routes or pages, it has its own endpoints, and it has components not shared elsewhere. Otherwise, extend an existing feature or put genuinely shared code in its shared owner. Create only the folders the feature needs. Name files and folders in kebab-case. Do not create a feature `index.ts` barrel; import source files directly.

In this tree, `team-members` has a page, endpoints and private components, so it is a feature. The invite preview has one user, so it stays beside its form. Billing and members reuse the shared person summary; they do not rebuild it from low-level parts. The tree places existing responsibilities; it does not prescribe speculative folders.

```text
src/
├── app/                    # router.tsx composes feature files directly; providers.tsx
├── assets/                 # static assets
├── components/
│   └── person-summary.tsx  # shared avatar-and-name markup, props only
├── config/                 # global configuration
├── features/
│   ├── team-members/
│   │   ├── api/get-members.ts      # schema/decoder, fetcher and endpoint hook
│   │   ├── components/members-page.tsx
│   │   ├── components/invite-form/ # invite-form.tsx, invite-preview.tsx, invite-form.module.css
│   │   ├── hooks/  stores/  types/  utils/can-invite.ts
│   └── billing/
│       ├── api/get-seat-usage.ts
│       └── components/seat-holders.tsx
├── hooks/  stores/  testing/  types/  utils/
└── lib/api-client.ts       # one Fetch wrapper, no feature imports
```

## Keep imports one-way

Imports point downward: `app → features → shared`.

- A feature imports its own files and shared code. It never imports another feature or `app/`.
- Shared code imports neither features nor `app/`.
- An app-level page may compose two features. A feature must not reach into its neighbour, also not through a barrel.
- Do not disable an existing boundary lint rule to let an import through.

Keep endpoint code in the feature that owns the endpoint. Moving a presentational component to shared code does not move its fetcher. Each consuming feature supplies the data from its own response, or through a feature-local wrapper that calls its own hook. If that cannot express the journey, let the app compose the features. This rule is about shared presentation. The parts of a stateful compound widget may read their own root's context, as [composition.md](composition.md) describes.

```tsx
// example: structure-shared-data
// src/components/person-summary.tsx: fetches nothing
export function PersonSummary({ person }: { person: Person }) {
  return <figure><img src={person.avatarUrl} alt="" /><figcaption>{person.name}</figcaption></figure>;
}

// src/features/billing/components/seat-holders.tsx: maps its own response to the shared props
export function SeatHolders({ usage }: { usage: SeatUsage }) {
  return (
    <section aria-label="Seat holders">
      {usage.holders.map((holder) => (
        <PersonSummary key={holder.userId} person={{ id: holder.userId, name: holder.displayName, avatarUrl: holder.avatar }} />
      ))}
    </section>
  );
}

// src/app/team-overview.tsx: the app composes features, not the reverse.
export function TeamOverview({ member, usage }: { member: Person; usage: SeatUsage }) {
  return <main><MemberSummary member={member} /><SeatHolders usage={usage} /></main>;
}
```

Use the existing `@/` alias for source imports, not long relative paths. Configure TypeScript's `@/*` path (`"paths": { "@/*": ["./src/*"] }`) and keep the equivalent bundler alias: TypeScript paths alone do not configure Vite. Keep aliased imports pointed at a file. For example, import `PersonSummary` from `@/components/person-summary`, and import `SeatHolders` from `@/features/billing/components/seat-holders`, never from `@/features/billing`.

In an existing Vite project with Vite and Node types installed, merge the alias into the existing config and keep its plugins and settings:

```ts
// example: structure-vite-alias
resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
```

Where ESLint and `eslint-plugin-import` are already installed, enforce one restricted-path zone for each feature, plus app and shared zones. Extend the existing lint mechanism. Do not add tools or silence it. If another installed tool enforces the same architecture, keep that tool. Append these entries to the existing TypeScript-capable flat config and keep its parser, resolver and other rules:

```javascript
// example: structure-boundary-config
"import/no-restricted-paths": ["error", {
  zones: [
    ...features.map((feature) => ({ target: `./src/features/${feature}`, from: "./src/features", except: [`./${feature}`] })),
    { target: "./src/features", from: "./src/app" },
    { target: shared, from: ["./src/features", "./src/app"] }, // shared = components, hooks, lib, stores, utils, types, config
  ],
}],
```

## Keep an endpoint's three pieces together

For each endpoint, colocate:

1. its response schema or hand-written decoder, and its domain type;
2. its Fetch fetcher;
3. its endpoint-specific hook.

The fetcher returns parsed domain data, not an untyped JSON object and not a cast. Decode an unknown role or permission to a value that grants nothing. Use a schema library for the validator and derived type only if it is already installed. Zod and TanStack Query are conditional choices, not dependencies to add.

The feature folder is the module boundary. Its public surface is what shared code or an app page imports from it. A parsed response whose shape is already the app's own is already a domain type. Map it only when the shapes differ, for example third-party snake_case fields or storage-only data. Do not add a duplicate type or mapping only because data moves between files in one feature.

Use one thin Fetch wrapper for common status and error behaviour, not axios or interceptors. Fetch resolves on HTTP errors, so check `response.ok` before you treat the body as success. Let the endpoint decode the successful `unknown` body. Keep transport errors, invalid JSON and invalid response shapes on a real failure path.

Use the project's installed data library for server data; [performance.md](performance.md) owns cache and request-deduplication details. With no data library and XState installed, the endpoint hook uses an invoked actor, not loading and error `useState` flags. The frozen-dependency fallback for when neither is installed is in [state-effects.md](state-effects.md). Do not put remote data in a new global UI store.

## Repair the complete permission action

A permission change includes opening and repairing the role fetcher and the HTTP wrapper that the action uses. Do not leave a cast or a 403 sign-out on that path and only mention it in the reply. Do not extend the repair to unrelated endpoints.

Put permission decisions in plain functions and test them without rendering React. A typed role-to-permission map handles role-based gates. When access depends on a specific resource, include its ownership in a plain predicate. A UI gate only decides what to show or enable; it does not stop a crafted request. State in the reply that the server must authenticate the actor, authorise each mutation for that actor and resource, and return 403 before it changes data when it refuses access. The client predicate mirrors that rule; it is not its authority.

Keep framework-independent domain and API declarations free of React and actor-framework types: `canInvite` accepts domain values, and fetchers return domain data. Inside UI integration, `ReactNode` slots, ref props and typed actor refs are legitimate contracts between components. Do not hide them behind invented neutral wrappers. For example, a panel may pass a typed invite actor ref to its form, but neither the permission predicate nor the fetcher accepts that ref.

Show a per-action 403 beside the action that failed. Do not show a global toast, clear the session, sign out or redirect the app. Keep the separate 401 sign-out behaviour. Only a failed route-level access check during navigation justifies an access redirect. Do not turn a failed action into navigation. Propagate cancellation unchanged and do not report it as an error. Identify Fetch cancellation by `name === "AbortError"`, not by its JavaScript class. Other failures keep their error path and the project's existing global reporting.

Prerequisites for the example: React 19, XState 5 and `@xstate/react` 6 installed. No Zod, query library or axios is needed. `ApiEffects` are real application ports: supply the existing sign-out and notification functions to `createApiClient`.

```tsx
// example: structure-permission-action
// src/lib/api-client.ts
export interface ApiEffects { signOut(): void; reportError(message: string): void }

export class HttpError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "HttpError";
  }
}

export function isAbortError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "name" in error && error.name === "AbortError";
}

export function createApiClient(effects: ApiEffects) {
  return async (path: string, init: RequestInit): Promise<Response> => {
    try {
      const response = await fetch(path, init);
      if (!response.ok) {
        const body: unknown = await response.json().catch((error: unknown) => {
          if (isAbortError(error)) throw error;
          return null;
        });
        throw new HttpError(response.status, errorMessage(body, response.status));
      }
      return response;
    } catch (error: unknown) {
      if (isAbortError(error)) throw error;
      if (error instanceof HttpError && error.status === 403) throw error; // the action shows it
      if (error instanceof HttpError && error.status === 401) effects.signOut();
      effects.reportError(messageOf(error));
      throw error;
    }
  };
}

export type Role = "admin" | "member" | "unknown";
export type CurrentUser = Readonly<{ id: string; teamId: string; role: Role }>;
export type Permission = "invite" | "read";
const permissions: Readonly<Record<Role, ReadonlyArray<Permission>>> = {
  admin: ["read", "invite"], member: ["read"], unknown: [],
};

export function canInvite(user: CurrentUser, teamId: string): boolean {
  return user.teamId === teamId && permissions[user.role].includes("invite");
}

// src/features/team-members/api/get-current-user.ts
export function parseCurrentUser(value: unknown): CurrentUser {
  if (typeof value !== "object" || value === null ||
      !("id" in value) || typeof value.id !== "string" ||
      !("teamId" in value) || typeof value.teamId !== "string" ||
      !("role" in value)) {
    throw new Error("Invalid current-user response");
  }
  const role: Role = value.role === "admin" || value.role === "member" ? value.role : "unknown";
  return { id: value.id, teamId: value.teamId, role };
}
```

The rest of the example keeps these facts:

- Module-scope machines declare typed actor ports. `.provide()` binds the real fetchers before either hook can start an actor. Call `bindEndpointMachines(client)` once, outside render, at the app boundary.
- Keep the client, its application ports and the returned endpoint logic stable while the boundary is mounted.
- Each endpoint hook is `useActorRef(machine, { input: { teamId } })`. Each actor receives its team through creation-time `input`, not through a closure or a second state owner. The only mutable React input is the synchronous email draft.
- The invite actor ignores a second `SEND` while it is sending. A 403 reaches the invite actor's `failed` state and renders in a `role="alert"` beside the form. The wrapper calls neither application port for it. A 401 calls sign-out and stays a rejection.
- Stopping an invoked promise aborts its Fetch signal and discards its late settlement. Unmount stops the actor. No cancellation becomes a visible failure after unmount.
- `InvitePanel` keys its inner journey by `teamId`. A team change stops both old actors, cancels their requests, clears the draft and receipt, and loads the new team's permissions before it shows the form. Changing hook arguments alone does not update a running actor's input.
- The app must also key or unmount the containing boundary when the signed-in identity or the API port contract changes. Replacing the client or endpoint logic during the same journey is not a supported way to update the actor's dependencies.
- An invalid successful response fails in the fetcher. It does not become a granted permission or a claimed successful invite.

With React Router 7 installed, a navigation loader may redirect after a failed route-level access check. Do not use it for action submissions. Its injected reader is the application's existing route-access check: it returns a validated decision or rejects when the request fails. Do not convert each thrown HTTP error into a route refusal.

```ts
// example: structure-route-access-redirect
loader: async ({ request }: LoaderFunctionArgs): Promise<RouteAccess> => {
  const access = await readAccess(request);
  if (!access.allowed) throw redirect("/access-denied");
  return access;
},
```

Test permission predicates with Vitest (when installed) and no React renderer. Keep resource ownership separate from role-only gating. Both are subordinate to server authorisation.

```ts
// example: structure-pure-permission-tests
export function parsePermission(value: unknown): Permission | null {
  return value === "read" || value === "write" || value === "delete" ? value : null;
}
export function hasPermission(role: Role, permission: Permission | null): boolean {
  return permission !== null && permissions[role].includes(permission);
}
export function canDeleteComment(user: User, comment: Comment): boolean {
  return user.role !== "unknown" && (user.id === comment.authorId || hasPermission(user.role, "delete"));
}

test("comment deletion checks the specific owner or an admin", () => {
  const comment = { authorId: "author-1" };
  expect(canDeleteComment({ id: "author-1", role: "editor" }, comment)).toBe(true);
  expect(canDeleteComment({ id: "other", role: "admin" }, comment)).toBe(true);
  expect(canDeleteComment({ id: "other", role: "editor" }, comment)).toBe(false);
  expect(canDeleteComment({ id: "author-1", role: "unknown" }, comment)).toBe(false);
  expect(hasPermission("admin", parsePermission("publish"))).toBe(false);
});
```

## Contain rendering failures

Put local error boundaries around independently useful UI regions, in addition to a root boundary. A boundary catches render and lifecycle failures below it. It does not replace handling a rejected request in the action actor. A failed dashboard must not remove the working sidebar. React alone supplies the boundary. Inject the existing error reporter; do not add a tracking package.

```tsx
// example: structure-local-error-boundaries
export class RegionBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo): void { this.props.report(error, info); }
  render(): ReactNode { return this.state.failed ? this.props.fallback : this.props.children; }
}
// <RegionBoundary fallback={<p role="alert">The app could not render.</p>}> wraps <Sidebar /> and <main>,
// and a second RegionBoundary inside <main> wraps only <Dashboard />.
```

## Respect installed tooling

Keep the project's existing type checks, formatting, linting and hooks. Do not require or add ESLint, Prettier, Husky or lint-staged. Use the project's declared scripts. Do not invent a second toolchain. A tool that is not installed is a prerequisite gap: it does not permit you to add the tool or to report its check as passed.

For example, in a project with TypeScript 6 (shipped as `tsc6`), Vitest and Vite, and with no ESLint, Prettier, Husky or lint-staged, run the declared checks with the installed binaries:

```sh
./node_modules/.bin/tsc6 --noEmit
./node_modules/.bin/vitest run
./node_modules/.bin/vite build
```

These commands are for the agent that integrates the change. They are not claimed results. Token-storage recommendations, input-sanitising policy and mandatory pre-commit tooling are outside this skill's scope.
