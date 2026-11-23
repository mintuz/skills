---
name: app-intent-driven-development
description: WHEN designing or debugging App Intent-first iOS features for Siri, Shortcuts, widgets, Live Activities, or reuse of an existing intent in SwiftUI; NOT for actions with no system surface; provides AppEntity, metadata, prompting, and view-reuse patterns.
---

# App Intent-First Driven Development

Design features with a system surface as App Intents first, then reuse those intents across Siri, Shortcuts, widgets, Controls, and SwiftUI views so automation and UI share one action path.

This skill covers evergreen App Intents architecture and best practices. For iOS 26 / iOS 27 additions (`SnippetIntent`, Visual Intelligence `IntentValueQuery`, `IndexedEntityQuery`, `RelevantEntities`, `SyncableEntity`/`EntityOwnership`, `LongRunningIntent`, `SystemShortcut`, `AppIntentsTesting`, `@ComputedProperty`/`@DeferredProperty`), use `app-intents-whats-new-27`. For iOS 27.3 Siri model integration (`@AppIntent(.tool)`, `@AppEntity(.generable)`, `Skills.skillsbundle`), use `siri-app-integration` and `siri-evaluations`.

## Guardrails

- **Public API only:** Never recommend or emit non-public or underscore-prefixed symbols. State plainly if a capability is only reachable via non-public API.
- **Ground every symbol:** Emit only types, initialisers, and parameters that exist in current public App Intents API.
- **Treat identifiers, raw values, URLs, and phrases as public contracts:** Saved shortcuts and donations replay an intent by its **type name**, carrying `AppEntity.id` values and `AppEnum` string raw values. Renaming, removing, or renumbering any of those (or changing a `URLRepresentable*` path) breaks saved shortcuts and donations. `AppShortcut` **phrases** are a separate contract for spoken Siri invocation and Spotlight display: renaming or removing a phrase breaks voice triggers. Adding is safe; breaking edits must be flagged explicitly and never performed silently.
- **Large-codebase review:** Scan the project to identify discrete areas (intents, entities, queries, `AppShortcutsProvider`), propose reviewing one area at a time with choices, or break a whole-codebase review into sections with a checklist.

## References

Read a reference when its topic is in play:

- `references/queries-and-entities.md`: `EntityIdentifierConvertible` (`<= 4096` chars), `@Property` visibility, `EntityStringQuery`, `EnumerableEntityQuery`, and `EntityPropertyQuery` (`QueryProperties`, `SortingOptions`, comparators, manual filter/sort/limit execution).
- `references/enums-parameters-and-summaries.md`: `AppEnum` string-persisted raw values and `caseDisplayRepresentations` `fatalError`, `@IntentParameterDependency`, `ParameterSummary` DSL (`When`, operator enums, `Switch`/`Case`/`DefaultCase`, `%` auto-escaping), and factoring (`AppEnum` vs `AppEntity` vs plain `@Parameter`).
- `references/execution-dependencies-and-errors.md`: Nonisolated `perform()`, retry/idempotency around `needsValueError`/`AppIntentError.restartPerform`, `requestConfirmation`, `@Dependency` (`AppDependencyManager.shared` in `App.init()`, placement restrictions, `Sendable`), and thrown `CustomLocalizedStringResourceConvertible` / `AppIntentError` errors.
- `references/shortcuts-donation-and-localization.md`: `AppShortcut` phrases (`INAlternativeAppNames`, `Bool.IntentDisplayName`, 10-shortcut / ~1,000-phrase caps, `AppShortcuts.xcstrings`), `IntentDonationManager`, `PredictableIntent`, and source-literal localization (`TypeDisplayRepresentation.numericFormat`).
- `references/url-representation-and-opening.md`: `OpenIntent`, `OpenURLIntent` (`.result(opensIntent:)` / `OpensIntent`), and `URLRepresentableIntent` / `URLRepresentableEntity` / `URLRepresentableEnum` (`applinks:` universal links).
- `references/configuration-intents.md`: Parameter-only `WidgetConfigurationIntent` and `ControlConfigurationIntent` (no `perform()`), and `SetValueIntent` for Control toggles.

## Scope Check

An action earns an App Intent when it needs a system surface, e.g. Siri, Shortcuts, App Shortcuts, Spotlight, widgets, Controls, the Action button, Focus filters, or Live Activities (an open set).

