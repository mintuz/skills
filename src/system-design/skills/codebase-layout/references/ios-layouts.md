# iOS and Swift Layouts

Read this reference when structuring or auditing Swift 6 iOS, watchOS, or extension apps, local Swift Packages (`Package.swift`), Xcode projects, or Apple platform adapters. Keep SwiftUI state and data-flow design in `swiftui-architecture`, App Intents design in `app-intent-driven-development`, and Swift Testing patterns in `swift-testing`.

## Contents

1. Select the smallest honest iOS shape
2. Why SPM targets enforce boundaries (and folders do not)
3. Multi-target local Swift Package layout
4. Xcode synchronized folders versus `.xcodeproj` target membership
5. Isolating Apple platform APIs and SwiftData pragmatism
6. Avoiding ViewModel buckets and thin extension roots
7. Target dependency matrix

## 1. Select the Smallest Honest iOS Shape

| Observed signal | Primary shape |
| --- | --- |
| Small reusable Swift library or pure algorithm engine | Flat Swift Package (`Sources/<Library>/`, `Tests/<Library>Tests/`) |
| Small single-platform iOS app with few screens and no shared extensions | Feature-first app using Xcode synchronized folders inside one target |
| Multi-feature app, hardware/SDK-heavy app, or multi-target app (iPhone + Watch + Widget/Live Activity) | Single local Swift Package (`<App>Kit/Package.swift`) with role-separated SPM targets plus thin executable composition roots |

Do not split a 5-file iOS prototype into six Swift Package targets. Promote to a multi-target local Swift Package as soon as you need mechanical import isolation (for example keeping hardware/UI out of domain rules, or sharing code safely across iPhone, Watch, and Widget targets).

## 2. Why SPM Targets Enforce Boundaries (and Folders Do Not)

Folders and Xcode groups inside one Swift target share a single `internal` namespace. Any file in that target can import `SwiftUI`, `AVFAudio`, or `SwiftData` and call any `internal` symbol in any other folder. Folder names alone make unenforceable claims. When recommending SPM targets over Xcode folders or groups, state explicitly that all files inside one Swift target share a single `internal` namespace so folders enforce zero import isolation.

In Swift, mechanical import-direction enforcement comes from **Swift Package Manager (SPM) targets** paired with **access control**:

- **`internal` (default):** Visible only inside the declaring target. Hide helpers, persistence details, and adapter internals here.
- **`package`:** Visible across targets inside the same local Swift Package (`<App>Kit`), hidden from external consumers. Use `package` for cross-target contracts that only app modules within `<App>Kit` should see.
- **`public`:** Visible to executable app/extension targets linking `<App>Kit` (and external package consumers). Keep the `public` surface small and intentional.

Because SPM checks the target dependency graph at compile time, a target that does not list `<App>Platform` or `SwiftUI` in its dependencies physically cannot import them.

## 3. Multi-Target Local Swift Package Layout

Use one local Swift Package (`<App>Kit/Package.swift`) for all shared library targets and keep executable apps and extensions as thin composition roots:

```text
<AppName>/
├── <AppName>.xcodeproj                  # thin app & extension targets linking <AppName>Kit
├── Apps/
│   ├── iOS/                             # composition root (iPhone/iPad executable)
│   │   ├── AppMain.swift
│   │   ├── AppGraph.swift               # AppGraph.live() vs AppGraph.scripted()
│   │   └── Info.plist
│   ├── Watch/                           # composition root (watchOS executable)
│   │   ├── WatchAppMain.swift
│   │   └── WatchGraph.swift
│   └── Widgets/                         # WidgetKit / Live Activity extension
│       ├── TaskWidgetBundle.swift       # views + Button(intent:) only
│       └── Info.plist
└── Packages/
    └── <AppName>Kit/
        ├── Package.swift                # declares targets & compile-time dependency DAG
        ├── Sources/
        │   ├── <AppName>Domain/         # Foundation-only pure rules & Sendable values
        │   │   └── Scheduling/
        │   ├── <AppName>Core/           # domain services, SwiftData Store, app-owned ports
        │   │   ├── Tasks/
        │   │   ├── Sync/
        │   │   └── Ports/               # Sendable protocols only where earned
        │   ├── <AppName>Platform/       # AVFAudio, WatchConnectivity, CoreLocation, Keychain, HTTP
        │   │   ├── AudioCapture/
        │   │   ├── WatchSync/
        │   │   └── SecureStorage/
        │   ├── <AppName>Intents/        # AppIntents, AppEntity, EntityQuery (depends on Core)
        │   │   ├── CaptureTaskIntent.swift
        │   │   └── TaskEntity.swift
        │   ├── <AppName>Features/       # SwiftUI views & @Query; .defaultIsolation(MainActor.self)
        │   │   ├── Capture/
        │   │   └── Inbox/
        │   └── <AppName>TestSupport/    # stateful fakes & contract suites (tests only!)
        │       ├── FakeAudioRecorder.swift
        │       └── SyncContractTests.swift
        └── Tests/
            ├── <AppName>DomainTests/
            ├── <AppName>CoreTests/
            └── <AppName>PlatformTests/
```

Apply these target rules:

