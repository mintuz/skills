# Swift and iOS Seams (Swift 6 Strict Concurrency)

Language-specific seam patterns for Swift 6, iOS, and Swift Testing. Read the core workflow and seam granularity rules in `../SKILL.md` first.

## 1. Swift Static-Compilation Limits

Apply these constraints before designing any Swift seam:

- **No runtime module mocking:** Swift is statically compiled. There is no `vi.mock()` or import-swapping hook. Do not suggest runtime module replacement.
- **No Extract-and-Override on value types, enums, actors, or `final class`:** Only non-final classes allow method overriding. Modern Swift domain types and services are typically `struct`, `enum`, `actor`, or `final class` and cannot be subclassed in tests.
- **Strict concurrency (`Sendable`):** Under Swift 6 strict concurrency, every closure, protocol, or witness struct crossing isolation boundaries must be `Sendable` (`@Sendable` closures or `protocol ...: Sendable`).

## 2. `@Sendable` Closure Parameters with Production Defaults

For a single dependency—such as a clock, ID generator, or fault-injection hook—inject a `@Sendable` closure with a production default on the initialiser or method. Existing production call sites remain unchanged.

```swift
import Foundation

public struct NoteArchiver: Sendable {
    public enum WriteOp: Sendable { case save(id: UUID) }

    private let now: @Sendable () -> Date
    private let makeID: @Sendable () -> UUID
    private let beforeSave: @Sendable (WriteOp) throws -> Void

    public init(
        now: @Sendable @escaping () -> Date = { Date.now },
        makeID: @Sendable @escaping () -> UUID = UUID.init,
        beforeSave: @Sendable @escaping (WriteOp) throws -> Void = { _ in }
    ) {
        self.now = now
        self.makeID = makeID
        self.beforeSave = beforeSave
    }

    public func makeArchivedRecord(title: String) throws -> ArchivedNote {
        let id = makeID()
        try beforeSave(.save(id: id))
        return ArchivedNote(id: id, title: title, archivedAt: now())
    }
}
```

Existing `NoteArchiver()` calls compile unchanged; tests supply deterministic closures and fault hooks at the initialiser enabling point.

## 3. Narrow `Sendable` Protocols and Closure-Witness Structs

When a collaborator owns two or more related operations, choose one of two explicit seams:

- **Narrow `Sendable` protocol:** introduce a protocol only when earned (two real implementations exist, or tests cannot run real hardware, storage, or network). Pass plain `Sendable` domain values across the protocol—never raw framework or SDK types such as `URLResponse` or `AVAudioPCMBuffer`.
- **Closure-witness `struct` (`Sendable`):** group a small set of `@Sendable` closures into a value type with a `.live` static default. This avoids boilerplate conformance types while remaining concurrency-safe and zero-framework.

```swift
public struct KeyValueStore: Sendable {
    public var dateForKey: @Sendable (String) -> Date?
    public var setDate: @Sendable (Date, String) -> Void

    public static let standardUserDefaults = KeyValueStore(
        dateForKey: { key in UserDefaults.standard.object(forKey: key) as? Date },
        setDate: { date, key in UserDefaults.standard.set(date, forKey: key) }
    )
}
```

## 4. Wrapping Apple Singletons

Direct calls to `UserDefaults.standard`, `FileManager.default`, `Date.now`, or `URLSession.shared` inside a service body hide dependencies behind process-wide singletons. Move every singleton reference into a production default so the service body references zero singletons.