- The UI framework does not decide: a UIKit app can adopt App Intents, and a SwiftUI app can hold actions that stay inside one screen. A refusal is a product/security decision about surfaces, not a limit of the UI framework.
- Keep an action with no system surface in the shared domain service the screen already calls; do not add an intent for consistency alone (`principle-foundational-thinking`).
- An unused intent still costs: wider discoverability in system surfaces, App Intents metadata and Shortcuts cache upkeep, and system-facing verification with no user benefit.
- When a system surface becomes a requirement, extract the intent around the same unchanged service.
- A scope decision is a deliverable: record the missing surface, the cost the refusal avoids, and the condition that reverses the decision.

## Core Ideas

- **Entities first:** Model runtime domain records users select or inspect as flat `AppEntity` snapshots; use `AppEnum` only for compile-time fixed sets and plain `@Parameter` (`String`, `Int`, `Bool`, `Date`, `Measurement`) for free-form values.
- **Intent-first feature:** Build the App Intent + entity/query path before UI; SwiftUI screens call the same action path instead of duplicating service code (`principle-reuse-before-building`).
- **One verb per intent:** Keep intents focused on one user verb; do not multiplex unrelated verbs (for example create vs delete) into a mega-intent.
- **Flat entity graph:** Keep entities as serialisable snapshots (stable IDs, primitive fields, display strings, icons); avoid nesting one `AppEntity` inside another unless the system needs the relationship.
- **Context-scoped choices:** Derive dependent options from the active run/profile rather than exposing global history.
- **Reuse business logic:** Intents delegate to shared domain services; never fork domain mutations in a view or intent.
- **Metadata is behaviour:** App Intents metadata and Shortcuts caches are part of the feature; verify them after every parameter or entity change.

## Minimal Entity Blueprint

```swift
import AppIntents

struct TaskEntity: AppEntity, Identifiable {
    let id: UUID

    @Property(title: "Title")
    var title: String

    @Property(title: "Complete")
    var isComplete: Bool

    init(id: UUID, title: String, isComplete: Bool) {
        self.id = id
        self.title = title
        self.isComplete = isComplete
    }

    nonisolated static var typeDisplayRepresentation: TypeDisplayRepresentation {
        "Task"
    }

    nonisolated static var defaultQuery: TaskQuery {
        TaskQuery()
    }

    var displayRepresentation: DisplayRepresentation {
        DisplayRepresentation(
            title: "\(title)",
            subtitle: isComplete ? "Completed" : "Open",
            image: .init(systemName: isComplete ? "checkmark.circle.fill" : "circle")
        )
    }
}

struct TaskQuery: EntityQuery {
    @Dependency private var store: TaskStore

    func entities(for identifiers: [TaskEntity.ID]) async throws -> [TaskEntity] {
        try await store.fetch(ids: identifiers) // single batched fetch; omit missing IDs
    }

    func suggestedEntities() async throws -> [TaskEntity] {
        try await store.fetchRecent(limit: 20)
    }
}
```

## Entity, Enum, and Query Rules

- **Boundary type:** Treat `AppEntity` as a system boundary, not a persistence object. Resolve the entity's stable `id` in the live `ModelContext` or store when mutating (`principle-hide-representations`).
- **Stable cross-device `id`:** Never derive `id` from an array index, row position, display name, or device-local identifier (such as Photos `localIdentifier` or local DB row IDs). Custom `EntityIdentifierConvertible` strings must be `<= 4096` characters.
- **`@Property` visibility:** Only `@Property`-wrapped members on `AppEntity` are visible to Find intents, `EntityPropertyQuery`, and parameter display. Plain stored properties are invisible to the system (valid only for internal `displayRepresentation` inputs).
- **Batched `entities(for:)` and missing IDs:** Fetch `[ID]` in one batch (no N+1 loop). Return only records that still exist; omit unresolved identifiers without substituting a nearby record and without throwing. The system then treats the value as unavailable, so the intent reports the missing item or prompts for a new choice instead of mutating another record (`principle-parse-at-the-boundary`).
- **`suggestedEntities()` default trap:** `EntityQuery.suggestedEntities()` defaults to `[]`, which yields an empty parameter picker. Implement a fast, bounded, context-scoped `suggestedEntities()`.
- **Query types (`references/queries-and-entities.md`):** Use `EntityStringQuery` for search (no automatic framework filtering), `EnumerableEntityQuery` only for small bounded catalogues, and `EntityPropertyQuery` for large stores (your query must apply `comparators`, `mode`, `sortedBy`, and `limit` itself).
- **`AppEnum` contracts (`references/enums-parameters-and-summaries.md`):** Assign explicit stable raw values (prefer `String`, never rely on implicit `Int` raw values or renumber/reorder shipped values — raw values are persisted by string). Give every case an entry in `caseDisplayRepresentations` (a missing entry compiles cleanly and traps with `fatalError` at runtime).

