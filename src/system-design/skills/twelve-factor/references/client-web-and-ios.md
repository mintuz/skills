# Client Web (SPA) and Swift 6 / iOS Twelve-Factor Adaptations

Use this reference when applying or auditing `../SKILL.md` on static web frontends / SPAs or client-side Swift 6 / iOS apps. Client apps are stateful and run on user-controlled devices; never apply server-only dogma blindly.

---

## Part A: Static Web Frontends and SPAs

### Config and Build/Release/Run (Factors III & V)
- **Public config only:** Any value injected into a static web bundle (for example via `VITE_*` or `NEXT_PUBLIC_*`) is readable by every user in browser DevTools. Never place third-party API secrets, private keys, or admin credentials in frontend config or `.env` files shipped to the bundler.
- **Validate at startup and ship `.env.example`:** Parse public client config (API base URLs, public telemetry endpoints, feature flags) through a schema at app boot, and update `.env.example` with placeholders in the same change.
- **No environment-name branches:** Pass explicit public URLs and boolean capability flags rather than branching UI behaviour on `NODE_ENV` or hostname guesses.

### Client State, Lifecycle, and Logs (Factors VI, VII, VIII, IX, XI, XII)
- **Stateless Processes (VI), Port Binding (VII), Concurrency (VIII), Admin Processes (XII) — N/A in server form:** Browsers hold local UI state, URL state, and offline caches (`IndexedDB`, Cache Storage). Keep local persistence explicit and never trust client storage as the security or billing authority.
- **Disposability (IX adapted):** Abort in-flight `fetch` requests with `AbortController` on navigation or unmount, and handle offline transitions and tab closure without corrupting local state.
- **Logs (XI adapted):** Do not stream noisy raw console strings or leak tokens/PII. Route client error telemetry through an approved, redacted collector.

---

## Part B: Client-Side Swift 6 / iOS Apps

An iOS app is a single-user, stateful client distributed as a signed `.ipa` bundle. In every iOS audit or plan, **explicitly refuse** server-only dogma and state each concrete iOS boundary:

- **N/A server factors:** state explicitly that server-form **Stateless Processes (VI)**, **Port Binding (VII)**, **Horizontal Process Concurrency (VIII)**, and **Server Admin Shell (XII)** do not apply — never remove SwiftData, local container files, or Keychain storage, never bind an HTTP health port or `SIGTERM`/`SIGINT` handlers, and never emit `stdout` JSON or ad-hoc log files.
- **Config & Secrets (III, V):** exclude secrets from `.xcconfig`, `Info.plist`, source code, and `.ipa` bundles; keep user secrets in **Keychain** and third-party API secrets on a backend; restrict **`#if DEBUG` strictly to the composition root** (both scripted graph selection and diagnostic logging — never branch business logic or leak `#if DEBUG` diagnostics across feature code).
- **Local persistence & migrations (IV, VI, XII):** set explicit `URLFileProtection` and `isExcludedFromBackup`, and run in-app schema upgrades via `VersionedSchema` and `SchemaMigrationPlan`.
- **Disposability (IX):** enforce fast launch, a crash-safe write-ahead/recovery journal marking prior-process runs `interrupted`, `UIApplication.beginBackgroundTask` for brief foreground-to-background flushes, `BGTaskScheduler` expiration handlers cancelling active work, and SwiftUI `.task` cancellation.
- **Logs (XI):** use Apple unified `OSLog` `Logger(subsystem:category:)` with explicit `privacy: .private(mask: .hash)` for IDs/PII and `privacy: .public` for safe counts/enums.
- **Parity (X):** require physical-device Release verification because simulators diverge on Keychain, background tasks, hardware, and Release optimisations.

### Config and Secrets (Factors III & V)

Keep strict separation between public build configuration, user secrets, and third-party API secrets:

| Secret or Setting | Where It Lives | Rule |
| --- | --- | --- |
| Non-secret build config (API base URL, App Group ID, bundle flags) | `.xcconfig` → `Info.plist` → parsed once into a `Sendable` `AppConfig` at launch | Fail fast on missing/malformed entries; never read `Bundle.main.infoDictionary` deep in feature code. |
| User credentials and session tokens | iOS **Keychain** (appropriate `kSecAttrAccessible` class) | Never write to `UserDefaults`, `.xcconfig`, `Info.plist`, SwiftData, or logs. |
| Third-party API keys and server secrets | Backend service / BFF | **Never embed API secrets in `.xcconfig`, `Info.plist`, source code, or the `.ipa` bundle.** Anyone can extract an `.ipa`. |

**`#if DEBUG` boundary:** Restrict `#if DEBUG` strictly to the **composition root** (selecting `AppGraph.live()` vs `AppGraph.scripted()` or wiring debug diagnostic logging at the root only). Never place `#if DEBUG` switches inside domain or feature code to branch business logic, pricing, sync rules, or security checks.

