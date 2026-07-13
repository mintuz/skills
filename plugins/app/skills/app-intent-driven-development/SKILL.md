---
name: app-intent-driven-development
description: WHEN designing or debugging App Intent-first iOS features for Siri, Shortcuts, widgets, Live Activities, or SwiftUI reuse; NOT UIKit-only flows; provides AppEntity, metadata, prompting, and view-reuse patterns.
---

# App Intent-First Driven Development

Design features as App Intents first, then reuse those intents across Shortcuts, widgets, and SwiftUI views so automation and UI stay in lockstep.

## Core Ideas

- **Entities first**: model the data users act on (events, categories, records) as `AppEntity` boundary types so intents, widgets, and the app use the same identifiers and display language.
- **Intent-first feature**: build the App Intent + entity/query path before UI; SwiftUI screens call the same action path instead of duplicating service code.
- **Single action, single intent**: keep intents focused; avoid mega-intents that are hard to compose in Shortcuts.
- **Flat entity graph**: keep entities as serializable snapshots: ids, primitive fields, display strings, and icons. Avoid nesting one `AppEntity` inside another.
- **Context-scoped choices**: when an enum or selected run/profile determines valid values, build those choices from that context; never let Shortcuts offer every historical record by accident.
- **Predictable UI**: supply `DisplayRepresentation`, `typeDisplayRepresentation`, dialogs, and icons so Siri/Shortcuts can render useful cards without guessing.
- **Fast queries**: `EntityQuery` must be quick and cancellable; keep expensive SwiftData or network work out of global suggestions.
- **Reuse business logic**: intents call the same services your views use; do not fork logic inside the intent.
- **Metadata is behavior**: App Intents metadata and Shortcuts caches are part of the feature. Validate them after changing parameter or entity shape.

## Minimal Entity Blueprint

```swift
import AppIntents

struct TaskEntity: AppEntity, Identifiable {
    let id: UUID
    let title: String
    let isComplete: Bool

    nonisolated static var typeDisplayRepresentation: TypeDisplayRepresentation {
        "Task"
    }

    nonisolated static var defaultQuery: TaskQuery {
        TaskQuery()
    }

    var displayRepresentation: DisplayRepresentation {
        DisplayRepresentation(
            title: title,
            subtitle: isComplete ? "Completed" : "Open",
            image: .init(systemName: isComplete ? "checkmark.circle.fill" : "circle")
        )
    }
}

struct TaskQuery: EntityQuery {
    @MainActor
    func entities(for identifiers: [TaskEntity.ID]) async throws -> [TaskEntity] {
        try await TaskStore.shared.fetch(ids: identifiers) // fast path
    }

    @MainActor
    func suggestedEntities() async throws -> [TaskEntity] {
        try await TaskStore.shared.fetchRecent()
    }
}
```

**Key points:** stable identifier, meaningful representation, flat stored properties, and fast queries that avoid launching heavy app flows.

## Entity Design Rules

- Treat `AppEntity` as a Shortcuts/system boundary, not as the real model object. If the app needs a SwiftData model, resolve the entity by stable `id` in the current `ModelContext`.
- Store only primitive values, dates, ids, and display strings on entities. If an entity needs to refer to another model, store `profileID` and `profileName`, not `profile: ProfileEntity`.
- Start with plain `EntityQuery`. Add `EntityStringQuery` only when search is required and verify generated metadata after adding it.
- Keep `suggestedEntities()` conservative. For child values such as laps/results, prefer active-run/current-profile suggestions over global history.
- Entity IDs do not have to be UUIDs. Use a `String` id when the selectable thing can be a domain candidate that is not persisted yet, such as a `"final"` lap.
- Keep entity display independent of app-only formatting state. Shortcuts may render it without your SwiftUI environment.

## Intent Pattern

```swift
import AppIntents

struct CompleteTaskIntent: AppIntent {
    nonisolated static let title: LocalizedStringResource = "Complete Task"
    nonisolated static let description = IntentDescription("Marks a task as done and returns the updated item.")
    nonisolated static let openAppWhenRun = true

    @Parameter(title: "Task", requestValueDialog: "Which task should I complete?")
    var task: TaskEntity

    init(task: TaskEntity) { self.task = task }
    init() {}

    @MainActor
    func perform() async throws -> some IntentResult & ReturnsValue<TaskEntity> & ProvidesDialog {
        let updated = try await TaskStore.shared.complete(task.id)
        return .result(value: updated, dialog: "Completed \(updated.title).")
    }

    nonisolated static var parameterSummary: some ParameterSummary {
        Summary("Complete \(\.$task)")
    }
}
```

- **Parameters**: keep them few; provide `requestValueDialog` to make Siri prompts natural.
- **Results**: return entities when the system should render the updated object. For mutation intents where return entities cause metadata complexity, a dialog-only `.result()` is acceptable.
- **Dialogs**: use `ProvidesDialog` for expected conflicts and success states. Prefer a helpful dialog over throwing for normal user-facing conditions such as "already running".
- **Isolation**: mark `perform()` or helpers `@MainActor` when touching SwiftData contexts, app settings, Live Activities, or UI-bound services. Mark static metadata `nonisolated` when Swift 6 isolation complains.

## Conditional Prompts