## Intent Execution, Dependencies, Parameters, and Errors

```swift
import AppIntents

struct CompleteTaskIntent: AppIntent {
    nonisolated static let title: LocalizedStringResource = "Complete Task"
    nonisolated static let description = IntentDescription("Marks a task as done and returns the updated item.")
    nonisolated static var supportedModes: IntentModes { .foreground }

    @Parameter(title: "Task", requestValueDialog: "Which task should I complete?")
    var task: TaskEntity

    @Dependency private var store: TaskStore

    init(task: TaskEntity) { self.task = task }
    init() {}

    func perform() async throws -> some IntentResult & ReturnsValue<TaskEntity> & ProvidesDialog {
        let updated = try await store.complete(task.id)
        return .result(value: updated, dialog: "Completed \(updated.title).")
    }

    nonisolated static var parameterSummary: some ParameterSummary {
        Summary("Complete \(\.$task)")
    }
}
```

- **Actor isolation (`references/execution-dependencies-and-errors.md`):** `AppIntent` is `Sendable`, not `@MainActor`. Never annotate the `AppIntent` struct `@MainActor` (causes Swift 6 `#ConformanceIsolation` errors on nonisolated static requirements). Keep `perform()` nonisolated and hop with `await MainActor.run { }` (or mark only `perform()` `@MainActor` when the body is entirely main-actor work). Mark static metadata `nonisolated` only if default actor isolation is MainActor.
- **Retriable execution without rollback:** `throw $param.needsValueError(_:)` and `AppIntentError.restartPerform` abort and restart `perform()` from the top with **no rollback**. Resolve and validate every parameter before irreversible work, put destructive or irreversible side effects last (or make them idempotent), and never catch and swallow flow-control errors.
- **Confirmation:** Call `try await requestConfirmation(...)` immediately before destructive work. Never wrap `requestConfirmation` in `try?` or catch cancellation (doing so treats Cancel as Confirm).
- **`@Dependency` rules (`references/execution-dependencies-and-errors.md`):**
  - Register dependencies in `App.init()` (or extension startup) via `AppDependencyManager.shared.add(dependency:)`, never in `.onAppear` or view lifecycle (unregistered `@Dependency` crashes with `fatalError` on cold Siri/extension launch).
  - Use `@Dependency` only on `AppIntent`, `EntityQuery`, and `DynamicOptionsProvider` — **never** on `AppEntity` or `AppEnum` (compiles but is unprepared at runtime).
  - Dependency values must conform to `Sendable` (for example `@MainActor @Observable final class` or `actor`; a plain `@Observable final class` is not `Sendable`).
- **Parameters and prompting (`references/enums-parameters-and-summaries.md`):**
  - Make required inputs non-optional with `requestValueDialog` (never substitute a guessed or remembered default). For non-optional `AppEnum`, the system auto-disambiguates with `requestDisambiguationDialog` when `> 1` option exists and silently auto-assigns when `== 1` option exists.
  - For optional parameters, call `try await $param.requestValue(_:)` (inline, no restart), `try await $param.requestDisambiguation(among:dialog:)`, or `throw $param.needsValueError(_:)` (restarts `perform()`), or explicitly define the `nil` behaviour. Avoid the deprecated synchronous `requestValue(_:) -> Error` overload.
  - Widgets and Controls construct the same intent with every required value pre-filled (they cannot show prompts); do not create a duplicate intent for pre-filled callers.
  - `ParameterSummary` is the Shortcuts editor allowlist and field-order source; use `When` or `Switch`/`Case`/`DefaultCase` for edit-time conditional visibility.
