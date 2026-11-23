# Observable Patterns and Invalidation Granularity

## When to Use `@Observable`

- App-wide shared services and managers (authentication, settings, API clients)
- Feature coordinators and shared domain models read by multiple views
- View-local `@State`-owned `@Observable` models used specifically to cache derived collections, coarsen high-frequency geometry/scroll updates, or avoid deep field-by-field comparison of large value structs

Keep single-screen ephemeral UI state (text drafts, toggles, sheet flags) in local `@State` on the view, not in an app-wide shared service.

## Actor Isolation and `Equatable` Rules

- **Mark `@Observable` classes `@MainActor`** unless `SWIFT_DEFAULT_ACTOR_ISOLATION` is set to MainActor in build settings.
- **`@Observable` is not supported on `actor` types.**
- **Conform stored property types and collection element types to `Equatable`.** The `@Observable` macro inserts equality checks into generated setters so writing an equal value skips invalidation — but only when the property type is `Equatable`. Because `Array`, `Set`, and `Dictionary` conform to `Equatable` conditionally, their element types must also be `Equatable`.

```swift
struct FeedItem: Identifiable, Equatable {
    let id: UUID
    let title: String
    let isActive: Bool
}

@Observable
@MainActor
final class SettingsManager {
    var theme: Theme = .system
    var notificationsEnabled = true
    var fontSize: FontSize = .medium

    func updateTheme(_ newTheme: Theme) {
        theme = newTheme
    }
}
```

## Per-Property Observation Granularity

Observation tracks reads at the **stored property** level, not at fields inside a stored `struct` or individual elements inside an `Array`/`Set`/`Dictionary`.

### 1. Flatten Nested Value-Type Structs

Reading `session.user.name` subscribes the view to the whole `session.user` stored property, so changing `session.user.preferences` invalidates the view. Expose frequently changing or independently read fields as separate stored properties on the `@Observable` class (syncing from `didSet` if you must round-trip the struct).

### 2. Cache Derived and Filtered Collections

Computed properties establish dependencies transitively: `var activeItems: [FeedItem] { items.filter(\.isActive) }` subscribes readers to the entire `items` array and re-filters on every render. Cache derived collections in a stored `private(set) var` updated in `didSet` or mutating entry points:

```swift
@Observable
@MainActor
final class FeedModel {
    var items: [FeedItem] = [] {
        didSet { activeItems = items.filter(\.isActive) }
    }
    private(set) var activeItems: [FeedItem] = []
}
```

### 3. Never Have Row Views Index Back Into the Parent Collection

If a row view reads `model.items[index].title`, every row subscribes to the entire `items` array.

- **Single-field or small rows:** Pass narrow value inputs (`FeedRow(title: item.title)`).
- **Multi-field mutable rows:** Model each element as its own persisted `@Observable` class instance and pass that instance (`FeedRow(item: item)`). Never construct fresh `@Observable` instances on each read (pointer identity changes and invalidates every row).

### 4. Extract Smaller Models Without Over-Splitting

Extract a smaller `@Observable` model when many views share an isolated subset of state. Do not split a view into single-property subviews merely because it reads several narrow stored properties from one `@Observable` model.

## Observable Services Pattern

Keep business logic in `@Observable` services for testability. A service stores domain data only when more than one screen reads it; a single screen keeps its own items, loading flag, and error in `@State`:

```swift
@Observable
@MainActor
final class ItemService {
    private let api: APIClient
    var items: [Item] = []
    var isLoading = false
    var error: Error?

    init(api: APIClient = .shared) {
        self.api = api
    }

    func fetchItems() async throws {
        isLoading = true
        defer { isLoading = false }

        do {
            items = try await api.fetchItems()
            error = nil
        } catch {
            self.error = error
            throw error
        }
    }
}
```

For injection patterns, KeyPath bindings, and nested services vs nested structs, see `references/state-management.md` and `references/anti-patterns.md`.
