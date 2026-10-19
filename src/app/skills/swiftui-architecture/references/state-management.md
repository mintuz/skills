# State Management Patterns

## Four Primary Property Wrappers

### @State - Local, ephemeral view state

For view-specific state (toggles, text input, local UI state). The view owns it; it dies with the view.

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

Shares state between parent and child: the parent owns it, the child reads and writes it.

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

For shared state, services, and managers. Replaces `ObservableObject`, with finer-grained, more efficient updates.

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
