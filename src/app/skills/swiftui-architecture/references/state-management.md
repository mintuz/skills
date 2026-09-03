# State Management Patterns

## Four Primary Property Wrappers

### @State - Local, ephemeral view state

Use for simple view-specific state (toggles, text input, local UI state). Owned by the view, dies with the view. Keep state as close to where it's used as possible.

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

### @Binding - Two-way connection between views

Use to share state between parent and child views. Child reads and writes, parent owns. Enables data flow down and actions flow up.

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

### @Observable - Shared state across views (preferred for new code)

Use for shared state, services, managers. Replaces ObservableObject pattern. More efficient than ObservableObject with fine-grained updates.

```swift
@Observable
class AppAccountsManager {
    var currentAccount: Account?
    var availableAccounts: [Account] = []

    func switchAccount(_ account: Account) {
        currentAccount = account
    }
}
```

### @Environment - Dependency injection

Use for injecting shared services and managers. Makes dependencies explicit and testable. Access app-wide state without prop drilling.

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

Views receive data from above and send actions upward. This unidirectional flow makes apps predictable and debuggable.

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

Two moves are available, and they are not the same move.

1. Lift the value to the nearest common ancestor of the views that read it. Keep it in `@State` there. Pass it down as an argument or a `@Binding`. Two sibling views under one parent need only this move.
2. Move the value into a shared `@Observable` service. Do this when the value must outlive that ancestor view, when it is domain state that unrelated features read, or when passing it down would thread it through views that do not use it.

A value in a shared service takes the service's lifetime. It therefore stays set after the screen closes. Every view that reads it is invalidated when it changes, including a view that shows it only incidentally. The service also grows concerns that belong to one screen, which makes its ownership and its tests harder to follow.

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
