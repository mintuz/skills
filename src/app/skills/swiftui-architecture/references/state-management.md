# State Management Patterns

## Four Primary Property Wrappers

### @State - Local, ephemeral view state

For view-specific state (toggles, text input, local UI state) and view-owned `@Observable` models. The view owns it; it dies with the view.

Always mark `@State` properties `private`. On iOS 17 / macOS 14+, the `@State` macro defers evaluating the initial value expression into a lazy closure only when the getter is `private` (or `fileprivate`); non-private `@State` properties run their initialiser eagerly on every view value creation. During reviews, recommend making existing non-private `@State` properties `private` rather than changing their visibility unprompted.

```swift
struct ContentView: View {
    @State private var isExpanded = false
    @State private var searchText = ""

    var body: some View {
        VStack {
            TextField("Search", text: $searchText)
            if isExpanded {
                DetailView()
            }
        }
    }
}
```

### @Binding and KeyPath Projections

Shares mutable state between parent and child: the parent owns it, the child reads and writes it.

Avoid closure-based `Binding(get:set:)` in `body`: it heap-allocates on every body evaluation and breaks comparison, causing unnecessary invalidations. Prefer KeyPath bindings via `@Bindable`:

- For argument-less projections (for example `isPlaying` derived from `rate > 0`), add a computed get/set property on the `@Observable` model and pass `$model.isPlaying`.
- For parameterised projections, define a labeled `subscript` on the `@Observable` model and pass `$model[scoreFor: player]`.

```swift
struct ParentView: View {
    @State private var count = 0

    var body: some View {
        ChildView(count: $count)
    }
}

struct ChildView: View {
    @Binding var count: Int

    var body: some View {
        Button("Increment") {
            count += 1  // Updates parent's state
        }
    }
}
```

### @Observable - Shared state and invalidation control (preferred for new code)

For shared services, managers, and view-local caching/coarsening models. Replaces `ObservableObject` with per-property tracking. Mark `@Observable` classes `@MainActor` (unless default actor isolation is MainActor) and make stored property types `Equatable` (see `references/observable-patterns.md`).

```swift
@Observable
@MainActor
final class AppAccountsManager {
    var currentAccount: Account?
    var availableAccounts: [Account] = []

    func switchAccount(_ account: Account) {
        currentAccount = account
    }
}
```

### @Environment - Dependency injection

Injects shared services and managers. Makes dependencies explicit and testable, and reaches app-wide state without prop drilling.

```swift
struct ContentView: View {
    @Environment(AppAccountsManager.self) private var accountsManager

    var body: some View {
        if let account = accountsManager.currentAccount {
            Text("Logged in as \(account.username)")
        }
    }
}

// In your app setup
@main
struct MyApp: App {
    @State private var accountsManager = AppAccountsManager()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(accountsManager)
        }
    }
}
```

## Data Flow Principles

### State Flows Down, Actions Flow Up

Views receive data from above and send actions upward. Unidirectional flow keeps apps predictable and debuggable.

```swift
struct ParentView: View {
    @State private var items: [Item] = []

    var body: some View {
        ItemListView(
            items: items,  // Data flows down
            onDelete: { item in  // Actions flow up
                items.removeAll { $0.id == item.id }
            }
        )
    }
}

struct ItemListView: View {
    let items: [Item]
    let onDelete: (Item) -> Void

    var body: some View {
        List(items) { item in
            Button("Delete") {
                onDelete(item)  // Action flows up
            }
        }
    }
}
```

### Keep State Close to Usage

Lifting a value to the nearest common ancestor and moving it into a shared `@Observable` service are different moves; SKILL.md step 1 says when each applies. Two sibling views under one parent need only the lift.

A value in a shared service costs:

- It takes the service's lifetime, so it stays set after the screen closes.
- Every view that reads it is invalidated when it changes, including a view that shows it only incidentally.
- The service grows concerns that belong to one screen, which makes its ownership and its tests harder to follow.

**WRONG - Premature lifting:**

```swift
@Observable
class AppState {
    var searchText = ""  // Only used in one view
    var isExpanded = false  // Only used in one view
}
```

**CORRECT - Keep local:**

```swift
struct SearchView: View {
    @State private var searchText = ""
    @State private var isExpanded = false
    // ...
}
```

### Narrow Value-Type Inputs and `.onChange(of:)` Isolation

- **Value vs reference inputs:** SwiftUI compares `struct` inputs field by field, so any changed field invalidates `body` even if unread. Pass every view (including top-level screens) only the fields it reads or forwards. For large decoded structs (nested arrays, long strings, dozens of fields), split into per-view structs or hold the payload inside an `@Observable` model to avoid deep comparisons.
- **Isolate `.onChange(of:)` side effects:** Reading an `@Environment`, `@Binding`, or `@Observable` value inside `.onChange(of:)` subscribes the enclosing view even if the value is not rendered. When a view has an expensive `body` and reads a dependency solely for `.onChange(of:)`, move the read and `.onChange(of:)` into a dedicated `ViewModifier` so only the modifier body re-runs. Do not apply this extraction when the view already renders that dependency or its `body` is trivial.