```swift
// Sources/SyncCore/SyncQuotaService.swift
import Foundation

public struct SyncQuotaService: Sendable {
    public typealias FetchData = @Sendable (URL) async throws -> Data

    private let store: KeyValueStore
    private let now: @Sendable () -> Date
    private let fetchData: FetchData

    public init(
        store: KeyValueStore = .standardUserDefaults,
        now: @Sendable @escaping () -> Date = { Date.now },
        fetchData: @escaping FetchData = { url in
            try await URLSession.shared.data(from: url).0
        }
    ) {
        self.store = store
        self.now = now
        self.fetchData = fetchData
    }

    public func refreshQuota(for accountID: String) async throws -> Bool {
        let key = "quota.\(accountID)"
        if let lastCheck = store.dateForKey(key), now().timeIntervalSince(lastCheck) < 300 {
            return false
        }
        let url = URL(string: "https://api.example.com/quota/\(accountID)")!
        let data = try await fetchData(url)
        let allowed = String(decoding: data, as: UTF8.self) == "ok"
        store.setDate(now(), key)
        return allowed
    }
}
```

Avoid `UserDefaults(suiteName:)` in ordinary unit tests: it still touches disk preferences and requires teardown to prevent cross-test pollution. Use an isolated in-memory fake for unit tests, and reserve suite-backed `UserDefaults` for dedicated persistence integration tests.

## 5. SwiftUI `@Environment` Seams (Without ViewModels)

Follow pure SwiftUI data flow (`swiftui-architecture`):

- Keep SwiftUI views as declarative driving adapters holding view-local `@State` (sheet flags, draft text, in-flight `Task`s).
- Do **not** introduce ViewModels merely to create test seams.
- Inject shared `@Observable` services or lightweight seams through SwiftUI `@Environment` (`@Entry` on `EnvironmentValues`) with production defaults at the app composition root, and override them with `.environment(...)` in previews or view tests.

```swift
import SwiftUI

extension EnvironmentValues {
    @Entry var syncQuotaService: SyncQuotaService = SyncQuotaService()
}

struct QuotaStatusView: View {
    @Environment(\.syncQuotaService) private var quotaService
    @State private var isAllowed = false

    let accountID: String

    var body: some View {
        Text(isAllowed ? "Ready" : "Paused")
            .task {
                isAllowed = (try? await quotaService.refreshQuota(for: accountID)) ?? false
            }
    }
}
```

## 6. HTTP Boundary Seam with Custom `URLProtocol`

When you must test real `URLRequest` construction, headers, encoding, or HTTP status handling at the networking edge, inject a `URLSession` defaulting to `.shared` and supply a per-test `URLSession(configuration: .ephemeral)` with a custom `URLProtocol` subclass:

- Never call global `URLProtocol.registerClass(_:)` in unit tests; Swift Testing runs tests in parallel and global registration causes cross-test interference.
- Route each request to an isolated per-test handler (for example, keyed by a unique test header or token stored inside a `Synchronization.Mutex`-protected registry) and remove the handler on test teardown.

```swift
import Foundation
import Synchronization

final class StubURLProtocol: URLProtocol, @unchecked Sendable {
    typealias Handler = @Sendable (URLRequest) throws -> (HTTPURLResponse, Data)

    private static let handlers = Mutex<[String: Handler]>([:])

    static func register(id: String, handler: @escaping Handler) {
        handlers.withLock { $0[id] = handler }
    }

    static func unregister(id: String) {
        handlers.withLock { _ = $0.removeValue(forKey: id) }
    }

    override class func canInit(with request: URLRequest) -> Bool { true }
    override class func canonicalRequest(for request: URLRequest) -> URLRequest { request }

    override func startLoading() {
        let id = request.value(forHTTPHeaderField: "X-Test-Session-ID") ?? ""
        let handler = Self.handlers.withLock { $0[id] }
        guard let handler else {
            client?.urlProtocol(self, didFailWithError: URLError(.badServerResponse))
            return
        }
        do {
            let (response, data) = try handler(request)
            client?.urlProtocol(self, didReceive: response, cacheStoragePolicy: .notAllowed)
            client?.urlProtocol(self, didLoad: data)
            client?.urlProtocolDidFinishLoading(self)
        } catch {
            client?.urlProtocol(self, didFailWithError: error)
        }
    }

    override func stopLoading() {}
}

// Per-test session helper
func makeStubSession(id: String) -> URLSession {
    let config = URLSessionConfiguration.ephemeral
    config.protocolClasses = [StubURLProtocol.self]
    config.httpAdditionalHeaders = ["X-Test-Session-ID": id]
    return URLSession(configuration: config)
}
```

