# Web Layouts

Read this reference when structuring or auditing web backends, BFFs (backend-for-frontend hosts), frontends, full-stack meta-frameworks, design systems, or JavaScript/TypeScript workspaces. Apply these patterns only where repository evidence earns them; never create empty directories to mirror an example.

## Contents

1. Web backend and BFF shapes
2. Visible hexagonal tree grammar (web)
3. Web frontend axes and shapes
4. State, XState, data, UI, and runtime ownership
5. Package exports, ESLint boundaries, and barrel hazards

## 1. Web Backend and BFF Shapes

When a service exposes a structured public interface such as an HTTP URL tree or a CLI command tree, make that public shape the primary entry-point navigation axis (`endpoints/` or `commands/`).

### Feature-First Service (Default Non-Hexagonal Backend)

Use feature-first layout when the service has not opted into ports and adapters:

```text
src/
├── employees/
│   ├── create-employee/
│   │   ├── create-employee.ts
│   │   ├── create-employee.schema.ts
│   │   └── create-employee.test.ts
│   ├── update-employee/
│   ├── employee-routes.ts
│   └── public.ts
├── office-locations/
│   └── ...
├── config/
├── router.ts
└── main.ts
```

Colocate route handling, validation, persistence, and tests inside the owning feature. Do not split a small feature-first service into root `controllers/`, `services/`, `models/`, and `repositories/` folders.

### Endpoint-First BFF

Mirror the HTTP URL and method tree so engineers can jump straight from a request path to its entry leaf:

```text
src/
├── endpoints/
│   ├── router.ts                       # explicit route catalogue delegating branches
│   ├── health/
│   │   └── get.ts
│   └── api/
│       └── orders/
│           ├── post.ts
│           └── by-order-id/
│               ├── get.ts
│               └── cancel/
│                   └── post.ts
├── workflows/
│   └── order-summary/
│       ├── load-order.ts
│       └── load-delivery-estimate.ts
├── composition/
│   ├── routes.ts
│   ├── database.ts
│   ├── upstream-clients.ts
│   └── config.ts
├── openapi/
└── main.ts
```

Apply these BFF rules:

- Keep each endpoint leaf readable as parse → translate → invoke operation → respond.
- Classify endpoint access explicitly and install shared session, CSRF, and origin policy centrally at the route registrar rather than ad hoc per leaf.
- Place real cross-collaborator sequencing in a purpose-named workflow under `workflows/`. Do not create a wrapper file that merely forwards one call.
- Keep concrete stores, upstream HTTP clients, configuration, and shutdown ownership in `composition/`.
- When proposing a BFF host layout, always include its three sibling roles—`endpoints/`, `workflows/`, and `composition/` (each annotated with its concrete responsibility or files)—rather than deferring `workflows/` or `composition/` out of the BFF tree.
- Keep HTTP leaves under `endpoints/<path>/<method>.ts` even when the BFF invokes an internal capability hexagon; never hide HTTP route leaves inside an internal capability folder.

### Framework-Constrained Backend, Contexts, CLI, and Small Packages

- **Framework-constrained backend:** Keep framework-required entry files (`src/app/api/<resource>/route.ts`) where the framework discovers them, keep them thin, and delegate substantive logic to `src/server/<feature>/`. Use `startup.ts` inline until wiring genuinely earns `composition/`.
- **Bounded contexts without hexagonal architecture:** Group by `src/contexts/<context>/` with explicit `public.ts` contracts and local glossaries. Do not invent ceremonial `ports/` and `adapters/` folders.
- **CLI and operational tools:** Organise by command (`src/commands/<command-name>/`) or operational workflow (`src/credential-rotation/`, `src/restore-verification/`).
- **Small cohesive library:** Keep files flat under `src/` beside their focused tests and a single `index.ts` entry point. Add subfolders only when a cluster grows large enough to hurt navigation.
- **Monorepo grouping:** Group by executable host and product capability (`apps/<app>/`, `packages/<capability>/`, `packages/platform/<named-capability>/`), never by global technical layer (`packages/domain/`, `packages/adapters/`).

## 2. Visible Hexagonal Tree Grammar (Web)

Use this physical grammar only when the service meets all five earning gates in `SKILL.md`. This section owns physical directories and package boundaries only; hand semantic port design, Domain Probes, CQRS-lite, and fake swappability rules to `hexagonal-architecture`.

