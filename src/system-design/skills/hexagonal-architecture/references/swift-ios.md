# Swift 6 / SwiftUI / App Intents (iOS) Example

Load this reference when implementing or reviewing an opted-in hexagonal feature on iOS with Swift 6, SwiftUI, SwiftData, and App Intents. In every iOS hexagonal design or review, state all of these concrete boundaries explicitly:

- **Companion skills:** cite `swiftui-architecture` (zero ViewModels, `@Observable` via `.environment`), `app-intent-driven-development` (`AppIntent` driving adapters via `@AppDependency`), `swift-testing` (`@Test`, `#expect`, `#require`), and `codebase-layout` (SPM target enforcement) by name.
- **Pure domain:** `Foundation`-only imports with plain `Sendable` domain structs/enums and injected clock/IDs.
- **Persistence:** pragmatic SwiftData `@Model` behind a single `@ModelActor` writer passing `Sendable` IDs/values across actors.
- **Ports & fakes:** `Sendable` protocols only where earned, tested through driving ports with `actor`- or `Synchronization.Mutex`-backed stateful fakes in Swift Testing (`@Test`, `#expect`).

## 1. Mechanical Boundary Enforcement via One Local Swift Package

Xcode groups and folders inside a single app target share one `internal` namespace and enforce zero import boundaries. Use a single local Swift Package (`NotesKit/Package.swift`) with explicit target dependencies and `public`/`package`/`internal` access control (`codebase-layout`):

| Target | Zone | Allowed imports | Role |
| --- | --- | --- | --- |
| `NotesDomain` | Inside (pure) | `Foundation` only | Pure value types (`Sendable` structs/enums) and deterministic rules; zero UI, storage, or hardware imports |
| `NotesCore` | Inside (app core) | `NotesDomain`, `Foundation` (+ `SwiftData` when using pragmatic `@ModelActor` persistence) | Application services (`@Observable`), persistence actor, app-owned `Sendable` ports; zero UI or hardware imports |
| `NotesAdapters` | Outside (driven) | `NotesCore`, vendor SDKs, system frameworks (`URLSession`, Keychain, hardware) | Thin driven adapters translating external SDKs/APIs into `NotesCore` domain values |
| `NotesIntents` | Outside (driving) | `NotesCore`, `AppIntents` | `AppEntity`, queries, and thin `AppIntent` driving adapters using `@AppDependency` |
| `NotesFeatures` | Outside (driving) | `NotesCore`, `SwiftUI` (`.defaultIsolation(MainActor.self)`) | Declarative SwiftUI views, `@Query`, view-local `@State`; zero ViewModels |
| `NotesTestSupport` | Outside (testing) | `NotesCore` | Stateful `actor`/`Mutex` fakes with fault injection and shared contract suites |
| App / Widget targets | Composition roots | All targets their platform needs | Separate composition roots (`AppGraph.live()` vs `AppGraph.scripted()`); Widgets contain views and `Button(intent:)` only and never open the app database directly |

## 2. Pure Domain Rules vs Pragmatic SwiftData Core

Keep algorithmic/business policy in `NotesDomain` with `Foundation`-only `Sendable` types and injected `now: Date`:

```swift
// NotesKit/Sources/NotesDomain/NoteArchivePolicy.swift
import Foundation

public struct NoteSnapshot: Sendable, Equatable {
    public let id: UUID
    public let isPinned: Bool
    public let archivedAt: Date?

    public init(id: UUID, isPinned: Bool, archivedAt: Date?) {
        self.id = id
        self.isPinned = isPinned
        self.archivedAt = archivedAt
    }
}

public enum ArchiveDecision: Sendable, Equatable {
    case archive(at: Date)
    case rejectedPinned
    case alreadyArchived
}

public enum NoteArchivePolicy {
    public static func evaluate(_ note: NoteSnapshot, now: Date) -> ArchiveDecision {
        if note.archivedAt != nil { return .alreadyArchived }
        if note.isPinned { return .rejectedPinned }
        return .archive(at: now)
    }
}
```

**Ratified SwiftData trade-off:** Do not duplicate every `@Model` entity into parallel DTO structs dogmatically. In an app persistence core backed by SwiftData, keep `@Model` as the persistence model behind a single `@ModelActor` writer (`NoteStore`) that accepts and returns `Sendable` IDs/snapshots across actors, while allowing SwiftUI views to read reactively with `@Query`.

## 3. Earned `Sendable` Ports and Plain Domain Values

Introduce a Swift `protocol` (conforming to `Sendable` when crossing concurrency domains) **only** when two real implementations exist or tests cannot run the real hardware, network, or vendor SDK. Keep other collaborators concrete or inject closure parameters with production defaults (`now: @Sendable () -> Date = Date.now`).

Never pass vendor SDK or framework types (such as `SyncSDKClient`, `URLResponse`, or `AVAudioPCMBuffer`) across a port; pass plain `Sendable` domain values.

