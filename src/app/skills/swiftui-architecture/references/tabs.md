# TabView Patterns

Builds on the AppRouter setup in `references/navigation-patterns.md`.

## Tab Selection Hooks

Expose a KeyPath computed property on the `@Observable` router/model (avoid closure `Binding(get:set:)` in `body`; see `references/state-management.md`) and use the modern `Tab` API (iOS 18+, avoiding soft-deprecated `.tabItem` and `.tag`):

```swift
extension Router where Tab == AppTab, Sheet == AppSheet {
    var interceptedTab: AppTab {
        get { selectedTab }
        set {
            if newValue == .compose {
                presentSheet(.compose)
                return
            }
            selectedTab = newValue
        }
    }
}

struct ContentView: View {
    @State private var router = Router<AppTab, Destination, AppSheet>(initialTab: .home)

    var body: some View {
        TabView(selection: $router.interceptedTab) {
            ForEach(AppTab.allCases) { tab in
                Tab(tab.title, systemImage: tab.icon, value: tab) {
                    NavigationStack(path: $router[tab]) {
                        TabRootView(tab: tab)
                    }
                }
            }
        }
    }
}
```

## Badges

```swift
TabView(selection: $router.selectedTab) {
    ForEach(AppTab.allCases) { tab in
        Tab(tab.title, systemImage: tab.icon, value: tab) {
            NavigationStack(path: $router[tab]) {
                TabRootView(tab: tab)
            }
        }
        .badge(badgeCount(for: tab))
    }
}

func badgeCount(for tab: AppTab) -> Int {
    tab == .notifications ? unreadNotifications : 0
}
```

## Tab-Specific Services

```swift
@ViewBuilder
private func tabContent(for tab: AppTab) -> some View {
    switch tab {
    case .home:
        HomeView()
            .environment(homeService)
    case .search:
        SearchView()
            .environment(searchService)
    case .notifications:
        NotificationsView()
            .environment(notificationsService)
    case .profile:
        ProfileView()
            .environment(profileService)
    }
}
```

## Shared State Across Tabs

```swift
struct ContentView: View {
    @State private var router = Router<AppTab, Destination, Sheet>(initialTab: .home)
    @State private var userSession = UserSession()

    var body: some View {
        TabView(selection: $router.selectedTab) {
            // Tabs
        }
        .environment(router)
        .environment(userSession)
    }
}
```

## Dynamic Tabs

```swift
struct DynamicTabView: View {
    @State private var router: Router<AppTab, Destination, Sheet>
    let enabledTabs: [AppTab]

    init(enabledTabs: [AppTab]) {
        self.enabledTabs = enabledTabs
        _router = State(initialValue: Router(initialTab: enabledTabs.first ?? .home))
    }

    var body: some View {
        TabView(selection: $router.selectedTab) {
            ForEach(enabledTabs) { tab in
                Tab(tab.title, systemImage: tab.icon, value: tab) {
                    NavigationStack(path: $router[tab]) {
                        TabRootView(tab: tab)
                    }
                }
            }
        }
    }
}
```

## Reset Navigation

```swift
func resetAllTabs() {
    for tab in AppTab.allCases {
        router[tab].removeAll()
    }
    router.selectedTab = .home
}
```
