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

## ❌ Don't Own One Service Through Another

Nesting does not break observation: a view tracks the properties it reads through a nested `@Observable` object. Nesting does make the outer service own the inner one, which hides the inner service's lifetime and forces every test of the outer service to build the inner one.

**AVOID:**

```swift
@Observable
class AppState {
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

## ❌ Don't Put UI Logic in @Observable Classes

`@Observable` classes hold business logic and data; UI state stays in the view.

**WRONG:**

```swift
@Observable
class ItemManager {
    var showAlert = false  // UI state doesn't belong here
    var alertMessage = ""
}
```

**CORRECT:**

```swift
@Observable
class ItemManager {
    // Only business logic and data
    var items: [Item] = []
    func addItem(_ item: Item) { }
}

struct ContentView: View {
    @Environment(ItemManager.self) private var manager
    @State private var showAlert = false  // UI state stays in view
    @State private var alertMessage = ""
}
```