- **Results, dialogs, and thrown errors:**
  - Always return via `.result(...)` factories (`OpensIntent`, not deprecated `OpensAppIntent`). Return entities while the metadata graph stays simple; a dialog-only `.result(dialog:)` is acceptable when returned entities complicate mutation metadata.
  - Use `ProvidesDialog` for expected user-facing conflicts (such as "already completed") and normal success messages.
  - For thrown failures that must display a real message in Siri/Shortcuts, conform domain errors to `CustomLocalizedStringResourceConvertible` (iOS 16+) or throw prebuilt `AppIntentError.PermissionRequired` / `UserActionRequired` / `Unrecoverable` (iOS 18+, avoiding deprecated `.unknown`). Plain `Error` and `LocalizedError` are sanitised to a generic failure.
- **Execution modes:** Declare `supportedModes` (`.background`, `.foreground`, or `.foreground(.dynamic)` with `continueInForeground(_:alwaysConfirm:)` / `needsToContinueInForegroundError(_:alwaysConfirm:)`). Adopt `LiveActivityIntent` for Live Activity updates without opening the app. `openAppWhenRun` is deprecated from iOS 26 (keep only for earlier deployment targets).

## Conditional Prompts

Use `DynamicOptionsProvider` with `@IntentParameterDependency` for editor dropdowns and `requestDisambiguation` at runtime when a dependent parameter is required only for a specific choice:

```swift
@Parameter(title: "Resolution")
var resolution: StopResolution

@Parameter(title: "Benchmark Lap")
var benchmarkLap: BenchmarkLapEntity?

@MainActor
func perform() async throws -> some IntentResult & ProvidesDialog {
    let run = try BenchmarkIntentStore.resolvedRun()

    switch resolution {
    case .saveAsBenchmark:
        let lap = try await selectedBenchmarkLap(for: run)
        try SaveDecisionModule.saveAsBenchmark(run: run, lapID: lap.id)
        return .result(dialog: "Saved benchmark.")
    case .saveRun:
        try SaveDecisionModule.keepInHistory(run: run)
        return .result(dialog: "Saved run.")
    case .discardRun:
        try SaveDecisionModule.discard(run: run)
        return .result(dialog: "Discarded run.")
    }
}

@MainActor
private func selectedBenchmarkLap(for run: BenchmarkRun) async throws -> BenchmarkLapEntity {
    let candidates = try SaveDecisionModule.snapshot(for: run)
        .candidates
        .map(BenchmarkLapEntity.init)

    if let benchmarkLap,
       let current = candidates.first(where: { $0.id == benchmarkLap.id }) {
        return current
    }

    return try await $benchmarkLap.requestDisambiguation(
        among: candidates,
        dialog: "Which lap should be saved as the benchmark?"
    )
}
```

- Always guard the optional `@IntentParameterDependency` projection (`guard let dep else { return [] }`) and never read a key path not declared in `@IntentParameterDependency(...)` (runtime `fatalError`).
- At runtime, rebuild the scoped candidates from the active run/profile and accept a supplied token only if its `id` is still in that set; otherwise disambiguate again before mutating.

## Reusing Intents in SwiftUI

- Prefer invoking the intent from UI so automation and in-app flows share one path.
- Use `Button(intent:)` or `Toggle(isOn:intent:)` for direct, fire-and-forget actions where the system owns execution.
- When the view must show in-flight progress, an error alert, or navigate to a live model afterwards, invoke the intent via `callAsFunction(donate:)` inside your own `Button`. Hold the `Task` in `@State` (single in-flight, cancel on `.onDisappear`, ignore cancellation errors; `principle-narrow-state-lifetime`).
- Resolve returned stable IDs in the view's live `ModelContext` before navigation; do not copy entity fields into SwiftData models.
- Return the app's own SwiftUI view as a snippet via `.result(value:view:)` (`ShowsSnippetView`) from a target/module shared by the app and intent. Pass resolved values directly (remove `@Environment` app objects and `ModelContext` fetches, because snippets render outside the app hierarchy). Keep returning the value alongside the snippet so downstream Shortcuts actions still receive it. `.result(value:view:)` snippets are static; interactive snippets require `SnippetIntent` on iOS 26+.

## Shortcuts Provider, Donation, and Localization