### Monorepo Capability Hexagon

Use grouping directories for readability and leaf workspace packages (each with its own `package.json`) for mechanical enforcement:

```text
packages/
└── ordering/                           # grouping directory, not a package
    ├── hexagon/                        # INSIDE grouping directory
    │   ├── domain/                     # workspace package (pure rules)
    │   │   ├── package.json
    │   │   └── src/
    │   │       ├── orders/
    │   │       └── allocation/
    │   └── application/                # workspace package (use cases + ports)
    │       ├── package.json
    │       └── src/
    │           ├── approve-order/
    │           └── ports/
    │               ├── driving/
    │               └── driven/
    ├── adapters/                       # OUTSIDE grouping directory
    │   ├── driving/
    │   │   ├── http/                   # workspace package
    │   │   └── queue-consumer/         # workspace package
    │   └── driven/
    │       ├── postgres-store/         # workspace package
    │       └── payment-gateway/        # workspace package
    └── testing/                        # OUTSIDE test interactors
        ├── test-fakes/                 # workspace package (devDependency only)
        └── store-contract/             # workspace package (devDependency only)
```

- Merge `domain/` and `application/` into one cohesive inside workspace package (for example `ordering/hexagon/order-management/`) unless separate dependency rules between pure domain and application orchestration earn the extra package.
- Organise every inside package by domain concept (nouns) or use case (verbs), never as a flat `commands.ts` / `services.ts` / `types.ts` / `ports.ts` dump.
- Keep `testing/` packages out of production `dependencies`; colocated tests may import them via `devDependencies`.

### Single-Package Hexagonal Service

When a service deliberately stays one package, put capability first (`src/<capability>/hexagon/`, `src/<capability>/adapters/`, `src/<capability>/testing/`, `src/<capability>/composition/`). Because the single `package.json` holds provider SDKs, the boundary is honest only when ESLint or architecture tests block `hexagon/` from importing outward paths and provider SDKs.

## 3. Web Frontend Axes and Shapes

Inspect these seven axes before naming frontend folders:

| Axis | Question |
| --- | --- |
| Route or screen | Where does the user navigate and enter? |
| Product feature or flow | Which interaction and business rules change together? |
| UI reuse level | Route-only UI, product-feature UI, or feature-agnostic design-system primitive? |
| State ownership | Component-local, URL/router, server-cache, feature-scoped, or truly app-wide? |
| Data boundary | Who owns requests, validation schemas, mappers, cache keys, and mutations? |
| Runtime | Browser client, server-only, worker, or runtime-safe shared code? |
| Package owner | Does this boundary have multiple consumers or need mechanical isolation? |

Do not project backend `hexagon/`, ports, or DDD entity folders onto ordinary UI code unless the frontend itself explicitly opts into ports and adapters for durable provider-free policy.

### Route-Colocated Target (Small or Route-Owned Frontend)

Use when most UI and data belong to one route:

```text
src/
├── app/ (or routes/)                   # framework-required route catalogue
│   ├── checkout/
│   │   ├── page.tsx
│   │   ├── checkout-form.tsx
│   │   ├── checkout-data.ts
│   │   └── checkout.test.tsx
│   └── account/
│       └── page.tsx
├── design-system/                      # product-feature-agnostic primitives + tokens
│   ├── tokens.ts
│   ├── button.tsx
│   └── dialog.tsx
├── platform/                           # named runtime capabilities
│   ├── api-client.ts
│   └── analytics.ts
└── generated/                          # generator output; never hand-edited
    └── api-client.ts
```

### Feature-First Target (Reused Interactions Across Routes)

Promote an interaction out of a route folder into `features/` only when multiple routes use it, the route becomes hard to navigate, or it needs an enforceable owner independent of the URL:

```text
src/
├── app/                                # bootstrap, router, providers, global styles
├── routes/                             # URL/screen composition, loading and error states
│   ├── checkout/
│   │   └── route.tsx
│   └── order-history/
│       └── route.tsx
├── features/
│   ├── apply-discount/
│   │   ├── apply-discount-form.tsx
│   │   ├── apply-discount.ts
│   │   ├── discount-api.ts
│   │   ├── apply-discount.test.tsx
│   │   └── public.ts
│   └── reorder-purchase/
│       ├── reorder-purchase.ts
│       └── public.ts
├── design-system/
│   └── button.tsx
├── platform/
│   └── api-client.ts
└── generated/
    └── api-client.ts
```