```swift
// NotesKit/Sources/NotesCore/Ports/NoteSyncGateway.swift
import Foundation

public struct NoteArchiveEvent: Sendable, Equatable {
    public let noteID: UUID
    public let archivedAt: Date

    public init(noteID: UUID, archivedAt: Date) {
        self.noteID = noteID
        self.archivedAt = archivedAt
    }
}

public enum NoteSyncError: Error, Sendable, Equatable {
    case offline
    case rejected
}

public protocol NoteSyncGateway: Sendable {
    func publishArchive(_ event: NoteArchiveEvent) async throws(NoteSyncError)
}
```

## 4. Application Service (Inside) and Thin Driven Adapter (Outside)

Expose one `@Observable` service per capability, retained once at `AppGraph`. Never nest one `@Observable` service inside another (`swiftui-architecture`).

```swift
// NotesKit/Sources/NotesCore/NoteService.swift
import Foundation
import NotesDomain
import Observation

public enum ArchiveOutcome: Sendable, Equatable {
    case archived
    case alreadyArchived
    case rejectedPinned
    case notFound
    case queuedOffline
}

@MainActor
@Observable
public final class NoteService {
    private let store: NoteStore
    private let syncGateway: any NoteSyncGateway
    private let now: @Sendable () -> Date

    public init(
        store: NoteStore,
        syncGateway: any NoteSyncGateway,
        now: @Sendable @escaping () -> Date = { Date.now }
    ) {
        self.store = store
        self.syncGateway = syncGateway
        self.now = now
    }

    public func archive(noteID: UUID) async throws -> ArchiveOutcome {
        guard let snapshot = try await store.snapshot(for: noteID) else {
            return .notFound
        }
        switch NoteArchivePolicy.evaluate(snapshot, now: now()) {
        case .alreadyArchived:
            return .alreadyArchived
        case .rejectedPinned:
            return .rejectedPinned
        case .archive(let timestamp):
            try await store.markArchived(noteID: noteID, at: timestamp)
            do {
                try await syncGateway.publishArchive(
                    NoteArchiveEvent(noteID: noteID, archivedAt: timestamp)
                )
                return .archived
            } catch .offline {
                return .queuedOffline
            }
        }
    }
}
```

```swift
// NotesKit/Sources/NotesAdapters/VendorNoteSyncGateway.swift
import NotesCore
import SyncSDK

public struct VendorNoteSyncGateway: NoteSyncGateway {
    private let client: SyncSDKClient

    public init(client: SyncSDKClient) {
        self.client = client
    }

    public func publishArchive(_ event: NoteArchiveEvent) async throws(NoteSyncError) {
        do {
            try await client.sendArchive(id: event.noteID.uuidString, epochSeconds: event.archivedAt.timeIntervalSince1970)
        } catch SyncSDKError.networkUnavailable {
            throw .offline
        } catch {
            throw .rejected
        }
    }
}
```

## 5. Driving Adapters: SwiftUI (Zero ViewModels) and App Intents (`@AppDependency`)

SwiftUI views are declarative driving adapters holding view-local `@State` (sheet flags, status notices, in-flight `Task`s) and calling services from `@Environment` or invoking `AppIntent`s (`Button(intent:)`). Do not create ViewModel classes.

```swift
// NotesKit/Sources/NotesFeatures/NoteDetailView.swift
import NotesCore
import SwiftUI

public struct NoteDetailView: View {
    @Environment(NoteService.self) private var noteService
    let noteID: UUID

    @State private var archiveTask: Task<Void, Never>?
    @State private var statusMessage: String?

    public var body: some View {
        VStack(spacing: 12) {
            Button("Archive Note") {
                archiveTask?.cancel()
                archiveTask = Task {
                    defer { archiveTask = nil }
                    await handleArchive()
                }
            }
            if let statusMessage {
                Text(statusMessage)
            }
        }
        .onDisappear {
            archiveTask?.cancel()
        }
    }

    private func handleArchive() async {
        do {
            let outcome = try await noteService.archive(noteID: noteID)
            guard !Task.isCancelled else { return }
            switch outcome {
            case .archived: statusMessage = "Archived."
            case .queuedOffline: statusMessage = "Archived locally; sync queued."
            case .rejectedPinned: statusMessage = "Unpin this note before archiving."
            case .alreadyArchived, .notFound: statusMessage = nil
            }
        } catch {
            guard !Task.isCancelled else { return }
            statusMessage = "Could not archive note."
        }
    }
}
```

`AppIntent`s are first-class driving adapters: resolve `AppEntity` parameters, read the service through `@AppDependency`, delegate one call, and return dialog (`app-intent-driven-development`). Zero business logic in the intent.