Use `requestDisambiguation` when a later choice is required only after another parameter has a specific value.

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
    if let benchmarkLap {
        return benchmarkLap
    }

    let candidates = try SaveDecisionModule.snapshot(for: run)
        .candidates
        .map(BenchmarkLapEntity.init)

    return try await $benchmarkLap.requestDisambiguation(
        among: candidates,
        dialog: "Which lap should be saved as the benchmark?"
    )
}
```

- Build disambiguation candidates after resolving the current run/profile. Do not rely on a global entity query for context-sensitive choices.
- If the Shortcuts editor should show a dropdown, use `DynamicOptionsProvider` with `@IntentParameterDependency` on the parameters that define the context. Still keep runtime disambiguation as the final guard.
- Keep the entity identifier aligned with the domain candidate identifier so selected values map back to the save/resolve module without guessing.
- Do not assume `requestValue` on an optional parameter will produce the desired editor or runtime behavior. Use `requestDisambiguation` when there are scoped candidates to choose from.

## Reusing Intents in SwiftUI

- Prefer calling intents from UI so automation and in-app flows share one path.
- Use `AppIntentButton` for direct, fire-and-forget actions.
- Use `intentExecutor.perform(...)` when the view needs progress/error handling.
- Translate entity selections into view state by stable id. Do not copy entity fields into a SwiftData model object.

```swift
import AppIntents
import SwiftUI

struct EventRow: View {
    let event: EventEntity

    var body: some View {
        HStack {
            Text(event.name)
            Spacer()
            AppIntentButton(intent: UndoLastEventOccuranceIntent(event: event)) {
                Label("Undo", systemImage: "arrow.uturn.backward")
            }
        }
    }
}
```

- For more control, invoke intents imperatively with the app intent executor:

```swift
import AppIntents
import SwiftUI

struct EventRow: View {
    @Environment(\.intentExecutor) private var executor
    @State private var isWorking = false
    @State private var error: Error?

    let event: EventEntity

    var body: some View {
        HStack {
            Text(event.name)
            Spacer()
            Button {
                Task {
                    isWorking = true
                    defer { isWorking = false }
                    do {
                        try await executor.perform(UndoLastEventOccuranceIntent(event: event))
                    } catch {
                        self.error = error
                    }
                }
            } label: {
                if isWorking {
                    ProgressView()
                } else {
                    Label("Undo", systemImage: "arrow.uturn.backward")
                }
            }
        }
        .alert("Undo failed", isPresented: .init(
            get: { error != nil },
            set: { if !$0 { error = nil } }
        )) {
            Button("OK", role: .cancel) { error = nil }
        } message: {
            Text(error?.localizedDescription ?? "Unknown error")
        }
    }
}
```

- Keep the intent signature identical between Shortcuts and SwiftUI usage.
- Avoid reimplementing service calls in views; route through the intent to keep analytics, validation, and side effects consistent.
- If a view needs to navigate to a live SwiftData model after an intent returns, resolve the returned entity `id` in the view's `ModelContext`. If opaque `perform()` result typing makes that awkward, choose explicitly between `AppIntentButton`, `intentExecutor`, or a shared domain service used by both the intent and view. Do not create a second hidden implementation path.

## Shortcuts Provider

Expose user-facing actions with `AppShortcutsProvider` and keep metadata refresh in mind for dynamic entities.

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

    nonisolated static var shortcutTileColor: ShortcutTileColor {
        .blue
    }
}
```

- Call `TimelineShortcuts.updateAppShortcutParameters()` at app launch when shortcuts depend on dynamic app data.
- Set `openAppWhenRun = true` for mutations that need the app process, app state, Live Activities, or foreground continuation.
- When changing an intent parameter type or entity graph, tell the user to delete and re-add existing Shortcuts actions. Existing actions can hold stale serialized entity tokens.

## Metadata And Cache Checks

Always verify the system-facing metadata, not just Swift compilation.

- Run an `xcodebuild build` for the app target and confirm App Intents metadata extraction succeeds.
- Inspect generated or installed `Metadata.appintents`/`extract.actionsdata` when Shortcuts says an entity is missing. The entity should appear under `entities`, and the parameter should point at that entity type.
- Install and launch the rebuilt app on the target simulator/device before testing in Shortcuts. Then terminate/reopen Shortcuts if it is holding stale metadata.
- If simulator Debug builds compile but Shortcuts cannot discover the provider, check build settings such as `ENABLE_DEBUG_DYLIB = NO`.
- Treat Shortcuts cache issues as real debugging state. After changing parameter shapes, recreate the action in Shortcuts before judging the code path.

## Development Flow

1. Inventory the user actions in SwiftUI views and decide which ones should become system actions.
2. Model action inputs/outputs as flat `AppEntity` snapshots with display representations and scoped queries.
3. Implement focused `AppIntent`s that call shared domain services or modules; keep expected conflicts in dialogs.
4. Add context-aware prompting with `requestDisambiguation` for conditional choices.
5. Expose shortcuts through `AppShortcutsProvider` and refresh dynamic parameters at launch.
6. Reuse the same action path in SwiftUI via `AppIntentButton`, `intentExecutor`, or deliberate shared services.
7. Validate build, App Intents metadata, installed simulator/device metadata, and Shortcuts cache behavior.
8. Localize strings early (`LocalizedStringResource`) to keep Siri responses natural in all supported languages.

## Quick Checklist

- [ ] Entity has stable `id`, `typeDisplayRepresentation`, rich `displayRepresentation`, and flat stored properties.
- [ ] Child/contextual entity suggestions are scoped to the current run/profile, not global history.
- [ ] Queries are fast, cancellable, and start as plain `EntityQuery` unless search is required.
- [ ] Intent reuses shared domain services; no duplicated business logic.
- [ ] Parameters are minimal and phrased with `requestValueDialog` where helpful.
- [ ] Conditional choices use `requestDisambiguation` with context-built candidates.
- [ ] Results return entities only when the metadata graph stays simple and useful.
- [ ] `AppShortcutsProvider` is registered; dynamic parameters refresh on launch when needed.
- [ ] Build output confirms App Intents metadata extraction.
- [ ] Installed metadata and Shortcuts cache are checked after changing entity/parameter shapes.
- [ ] Strings are localized; tests or builds cover query and perform paths.