- Adopt Feature-Sliced Design only when the team commits to its complete layer hierarchy, slice public APIs, and downward import rules; never borrow only its folder names.
- Extract a design system into a workspace package (for example `packages/design-system/`) when multiple apps share its stable visual contract.
- Use microfrontends only for earned independent deployment or team-autonomy boundaries, never to hide a cluttered `components/` folder.

## 4. State, XState, Data, UI, and Runtime Ownership

### Narrowest State Ownership

Place every piece of state at its narrowest real owner:

1. Component interaction state stays inside the component.
2. URL and navigation state stays in the router.
3. Server-fetched cache state stays with the owning route or feature query module.
4. Cross-component interaction state stays inside the owning feature.
5. App-wide stores hold only genuine app-wide coordination (for example active session or theme), never feature state centralised by habit.

### XState Machine and Actor Ownership

When a frontend uses XState statecharts, explicitly declare which layer owns machines and actors (for example route-local lifecycles under `routes/<route>/`, shared interaction lifecycles inside `features/<feature>/`, and zero XState machines inside `design-system/` or pure presentation primitives) and enforce that rule in ESLint/import checks. `xstate` defers to the ownership boundary declared here so agents cannot drop machines into forbidden layers.

### UI, Data, and Runtime Isolation

| Source | May import | Must not import |
| --- | --- | --- |
| App / route composition | Feature public APIs, design system, platform, route-local code | Feature private subpaths; server-only code from client graphs |
| Product feature | Same-feature internals, design system, named platform APIs | Route/app composition; sibling feature private internals |
| Design system | Tokens, primitive utilities, approved base UI libraries | Product features, product data clients, app stores, business statecharts |
| Platform capability | Low-level runtime/SDK libraries and neutral contracts | Product routes and feature policy |
| Generated code | Generator runtime only | Hand-written product modules |

In full-stack meta-frameworks (for example Next.js, Remix, SvelteKit):

- Separate server-only modules (secrets, privileged provider SDKs, database access), client-only modules (browser APIs, interactive handlers), and strictly runtime-safe shared modules.
- Enforce separation with framework guards (`server-only`, `.server` modules), `package.json` `exports` conditions, and build-graph verification. A folder name alone does not stop client bundles from pulling in server code.
- Keep feature-owned wrappers around `generated/` clients so generated wire shapes do not leak across UI components.

## 5. Package Exports, ESLint Boundaries, and Barrel Hazards

Enforce web boundaries on both sides — manifests and source imports. In every web layout proposal, name concrete enforcement mechanisms rather than generic "lint checks": combine `package.json` `exports`, workspace manifest validation, ESLint restricted-import or boundary checks (`no-restricted-imports` / `eslint-plugin-boundaries`), and client/server build-graph guards (`server-only`, `.server` modules, and bundle verification):

1. **`package.json` `exports`:** Declare explicit public entry points (`"."` or named subpaths) on every workspace package so TypeScript and Node reject deep private imports (`@org/pkg/src/internal/...`).
2. **Workspace manifest validation:** Check that every package declares only permitted role dependencies in `package.json` (`dependencies` versus `devDependencies`). A source-only lint rule misses unused or dynamically loaded provider packages in manifests.
3. **ESLint / static import rules:** Use `no-restricted-imports`, `eslint-plugin-boundaries`, or workspace tag rules (for example Nx/Turborepo/dependency-cruiser) to block:
   - Inside modules importing outward adapters, provider SDKs, or frameworks.
   - Sibling features importing each other's internal files instead of explicit public contracts.
   - Design-system modules importing product features, data clients, or stores.
   - Client modules importing server-only modules or secrets.
   - Production source importing `testing/` packages or dev-only routes.
4. **Avoid catch-all barrel (`index.ts`) hazards (name both hazards explicitly when auditing or removing barrels):**
   - Catch-all `index.ts` barrels that re-export both server and client modules allow one client import to pull server-only code into the browser bundle and break builds or leak server logic.
   - Catch-all `index.ts` barrels that re-export route or feature trees defeat bundler tree-shaking and collapse lazy-loaded code-splitting chunks.
   - Prefer explicit public entry files (`public.ts`) or narrow `package.json` subpath exports per consumer surface.