- **`<AppName>Domain`:** Imports `Foundation` only. Contains plain `Sendable` structs, enums, and pure calculations with zero UI, storage, or device imports. Merge into `<AppName>Core` when there is no distinct pure-engine boundary worth enforcing separately.
- **`<AppName>Core`:** Owns domain rules, application services, persistence core, and earned app-owned `Sendable` port protocols. Imports zero UI (`SwiftUI`, `UIKit`) or hardware (`AVFAudio`, `CoreLocation`, `WatchConnectivity`, `ActivityKit`) frameworks.
- **`<AppName>Platform`:** Owns concrete Apple framework and network SDK adapters. Depends on `<AppName>Core` (and `<AppName>Domain` if needed). Never imported by `<AppName>Core` or `<AppName>Features`.
- **`<AppName>Intents`:** Owns `AppIntent`, `AppEntity`, and `EntityQuery` driving adapters. Depends on `<AppName>Core`. Receives services via `@AppDependency`, registered once at launch with `AppDependencyManager.shared.add(dependency:)` from the composition root (`AppGraph`), never through hidden mutable singletons.
- **`<AppName>Features`:** Owns SwiftUI views organised by product feature (`Capture/`, `Inbox/`, `Settings/`). Set `.defaultIsolation(MainActor.self)` in Swift 6 package settings where appropriate. Depends on `<AppName>Core` (and `<AppName>Intents` when triggering intents via `Button(intent:)`), never directly on `<AppName>Platform`.
- **`<AppName>TestSupport`:** Owns `actor` or `Synchronization.Mutex`-backed stateful fakes and shared contract test helpers. Linked only by test targets in `Package.swift`; never listed as a dependency of any production library or executable app target.
- **Executable targets (`Apps/iOS/`, `Apps/Watch/`, `Apps/Widgets/`):** Act as separate composition roots. Each executable links only the adapters its platform supports and wires its dependency graph (`AppGraph.live()` versus `AppGraph.scripted()`). Use `#if DEBUG` only to select the composition graph or diagnostic logging — never to branch business logic.

## 4. Xcode Synchronized Folders Versus `.xcodeproj` Target Membership

- **Use Xcode synchronized folders (buildable folder references, Xcode 16+)** for executable target directories (`Apps/iOS/`, `Apps/Watch/`, `Apps/Widgets/`) so filesystem moves stay aligned with Xcode and `.pbxproj` merge conflicts drop.
- **Keep shared code in `<AppName>Kit/Package.swift`, not multi-checked `.xcodeproj` files.** Avoid ticking multiple target-membership checkboxes on source files across iPhone, Watch, and Widget targets in `.xcodeproj`; target-membership checkboxes silently pull unwanted frameworks and symbols into extensions and bypass import enforcement.
- **Use explicit `.xcodeproj` target membership only for platform-specific bundle resources** such as `Info.plist`, `.entitlements`, asset catalogues, launch screens, and executable entry files.

## 5. Isolating Apple Platform APIs and SwiftData Pragmatism

- **Isolate hardware and OS SDKs in `<AppName>Platform`:** Wrap `AVFAudio`, `WatchConnectivity`, `CoreLocation`, `ActivityKit`, Keychain (`Security`), and network clients behind narrow app-owned `Sendable` protocols only when two real implementations exist or tests cannot run the live hardware/network. Keep other types concrete.
- **Keep framework types outside Core ports:** Pass plain `Sendable` domain values across target boundaries, never `AVAudioPCMBuffer`, raw `URLResponse`, or third-party SDK models.
- **SwiftData pragmatism:** Keep pure algorithmic targets (`<AppName>Domain`) `Foundation`-only with plain `Sendable` structs and enums. Inside `<AppName>Core`, when an app persists with SwiftData, keeping `@Model` types as the app's persistence model behind a single `@ModelActor` writer (`Store`) and passing `Sendable` IDs or value snapshots across actors avoids duplicating every entity into parallel DTO hierarchies while letting SwiftUI screens read with `@Query`. Document this trade-off explicitly rather than enforcing parallel DTO layers dogmatically.

## 6. Avoiding ViewModel Buckets and Thin Extension Roots

- **Reject `ViewModels/`, `Managers/`, `Helpers/`, `Shared/`, and `Utils/` folders.** They scatter one product feature across unrelated technical buckets and conflict with SwiftUI's native data flow.
- **Keep SwiftUI views as declarative driving adapters:** Views hold view-local `@State` (sheet flags, draft text, in-flight `Task`s) and call injected `@Observable` services (retained once at the composition root and injected via `.environment(...)`, never nested inside one another) or `AppIntent`s. Defer detailed SwiftUI state and view-composition rules to `swiftui-architecture`.
- **Keep Widget and Live Activity extensions thin:** Widget and Live Activity targets contain views and `Button(intent:)` invocations only. They do not open the app's SwiftData store directly or duplicate Core services.

## 7. Target Dependency Matrix

| Target | May depend on | Must not depend on |
| --- | --- | --- |
| `<AppName>Domain` | `Foundation` only | Core, Platform, Intents, Features, TestSupport, UI/hardware/storage frameworks |
| `<AppName>Core` | `<AppName>Domain`, `Foundation`, `SwiftData` (if persistence core) | Platform, Intents, Features, TestSupport, `SwiftUI`, `UIKit`, hardware SDKs |
| `<AppName>Platform` | `<AppName>Domain`, `<AppName>Core`, Apple/network SDKs | Features, Intents, TestSupport, executable apps |
| `<AppName>Intents` | `<AppName>Domain`, `<AppName>Core`, `AppIntents` | Platform internals, Features, TestSupport, executable apps |
| `<AppName>Features` | `<AppName>Domain`, `<AppName>Core`, `<AppName>Intents`, `SwiftUI` | Platform concrete adapters, TestSupport, executable apps |
| `<AppName>TestSupport` | `<AppName>Domain`, `<AppName>Core` (public/package contracts) | Production executable composition roots |
| `Apps/iOS`, `Apps/Watch` | Core, Features, Intents, platform-supported Platform targets | TestSupport |
| `Apps/Widgets` | Intents, shared read-only snapshot types, `WidgetKit`, `SwiftUI` | Direct database writers, TestSupport, full app composition |
| `*Tests` targets | Target under test, `<AppName>TestSupport`, `Testing` (`swift-testing`) | Production app executable internals |
