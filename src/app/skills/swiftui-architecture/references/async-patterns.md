# Async Data Loading

Use async/await with the .task modifier for lifecycle-aware async operations.

## The .task Modifier Pattern

```swift
struct ContentView: View {
    @State private var items: [Item] = []
    @State private var isLoading = false
    @State private var error: Error?

    var body: some View {
        Group {
            if isLoading {
                ProgressView()
            } else if let error {
                ErrorView(error: error)
            } else {
                ItemListView(items: items)
            }
        }
        .task {
            await loadItems()
        }
    }

    private func loadItems() async {
        isLoading = true
        do {
            let loaded = try await API.fetchItems()
            guard !Task.isCancelled else { return }  // a newer load owns this state
            items = loaded
            error = nil
        } catch {
            guard !Task.isCancelled else { return }
            self.error = error
        }
        isLoading = false
    }
}
```

## Loading State Pattern

Represent loading states explicitly with enums when appropriate:

```swift
enum LoadingState<T> {
    case idle
    case loading
    case loaded(T)
    case failed(Error)
}

struct ContentView: View {
    @State private var state: LoadingState<[Item]> = .idle

    var body: some View {
        Group {
            switch state {
            case .idle:
                Color.clear
            case .loading:
                ProgressView()
            case .loaded(let items):
                ItemListView(items: items)
            case .failed(let error):
                ErrorView(error: error)
            }
        }
        .task {
            state = .loading
            do {
                let items = try await API.fetchItems()
                guard !Task.isCancelled else { return }
                state = .loaded(items)
            } catch {
                guard !Task.isCancelled else { return }
                state = .failed(error)
            }
        }
    }
}
```

## Task Cancellation

The .task modifier cancels the running task when the view disappears. The .task(id:) modifier also cancels it when the identity value changes, before it starts the next one. Put any debounce inside that task, not in a Combine pipeline:

```swift
struct SearchView: View {
    @Environment(APIService.self) private var api
    @State private var query = ""
    @State private var state: LoadingState<[SearchResult]> = .idle

    var body: some View {
        ResultsView(state: state)
            .searchable(text: $query)
            .task(id: query) {  // cancelled when query changes or the view disappears
                guard !query.isEmpty else {
                    state = .idle  // clear the previous query's results
                    return
                }
                state = .loading
                do {
                    try await Task.sleep(for: .milliseconds(300))  // debounce
                    let results = try await api.search(query)
                    guard !Task.isCancelled else { return }
                    state = .loaded(results)
                } catch is CancellationError {
                    return  // a newer query owns the state now
                } catch {
                    guard !Task.isCancelled else { return }
                    state = .failed(error)
                }
            }
    }
}
```

Rules this example applies:

- Clear the previous input's result before the first await, unless the product wants stale-while-refresh. If it does, keep the result together with the input that produced it. Label it in the UI as the result for that input.
- Check `Task.isCancelled` before you publish a result or an error. A cancelled URLSession request throws `URLError.cancelled`, not `CancellationError`, so the cancellation check on the error path is necessary.
- Treat cancellation as a non-error outcome. Show no error for work that a newer input or a dismissal replaced.

## User-Triggered Work

The .task modifiers cover work driven by the view's lifetime or its inputs. Work that a button starts needs a named owner instead:

```swift
enum SaveStatus {
    case idle
    case saving
    case saved
    case failed(String)
}

struct ProfileEditor: View {
    @Environment(ProfileService.self) private var service
    @State private var draft = ProfileDraft()
    @State private var status: SaveStatus = .idle
    @State private var saveTask: Task<Void, Never>?

    var body: some View {
        Form {
            TextField("Name", text: $draft.name)
        }
        .toolbar {
            Button("Save") { save() }
        }
        .onDisappear { saveTask?.cancel() }
    }

    private func save() {
        saveTask?.cancel()  // the newer save supersedes the older one
        status = .saving    // set by the caller, so a cancelled task cannot set it later
        saveTask = Task { @MainActor in
            do {
                try await service.save(draft)
                guard !Task.isCancelled else { return }
                status = .saved
            } catch {
                guard !Task.isCancelled else { return }  // superseded: stay silent
                status = .failed(error.localizedDescription)
            }
        }
    }
}
```

Cancellation is cooperative: a cancelled task keeps running until it checks. Therefore check `Task.isCancelled` immediately before every write to view state that follows an await. Set the state that belongs to the newest start, such as `.saving` above, from the caller instead of from inside the task.

Choose one policy for repeated starts and state it:

- Supersede, as above. Cancel the running task before you start the next. Let only the newest task write the status.
- Single flight: block a second start while one runs. Disable the button with a computed `isSaving` value, and start no task while it is true.

Decide what an in-flight task does when the view disappears. Cancel it from the view, as above. Otherwise move the work to an `@Observable` service that outlives the view, and report the result there. Never leave an unowned `Task` writing to a view that is gone.

## Refreshable Pattern

Use .refreshable for pull-to-refresh. A pull-to-refresh can start while the initial load still runs. Give both entry points one owned task. Cancel the previous request before you start the next one. Let the refresh handler await that task, so the spinner ends with the request.

```swift
struct ContentView: View {
    @State private var items: [Item] = []
    @State private var loadTask: Task<Void, Never>?

    var body: some View {
        List(items) { item in
            Text(item.name)
        }
        .refreshable { await load() }
        .task { await load() }
        .onDisappear { loadTask?.cancel() }
    }

    private func load() async {
        loadTask?.cancel()  // the newer request supersedes the older one
        let task = Task { @MainActor in
            do {
                let loaded = try await API.fetchItems()
                guard !Task.isCancelled else { return }
                items = loaded
            } catch {
                // handle the error
            }
        }
        loadTask = task
        await task.value  // the refresh spinner waits for this request
    }
}
```

## Cached-Then-Refreshed Data

Show cached data at once. Refresh inside the same structured task, so the refresh is cancelled with the view:

```swift
struct ContentView: View {
    @State private var items: [Item] = []

    var body: some View {
        List(items) { item in
            Text(item.name)
        }
        .task {
            items = DataCache.shared.getCachedItems()  // UI fills immediately
            do {
                let loaded = try await API.fetchItems()
                guard !Task.isCancelled else { return }
                items = loaded
                DataCache.shared.cache(loaded)
            } catch {
                // keep the cached items
            }
        }
    }
}
```

## Error Handling Pattern

Handle errors with clear user feedback, and send a retry back through the same structured path:

```swift
struct ContentView: View {
    @State private var items: [Item] = []
    @State private var errorMessage: String?
    @State private var showError = false
    @State private var attempt = 0

    var body: some View {
        List(items) { item in
            Text(item.name)
        }
        .alert("Error", isPresented: $showError) {
            Button("Retry") {
                attempt += 1  // re-runs the .task below
            }
            Button("Cancel", role: .cancel) { }
        } message: {
            Text(errorMessage ?? "Unknown error")
        }
        .task(id: attempt) {
            await loadItems()
        }
    }

    private func loadItems() async {
        do {
            let loaded = try await API.fetchItems()
            guard !Task.isCancelled else { return }
            items = loaded
            errorMessage = nil
        } catch {
            guard !Task.isCancelled else { return }  // a retry or a dismissal replaced this load
            errorMessage = error.localizedDescription
            showError = true
        }
    }
}
```