```swift
// NotesKit/Sources/NotesIntents/ArchiveNoteIntent.swift
import AppIntents
import NotesCore

public struct ArchiveNoteIntent: AppIntent {
    public static let title: LocalizedStringResource = "Archive Note"

    @Parameter(title: "Note")
    public var note: NoteEntity

    @AppDependency
    private var noteService: NoteService

    public init() {}

    @MainActor
    public func perform() async throws -> some IntentResult & ProvidesDialog {
        let outcome = try await noteService.archive(noteID: note.id)
        let dialog: IntentDialog = switch outcome {
        case .archived: "Archived \(note.title)."
        case .queuedOffline: "Archived \(note.title) offline."
        case .rejectedPinned: "Unpin \(note.title) before archiving."
        case .alreadyArchived: "\(note.title) is already archived."
        case .notFound: "Note not found."
        }
        return .result(dialog: dialog)
    }
}
```

## 6. Composition Root (`AppGraph.live()` vs `AppGraph.scripted()`)

Wire concrete adapters once at launch in `AppGraph`, inject `@Observable` services into SwiftUI via `.environment(...)`, and register them once for App Intents via `AppDependencyManager.shared.add(dependency:)`. Use `#if DEBUG` only to choose `AppGraph.scripted()` or diagnostic logging — never to branch business logic.

```swift
// App/AppGraph.swift
import AppIntents
import NotesAdapters
import NotesCore
import SwiftData
import SwiftUI

@MainActor
final class AppGraph {
    let modelContainer: ModelContainer
    let noteService: NoteService

    private init(modelContainer: ModelContainer, syncGateway: any NoteSyncGateway) {
        self.modelContainer = modelContainer
        let store = NoteStore(modelContainer: modelContainer)
        let noteService = NoteService(store: store, syncGateway: syncGateway)
        self.noteService = noteService
        AppDependencyManager.shared.add(dependency: noteService)
    }

    static func live() throws -> AppGraph {
        let container = try ModelContainer(for: NoteRecord.self)
        let gateway = VendorNoteSyncGateway(client: SyncSDKClient())
        return AppGraph(modelContainer: container, syncGateway: gateway)
    }

    #if DEBUG
    static func scripted(syncGateway: any NoteSyncGateway) throws -> AppGraph {
        let config = ModelConfiguration(isStoredInMemoryOnly: true)
        let container = try ModelContainer(for: NoteRecord.self, configurations: config)
        return AppGraph(modelContainer: container, syncGateway: syncGateway)
    }
    #endif
}
```

## 7. Stateful Actor Fakes and Shared Contract Suites (`swift-testing`)

Swift is statically compiled: there are no module-import mock hooks, and `struct`, `enum`, `actor`, and `final class` cannot be subclassed for override seams. Use `actor` or `Synchronization.Mutex` stateful fakes with controllable fault injection, `URLProtocol` on a custom `URLSessionConfiguration` for HTTP adapter tests, and isolated per-test fixtures in Swift Testing (`@Test`, `#expect`, `#require`).

```swift
// NotesKit/Sources/NotesTestSupport/FakeNoteSyncGateway.swift
import NotesCore

public actor FakeNoteSyncGateway: NoteSyncGateway {
    public private(set) var published: [NoteArchiveEvent] = []
    private var nextFailure: NoteSyncError?

    public init(nextFailure: NoteSyncError? = nil) {
        self.nextFailure = nextFailure
    }

    public func setNextFailure(_ error: NoteSyncError?) {
        nextFailure = error
    }

    public func publishArchive(_ event: NoteArchiveEvent) async throws(NoteSyncError) {
        if let error = nextFailure {
            nextFailure = nil
            throw error
        }
        published.append(event)
    }
}
```

```swift
// NotesKit/Tests/NotesCoreTests/NoteServiceTests.swift
import Foundation
import NotesCore
import NotesTestSupport
import SwiftData
import Testing

@Suite
struct NoteServiceTests {
    @Test
    @MainActor
    func queuesOfflineWhenSyncIsUnavailable() async throws {
        let container = try ModelContainer(
            for: NoteRecord.self,
            configurations: ModelConfiguration(isStoredInMemoryOnly: true)
        )
        let store = NoteStore(modelContainer: container)
        let noteID = try await store.insert(title: "Grocery List", isPinned: false)
        let fakeSync = FakeNoteSyncGateway(nextFailure: .offline)
        let fixedNow = Date(timeIntervalSince1970: 1_750_000_000)
        let service = NoteService(store: store, syncGateway: fakeSync, now: { fixedNow })

        let outcome = try await service.archive(noteID: noteID)

        #expect(outcome == .queuedOffline)
        #expect(try await store.snapshot(for: noteID)?.archivedAt == fixedNow)
        #expect(await fakeSync.published.isEmpty)
    }
}
```

Run a shared Swift Testing contract helper against both `FakeNoteSyncGateway` and `VendorNoteSyncGateway` (backed by a custom `URLProtocol` stub) so the fake and live adapter obey identical success and error contracts.