```swift
public struct AppConfig: Sendable {
    public let apiBaseURL: URL
    public let appGroupID: String

    public static func load(from bundle: Bundle = .main) throws -> AppConfig {
        guard
            let rawURL = bundle.object(forInfoDictionaryKey: "API_BASE_URL") as? String,
            let apiBaseURL = URL(string: rawURL),
            let appGroupID = bundle.object(forInfoDictionaryKey: "APP_GROUP_ID") as? String,
            !appGroupID.isEmpty
        else {
            throw AppConfigError.invalidConfiguration
        }
        return AppConfig(apiBaseURL: apiBaseURL, appGroupID: appGroupID)
    }
}

enum AppGraph {
    static func selected(config: AppConfig) -> AppDependencies {
        #if DEBUG
        if ProcessInfo.processInfo.arguments.contains("-use-scripted-graph") {
            return .scripted()
        }
        #endif
        return .live(config: config)
    }
}
```

### Local Persistence, File Protection, and In-App Migrations (Factors IV, VI, XII)

- **Stateless Processes (VI) — N/A in server form:** Durable local persistence (SwiftData via a `@ModelActor` store, App Group container files, Keychain) is core iOS architecture. Keep backing services (API clients, Keychain, storage) wired once at the composition root and injected via SwiftUI `.environment(...)` and App Intents `@AppDependency` (`AppDependencyManager.shared.add(dependency:)`).
- **Explicit file protection and backup hygiene:** Set `URLFileProtection` (`.completeUntilFirstUserAuthentication` when background extensions or tasks read the file; `.complete` for foreground-only sensitive data) and set `isExcludedFromBackup = true` on caches, derived media, or regenerable files.

```swift
func configureProtectedDirectory(at url: URL) throws {
    try FileManager.default.createDirectory(
        at: url,
        withIntermediateDirectories: true,
        attributes: [.protectionKey: FileProtectionType.completeUntilFirstUserAuthentication]
    )
    var resourceValues = URLResourceValues()
    resourceValues.isExcludedFromBackup = true
    var mutableURL = url
    try mutableURL.setResourceValues(resourceValues)
}
```

- **Admin Processes (XII) — Versioned in-app migrations:** iOS has no server shell for running one-off admin scripts. Evolve local SwiftData schemas with `VersionedSchema` and `SchemaMigrationPlan`, and test migrations against saved fixtures from earlier schema versions before release.

### Disposability: Crash-Safe Recovery and OS Lifecycle (Factor IX)

iOS suspends or terminates apps abruptly (jetsam, memory pressure, user swipe-kill) without `SIGTERM` or `/health` probes. Design for abrupt termination:

1. **Fast launch:** Keep app startup lean; defer non-critical indexing or sync until after first render without masking invalid configuration.
2. **Crash-safe write-ahead / recovery journal:** Record active multi-step operations (such as uploads, audio captures, or sync batches) durably before starting. On relaunch, treat any unfinished journal entry from a prior process as **`interrupted`**—never as cleanly completed—and reconcile or offer safe resumption (hand over to `principle-make-operations-idempotent`).
3. **Foreground-to-background flush:** Wrap brief critical flushes with `UIApplication.shared.beginBackgroundTask(withName:expirationHandler:)` and always call `endBackgroundTask` on both normal completion and expiration.
4. **Deferred background work:** Register `BGTaskScheduler` tasks, cancel active Swift `Task`s inside `bgTask.expirationHandler`, and call `bgTask.setTaskCompleted(success:)` on every exit path.
5. **View-scoped cancellation:** Run screen-owned async work in SwiftUI `.task` (or cancel stored `@State` `Task`s on disappear) so abandoned views do not leak network or storage work.

```swift
func handleSyncTask(_ bgTask: BGProcessingTask, coordinator: SyncCoordinator) {
    let work = Task {
        do {
            try await coordinator.syncPendingItems()
            bgTask.setTaskCompleted(success: !Task.isCancelled)
        } catch {
            bgTask.setTaskCompleted(success: false)
        }
    }

    bgTask.expirationHandler = {
        work.cancel()
    }
}
```

### Logs: Apple Unified Logging with Privacy Annotations (Factor XI)

Never print structured JSON to `stdout` or manage custom rotating log files inside the app container. Use Apple's unified `OSLog` `Logger(subsystem:category:)` with explicit privacy annotations:

- Mark record IDs, account identifiers, and user-identifying values with `privacy: .private(mask: .hash)` so related events stay correlatable without exposing raw PII.
- Mark safe numeric counts, durations, and non-sensitive enum cases with `privacy: .public`.
- Never log secrets, auth tokens, Keychain values, or raw request headers.

```swift
import OSLog

private let syncLogger = Logger(subsystem: "com.example.tasks", category: "sync")

func recordSyncOutcome(batchID: String, itemCount: Int, outcome: String) {
    syncLogger.info(
        "Sync finished batch=\(batchID, privacy: .private(mask: .hash)) count=\(itemCount, privacy: .public) outcome=\(outcome, privacy: .public)"
    )
}
```

### Dev/Prod Parity: Physical-Device Release Verification (Factor X)

Simulator Debug builds do not prove production iOS behaviour. Verify Release builds on physical hardware for anything touching Keychain access groups, App Groups, `BGTaskScheduler`, push notifications, microphone/camera/audio sessions, on-device models, memory jetsam limits, and Swift compiler Release optimisations.