## 7. Concurrency-Safe Stateful Fakes in Swift Testing

Swift Testing runs `@Test` functions concurrently by default. Create fresh, isolated per-test fakes backed by an `actor` (for `async` seams) or `Synchronization.Mutex` (for synchronous `@Sendable` seams) to support both sensing and fault injection with zero shared global state.

```swift
import Foundation
import Synchronization
import Testing
@testable import SyncCore

final class InMemoryKeyValueStore: Sendable {
    private let values = Mutex<[String: Date]>([:])

    var seam: KeyValueStore {
        KeyValueStore(
            dateForKey: { key in self.values.withLock { $0[key] } },
            setDate: { date, key in self.values.withLock { $0[key] = date } }
        )
    }

    func date(for key: String) -> Date? {
        values.withLock { $0[key] }
    }
}

actor FakeQuotaTransport {
    private(set) var requestedURLs: [URL] = []
    private var nextResult: Result<Data, Error>

    init(response: Result<Data, Error>) {
        self.nextResult = response
    }

    func fetch(_ url: URL) throws -> Data {
        requestedURLs.append(url)
        return try nextResult.get()
    }
}

@Test func refreshQuotaFetchesWhenStaleAndRecordsTimestamp() async throws {
    let fixedNow = Date(timeIntervalSince1970: 1_700_000_000)
    let store = InMemoryKeyValueStore()
    let transport = FakeQuotaTransport(response: .success(Data("ok".utf8)))

    let service = SyncQuotaService(
        store: store.seam,
        now: { fixedNow },
        fetchData: { url in try await transport.fetch(url) }
    )

    let allowed = try await service.refreshQuota(for: "acct-42")

    #expect(allowed == true)
    #expect(await transport.requestedURLs == [URL(string: "https://api.example.com/quota/acct-42")!])
    #expect(store.date(for: "quota.acct-42") == fixedNow)
}

@Test func refreshQuotaPropagatesTransportFaultWithoutRecordingTimestamp() async {
    struct SimulatedOffline: Error {}
    let store = InMemoryKeyValueStore()
    let transport = FakeQuotaTransport(response: .failure(SimulatedOffline()))

    let service = SyncQuotaService(
        store: store.seam,
        now: { Date(timeIntervalSince1970: 1_700_000_000) },
        fetchData: { url in try await transport.fetch(url) }
    )

    await #expect(throws: SimulatedOffline.self) {
        _ = try await service.refreshQuota(for: "acct-42")
    }
    #expect(store.date(for: "quota.acct-42") == nil)
}
```

## Quick Comparison

| Seam Type | Enabling Point | Swift 6 `Sendable` | Works on `struct`/`actor` | Permanence |
| --- | --- | --- | --- | --- |
| `@Sendable` closure default | `init` / method argument list | Full | Yes | Local seam or durable contract |
| Narrow `Sendable` protocol | `init` / method parameter | Full | Yes | Durable contract when earned |
| Closure-witness `struct` | `init` / method parameter (`.live` default) | Full | Yes | Local seam or durable contract |
| SwiftUI `@Environment` | `.environment(...)` modifier | MainActor / `Sendable` | Yes | UI composition seam |
| Custom `URLProtocol` on `URLSessionConfiguration` | Per-test `URLSession` injection | Full (`Mutex` registry) | Yes | HTTP boundary test seam |
| Subclass and override | Test subclass | Non-final classes only | **No** | Legacy class scaffolding only |
| Runtime module mock | N/A in Swift | N/A | **No** | Not supported in Swift |
