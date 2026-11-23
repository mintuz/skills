# Anti-Patterns to Avoid

## ❌ Don't Create ViewModels

**WRONG:**

```swift
class ContentViewModel: ObservableObject {
    @Published var items: [Item] = []

    func loadItems() {
        // ...
    }
}

struct ContentView: View {
    @StateObject private var viewModel = ContentViewModel()
    // ...
}
```

**CORRECT - Use @State and @Environment:**

```swift
struct ContentView: View {
    @State private var items: [Item] = []
    @State private var error: Error?
    @Environment(ItemAPI.self) private var api  // returns items; it stores none

    var body: some View {
        List(items) { item in
            Text(item.name)
        }
        .task {
            do {
                let loaded = try await api.fetchItems()
                guard !Task.isCancelled else { return }
                items = loaded
            } catch {
                guard !Task.isCancelled else { return }
                self.error = error
            }
        }
    }
}
```

## ❌ Don't Use Combine for Simple Async

**WRONG:**

```swift
class DataLoader: ObservableObject {
    @Published var items: [Item] = []
    private var cancellables = Set<AnyCancellable>()

    func load() {
        API.fetchItemsPublisher()
            .sink { items in
                self.items = items
            }
            .store(in: &cancellables)
    }
}
```

**CORRECT:**

```swift
struct ContentView: View {
    @State private var items: [Item] = []

    var body: some View {
        // ...
        .task {
            do {
                items = try await API.fetchItems()
            } catch {
                // show an error state
            }
        }
    }
}
```

## ❌ Don't Own One Service Through Another (or Nest Value Structs on `@Observable`)

Nesting does not break observation for nested `@Observable` objects, but it makes the outer service own the inner one, hiding the inner service's lifetime and complicating tests.

By contrast, nesting a **value-type `struct`** inside an `@Observable` class *does* hurt invalidation granularity: reading `session.user.name` subscribes the view to `session.user`, so editing `session.user.preferences` invalidates the view. Flatten independently read struct fields onto the `@Observable` class (see `references/observable-patterns.md`).

**AVOID:**

```swift
@Observable
@MainActor
final class AppState {
    var userManager: UserManager  // AppState now owns UserManager's lifetime

    init(userManager: UserManager) {
        self.userManager = userManager
    }
}
```

**PREFER - retain each service once and inject it separately:**

```swift
ContentView()
    .environment(appState)
    .environment(userManager)
```

## ❌ Don't Fight SwiftUI Updates

Let SwiftUI's update system decide when views update; do not control updates manually.

**WRONG:**

```swift
struct ContentView: View {
    @State private var shouldUpdate = false

    var body: some View {
        if shouldUpdate {
            Text("Updated")  // Manual update control
        }
    }
}
```

**CORRECT:**

```swift
struct ContentView: View {
    @State private var count = 0

    var body: some View {
        Text("Count: \(count)")  // SwiftUI handles updates
    }
}
```

## ❌ Don't Use @StateObject with @Observable

`@StateObject` is for `ObservableObject`, not `@Observable` classes.

**WRONG:**

```swift
@Observable
class DataManager { }

struct ContentView: View {
    @StateObject private var manager = DataManager()  // WRONG
}
```

**CORRECT:**

```swift
@Observable
class DataManager { }

struct ContentView: View {
    @State private var manager = DataManager()  // CORRECT
}
```

## ❌ Don't Overuse @Binding

Use `@Binding` only when the child must modify parent state; a callback is often clearer.

**Callback instead of `@Binding`:**

```swift
struct ParentView: View {
    @State private var items: [Item] = []

    var body: some View {
        ItemListView(
            items: items,
            onAdd: { newItem in
                items.append(newItem)
            },
            onDelete: { item in
                items.removeAll { $0.id == item.id }
            }
        )
    }
}

struct ItemListView: View {
    let items: [Item]
    let onAdd: (Item) -> Void
    let onDelete: (Item) -> Void
    // Clear intent, parent controls the "how"
}
```

## ❌ Don't Put Screen UI State in Shared `@Observable` Services

App-wide shared `@Observable` services hold domain logic and shared data; screen-local presentation state (alerts, search text, sheet flags) stays in the view's `@State`. (A view-local `@State`-owned `@Observable` model is acceptable when needed specifically for derived-collection caching or coarsening high-frequency geometry/scroll values.)

**WRONG:**

```swift
@Observable
@MainActor
final class ItemManager {
    var showAlert = false  // Screen UI state doesn't belong in a shared service
    var alertMessage = ""
}
```

**CORRECT:**

```swift
@Observable
@MainActor
final class ItemManager {
    var items: [Item] = []
    func addItem(_ item: Item) { }
}

struct ContentView: View {
    @Environment(ItemManager.self) private var manager
    @State private var showAlert = false  // UI state stays in view
    @State private var alertMessage = ""
}
```

## Additional Performance and API Anti-Patterns

- **Conditional `.if` `@ViewBuilder` modifiers:** Destroy structural identity, reset `@State`, and break animations; use ternary arguments and `AnyShapeStyle` instead (`references/modifiers.md`).
- **Single-child `Group` and heavy `View.init`:** Drop `Group { SingleView() }`, split multi-section views into separate `View` structs, and keep `init` constant-time (`references/structure.md`).
- **Closures, unstable defaults, high-frequency values, or unused KeyPath reads in `@Environment` / `@FocusedValue`:** Defunctionalise closures, stabilise defaults (`private static let` or `Optional`), coarsen high-frequency updates into `@Observable` or `scrollTransition`/`visualEffect(in:)`, and remove unused KeyPath reads (`references/environment.md`).
- **Closure `Binding(get:set:)` in `body`:** Heap-allocates and breaks equality; use `@Bindable` KeyPath computed properties or subscripts (`references/state-management.md`).
- **Inline `.filter`/`.sorted`, `indices`/`\.offset`, `id: \.self` on large structs, `AnyView` rows, and multi-shape `List` rows:** Cache derived collections, use stable cheap-to-hash IDs, and keep `List` rows unary single-root concrete `View` structs (`references/foreach.md`).
- **Soft-deprecated APIs in new code:** Check `references/soft-deprecated-apis.md` (`references/soft-deprecation.md`).
