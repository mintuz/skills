# Execution Model, `@Dependency`, and Errors

## Nonisolated `perform()` and Extension Process

- `AppIntent` conforms to `Sendable`, not `@MainActor`. `func perform() async throws -> some IntentResult` has no actor isolation and may execute off the main thread or in an app extension even when the intent opens the app.
- **Never annotate the `AppIntent` struct `@MainActor`:** `AppIntent` requirements (`title`, `parameterSummary`, etc.) are nonisolated; `@MainActor` on the type causes Swift 6 `#ConformanceIsolation` errors (`"main actor-isolated static property 'title' cannot satisfy nonisolated requirement"`) and pins construction and parameter resolution to the main actor.
- Hop with `await MainActor.run { }` (or `await` a `@MainActor` service) when `perform()` also does non-UI async work; mark only `perform()` `@MainActor` when the entire body is main-actor work.

## Retriable Execution and `requestConfirmation`

- `throw $param.needsValueError(_:)` and `AppIntentError.restartPerform` abort the current pass and restart `perform()` from the top with **no rollback** of committed mutations.
- Resolve and validate every parameter before irreversible work. Place irreversible side effects last, or guard them with an idempotency key/state check.
- Never catch and swallow `needsValueError(_:)` or `AppIntentError.restartPerform`.
- `try await requestConfirmation(...)` awaits inline, returns normally on confirm, and **throws** on cancel. Place it immediately before destructive work and never wrap it in `try?` or swallow cancellation.
- Availability: `requestConfirmation(conditions:actionName:dialog:)` is iOS 18+; parameterless `requestConfirmation()` is iOS 16+.

## Result Factories

- Always return via `IntentResult.result(...)` factories (`some IntentResult`, `ReturnsValue<Value>`, `ProvidesDialog`, `OpensIntent`, `ShowsSnippetView`). Never return a bare domain struct or name `IntentResultContainer` directly, and declare only the marker protocols actually returned.
- Never use deprecated `OpensAppIntent`; use `OpensIntent`.

## `@Dependency` Registration, Placement, and `Sendable`

- **Register at cold launch:** Call `AppDependencyManager.shared.add(dependency:)` in `App.init()` (or extension startup), never in `.onAppear` or view lifecycle. Reading an unregistered `@Dependency` traps with a non-catchable `fatalError` (`"...was not initialized prior to access"`) on cold Siri/extension launches. Use `@Dependency`'s `default:` overload only when absence is genuinely valid.
- **Allowed types:** `@Dependency` works only on `AppIntent`, `EntityQuery`, and `DynamicOptionsProvider`. Putting `@Dependency` on `AppEntity` or `AppEnum` compiles cleanly but is silently unprepared at runtime (even with `default:`).
- **`Sendable` requirement:** `AppDependency<Value: Sendable>` and `AppDependencyManager.add(...)` require `Sendable`. A plain `@Observable final class` is not `Sendable`; annotate it `@MainActor @Observable final class` or implement it as an `actor`.

```swift
@main
struct NotesApp: App {
    private let store: NoteStore

    init() {
        let store = NoteStore()
        self.store = store
        AppDependencyManager.shared.add(dependency: store)
    }

    var body: some Scene {
        WindowGroup { RootView().environment(store) }
    }
}
```

## Thrown Errors vs `ProvidesDialog`

- Use `ProvidesDialog` for expected user-facing conflicts (such as "already completed") that are not system failures.
- When `perform()` or an `EntityQuery` method must throw a user-visible failure, **do not** throw a bare `Error` or `LocalizedError` (`errorDescription` is sanitised to a generic failure in Siri/Shortcuts).
- Conform domain errors to `CustomLocalizedStringResourceConvertible` (`var localizedStringResource: LocalizedStringResource`, iOS 16+).
- For standard failure categories on iOS 18 / macOS 15+, prefer prebuilt `AppIntentError` types (`AppIntentError.PermissionRequired`, `AppIntentError.UserActionRequired`, `AppIntentError.Unrecoverable`), which conform to `CustomLocalizedStringResourceConvertible` and carry system affordances. Avoid deprecated `AppIntentError.Unrecoverable.unknown`.