```swift
import AppIntents

struct TimelineShortcuts: AppShortcutsProvider {
    @AppShortcutsBuilder
    nonisolated static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: CompleteTaskIntent(),
            phrases: ["Complete task in \(.applicationName)"],
            shortTitle: "Complete Task",
            systemImageName: "checkmark.circle.fill"
        )
    }

    nonisolated static var shortcutTileColor: ShortcutTileColor { .blue }
}
```

- Always supply `shortTitle` and a compile-time string literal `systemImageName` (omitting them uses the deprecated iOS 17 initialiser). Include `\(.applicationName)` in every phrase or the runtime index silently drops it.
- Stay within the hard build-time cap of **10 `AppShortcut`s per app** and **~1,000 expanded phrases per locale**.
- Call `TimelineShortcuts.updateAppShortcutParameters()` at app launch and whenever dynamic option data changes (unnecessary for compile-time-fixed `AppEnum` phrases).
- **Donation (`references/shortcuts-donation-and-localization.md`):** Direct in-app actions are not auto-donated — call `IntentDonationManager.shared.donate(intent:)` (or `donate(intent:result:)`) after the in-app action succeeds, and delete stale donations when data is deleted. **Never donate inside `perform()`** (system runs are already donated; donating there double-counts). `PredictableIntent` supplies suggestion descriptions, not donations.
- **Localization:** Use compile-time string literals for `LocalizedStringResource`, `IntentDialog`, titles, and `AppShortcut` phrases so Xcode extracts keys (`AppShortcuts.xcstrings` for phrases). Interpolate proper nouns (`DisplayRepresentation(title: "\(title)")`) and counts into literal templates.

## Configuration and URL Intents

- **Widgets and Controls (`references/configuration-intents.md`):** `WidgetConfigurationIntent` (iOS 17+) and `ControlConfigurationIntent` (iOS 18+) are parameter-only schemas; do **not** implement `perform()` to load widget data (WidgetKit passes resolved parameters to `TimelineProvider` without calling `perform()`). Use `SetValueIntent` for Control toggle actions.
- **Opening and Universal Links (`references/url-representation-and-opening.md`):** Use `OpenIntent` (or `OpenURLIntent` returned via `.result(opensIntent:)` — never `UIApplication.shared.open(_:)` inside `perform()`). Use `URLRepresentableIntent`/`Entity`/`Enum` for `applinks:` universal links only (leave `perform()` unimplemented so the protocol handles routing).

## Metadata and Cache Checks

Compilation is not enough; verify system-facing metadata (`principle-prove-it-works`):

- Run `xcodebuild build` for the app target and confirm App Intents metadata extraction succeeds.
- Inspect generated or installed `Metadata.appintents`/`extract.actionsdata` to confirm entities and parameters are present.
- Verify phrase matching in Xcode's **Product > App Shortcuts Preview**.
- Install and launch the rebuilt app on the target simulator/device before testing in Shortcuts, then terminate and reopen Shortcuts if stale metadata persists.
- If Debug builds compile but Shortcuts cannot discover the provider, check `ENABLE_DEBUG_DYLIB = NO`.
- After changing an intent's type name, parameter shape, entity `id` scheme, or `AppEnum` raw values, instruct users to delete and re-add affected Shortcuts actions (saved actions hold old serialised tokens).

## Development Flow

1. Run the Scope Check; keep actions with no system surface in shared services.
2. Choose `AppEnum` (fixed set), `AppEntity` + query (dynamic records), or plain `@Parameter` (free-form).
3. Implement focused intents delegating to `@Dependency`-injected `Sendable` services registered in `App.init()`; validate inputs and confirm before irreversible mutations.
4. Add `DynamicOptionsProvider` + `@IntentParameterDependency` and runtime `requestDisambiguation` for context-scoped choices, plus `ParameterSummary` for editor visibility.
5. Expose phrases via `AppShortcutsProvider`, refresh dynamic parameters on launch and mutation, and donate direct in-app actions (never inside `perform()`).
6. Reuse the intent in SwiftUI via `Button(intent:)` or `callAsFunction(donate:)`, and share snippet views cleanly.
7. Verify build, extracted `Metadata.appintents`, installed simulator/device metadata, App Shortcuts Preview, and Shortcuts cache behaviour.
