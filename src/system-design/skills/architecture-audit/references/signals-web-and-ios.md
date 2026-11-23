# Stack-Specific Read-Only Audit Signals (Web and iOS)

Use this reference during Steps 1–4 of `architecture-audit` when inspecting a web or iOS repository. Keep all inspection strictly read-only.

## Web (TypeScript, React, Node.js, Monorepos)

### High-signal hotspot indicators

- **Churn and co-change (excluding noise):** Inspect git history excluding lockfiles (`pnpm-lock.yaml`, `package-lock.json`), build outputs and generated API clients. Flag clusters where route handlers, validation schemas, services and tests change together across unrelated folders for one product rule.
- **Circular imports and barrel tangles:** Inspect `package.json` workspace graphs, `tsconfig.json` project references and `index.ts` barrel re-exports. Barrel files that re-export internal modules across domains often create hidden import cycles, break tree-shaking and pull server or UI code into shared packages.
- **Framework and provider leakage into domain logic:** Look for core business modules importing HTTP request/response types, ORM entities, third-party payment/auth/email SDK error classes, or React hooks.
- **State-owner sprawl:** In frontend applications, look for the same workflow state duplicated across local `useState`, global stores, URL parameters and server-cache layers, or asynchronous submit/retry/cancellation lifecycles encoded as tangled boolean flags (`isLoading`, `isRetrying`, `hasError`) instead of one explicit state owner.
- **Pass-through service chains:** Look for `Controller -> Coordinator -> Facade -> Service -> Helper` chains where intermediate files forward parameters unchanged and still force callers to know raw database or transport shapes.
- **Test friction:** Look for suites dominated by `vi.mock()` / module-import patching, giant fixture builders or tests that fail whenever internal helper signatures move while user behaviour stays unchanged.

### Intentionally thin edges to protect (Web)

Do **not** flag these as shallow-module defects when they stay thin:

- **HTTP route handlers and API controllers** that parse/validate transport input, invoke one domain/application service and map the outcome to HTTP status codes.
- **CLI command wrappers** that parse flags, invoke one service and set exit codes.
- **Declarative presentational React components** that render props and forward user events without embedding business rules.
- **Composition roots** (`server.ts`, `app.tsx`, dependency-wiring modules) that instantiate real adapters and pass them inward.

### Web handover triggers

- Logical contract or deep-module redesign for one chosen module -> `architect`
- Workspace/package boundaries, directory layout, barrel cleanup or ESLint/import enforcement -> `codebase-layout`
- Breaking global singletons, `Date.now()` or direct SDK calls before writing characterisation tests -> `test-seams`
- Flattening an already-selected pass-through chain -> `reducer`
- Behaviour-preserving cleanup once tests are trustworthy -> `refactoring`
- Explicit ports-and-adapters isolation (only when opted in) -> `hexagonal-architecture`
- Async UI lifecycle sprawl (in-flight, retry, cancellation) -> `xstate`

---

## iOS (Swift 6, SwiftUI, Swift Package Manager)

### High-signal hotspot indicators

- **SPM target graph and false folder boundaries:** Inspect `<App>Kit/Package.swift` target dependencies and access modifiers (`public`, `package`, `internal`). Folders or Xcode groups inside one target share one `internal` namespace and enforce **zero** import rules; real mechanical boundaries require separate Swift Package Manager (SPM) targets. Flag circular target pressure, catch-all shared targets that pull everything in, or feature targets importing platform adapter targets directly.
- **UI or hardware frameworks leaking into core:** Inspect `import` statements inside pure engine or core targets. Flag `SwiftUI`, `UIKit`, `AVFAudio`, `CoreLocation`, `WatchConnectivity`, `ActivityKit`, raw `URLResponse` or vendor SDK types appearing in core domain logic or crossing boundaries instead of plain `Sendable` domain values.
- **SwiftUI views owning persistence writes or business rules:** Flag views that mutate SwiftData `ModelContext` directly with inline validation or workflow logic. Note the ratified pragmatism: SwiftUI screens reading with `@Query` are acceptable when writes go through a single `@ModelActor` store owner and `Sendable` IDs or values cross actor boundaries—do not demand parallel DTO hierarchies dogmatically when one `@ModelActor` store keeps writes clean.
- **ViewModel sprawl and nested `@Observable` services (`swiftui-architecture`):** Flag redundant `ScreenViewModel` layers created out of habit, or one `@Observable` service nested inside another `@Observable` object. Under `swiftui-architecture`, SwiftUI views hold view-local `@State` (sheets, drafts, in-flight `Task`s) and call injected `@Observable` domain services (retained once at the composition root via `.environment(...)`) or `AppIntent`s.
- **Extension targets opening the app database directly:** Flag Widget or Live Activity extensions that open and mutate the app's persistence store directly instead of rendering views with `Button(intent:)` routed through shared `AppIntent`s.
- **Untestable static singletons and uninjectable dependencies:** Swift is statically compiled—there is no runtime module-import mock hook, and `struct`, `enum`, `actor` and `final class` cannot be subclassed. Flag core logic reading `Date.now`, `UserDefaults.standard`, `URLSession.shared` or mutable `.shared` singletons directly with no closure parameter, narrow `Sendable` protocol/witness struct, `URLProtocol`, `@Environment` or `@AppDependency` seam.
- **Unnecessary protocol ceremony:** Do **not** flag a concrete Swift type for lacking a protocol unless two real implementations exist or tests cannot run the real hardware, network or SDK dependency.

### Intentionally thin edges to protect (iOS)

Do **not** flag these as shallow-module defects when they stay thin:

- **Declarative SwiftUI views** holding view-local `@State` and delegating actions to injected `@Observable` services or `Button(intent:)` / `callAsFunction(donate:)`.
- **`AppIntent` driving adapters** that resolve `AppEntity` parameters, call one `@AppDependency` application service and format dialog or result values without holding business rules.
- **Thin executable app and extension targets** (iPhone app, Watch app, Widget extension) acting as composition roots (`AppGraph.live()` vs `AppGraph.scripted()`) that register dependencies via `AppDependencyManager.shared.add(dependency:)` and link only the adapters their platform supports.

### iOS handover triggers

- Logical contract or `Sendable` boundary design for one chosen module -> `architect`
- Local Swift Package target split, access control (`public`/`package`/`internal`) and dependency-direction enforcement -> `codebase-layout`
- Breaking hidden singletons, clocks or SDK calls with Swift-safe seams (closures with defaults, narrow `Sendable` protocols, `URLProtocol`) -> `test-seams`
- Removing ViewModel sprawl or fixing SwiftUI state ownership -> `swiftui-architecture`
- Moving Widget/Siri/Shortcut actions behind clean intents and `@AppDependency` -> `app-intent-driven-development`
- Explicit ports-and-adapters isolation for hardware/network SDKs (only when opted in) -> `hexagonal-architecture`
- Writing parallel-safe Swift Testing suites (`@Test`, `#expect`, `#require`) -> `swift-testing`
