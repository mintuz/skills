---
name: app-intent-driven-development
description: WHEN designing or debugging App Intent-first iOS features for Siri, Shortcuts, widgets, Live Activities, or reuse of an existing intent in SwiftUI; NOT for actions with no system surface; provides AppEntity, metadata, prompting, and view-reuse patterns.
---

# App Intent-First Driven Development

Design features as App Intents first, then reuse those intents across Shortcuts, widgets, and SwiftUI views so automation and UI stay in lockstep.

## Scope Check

An action earns an App Intent when it needs a system surface, e.g. Siri, Shortcuts, App Shortcuts, Spotlight, widgets, Controls, the Action button, Focus filters, Live Activities (an open set).

- The UI framework does not decide: a UIKit app can adopt App Intents, and a SwiftUI app can hold actions that stay inside one screen. A refusal is a product decision about surfaces, not a limit of the UI framework.
- Keep an action with no system surface in the shared domain service the screen already calls; do not add an intent for consistency alone (`principle-foundational-thinking`).
- An unused intent still costs: wider discoverability in system surfaces, App Intents metadata and Shortcuts cache upkeep, and system-facing verification with no user benefit.
- When a system surface becomes a requirement, extract the intent around the same, unchanged service.
- A scope decision is a deliverable: record the missing surface, the cost the refusal avoids, and the condition that reverses the decision.

## Core Ideas

- **Entities first**: model the data users act on (events, categories, records) as `AppEntity` boundary types so intents, widgets, and the app use the same identifiers and display language.
- **Intent-first feature**: build the App Intent + entity/query path before UI; SwiftUI screens call the same action path instead of duplicating service code (`principle-reuse-before-building`).
- **Single action, single intent**: keep intents focused; avoid mega-intents, which are hard to compose in Shortcuts.
- **Flat entity graph**: keep entities as serializable snapshots (ids, primitive fields, display strings, icons); avoid nesting one `AppEntity` inside another.
- **Context-scoped choices**: when an enum or selected run/profile determines valid values, build those choices from that context; never let Shortcuts offer every historical record by accident.
- **Predictable UI**: supply `DisplayRepresentation`, `typeDisplayRepresentation`, dialogs, and icons so Siri/Shortcuts can render useful cards without guessing.
- **Fast queries**: `EntityQuery` must be quick and cancellable; keep expensive SwiftData or network work out of global suggestions.
- **Reuse business logic**: intents call the same services your views use; do not fork logic inside the intent.
- **Metadata is behaviour**: App Intents metadata and Shortcuts caches are part of the feature; validate them after changing parameter or entity shape.

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

## Entity Design Rules

- Treat `AppEntity` as a Shortcuts/system boundary, not the real model object. When the app needs a SwiftData model, resolve the entity by stable `id` in the current `ModelContext` (`principle-hide-representations`).
- Prefer primitive values, dates, ids, and display strings on entities; use an entity-typed property only when the system needs that relationship. To refer to another model, store `profileID` and `profileName`, not `profile: ProfileEntity`.
- Start with plain `EntityQuery`. Add `EntityStringQuery` only when search is required, then verify generated metadata.
- Keep `suggestedEntities()` conservative: for child values such as laps/results, prefer active-run/current-profile suggestions over global history.
- Entity IDs need not be UUIDs. Use a `String` id when the selectable thing can be a not-yet-persisted domain candidate, such as a `"final"` lap.
- Use an identifier stable across launches and never reused for a different record. Never derive it from an array index, row position, or display name: a saved shortcut stores the identifier and would resolve to whatever record later takes that place.
- From `entities(for:)`, return only records that still exist; omit an identifier you cannot resolve and never substitute a nearby record. The system then treats the value as unavailable, and the intent can report the missing item or prompt again (`principle-parse-at-the-boundary`).
- Keep entity display independent of app-only formatting state; Shortcuts may render it without your SwiftUI environment.

## Intent Pattern

```swift
import AppIntents

struct CompleteTaskIntent: AppIntent {
    nonisolated static let title: LocalizedStringResource = "Complete Task"
    nonisolated static let description = IntentDescription("Marks a task as done and returns the updated item.")
    nonisolated static var supportedModes: IntentModes { .foreground }

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

- **Parameters**: keep them few. Make a value the action cannot work without a required, non-optional parameter with a `requestValueDialog`; the system then asks for it before `perform()` runs.
- **Missing values**: never substitute a guessed or remembered default for a value the user did not supply. An optional parameter is not requested automatically: call `try await $parameter.requestValue(...)` or `$parameter.requestDisambiguation(among:)` inside `perform()`, or throw `$parameter.needsValueError(...)`. Define the behaviour for an optional value that stays nil.
- **Callers that already know a value**: a widget, Control, or view constructs the same intent with that value, so no prompt appears; do not add a second intent for the pre-filled path. A widget or Control cannot show a request-value prompt, so it must supply every value the action needs.
- **Results**: return entities when the system should render the updated object, and only while the metadata graph stays simple and useful. When returned entities cause metadata complexity in a mutation intent, a dialog-only `.result()` is acceptable.
- **Dialogs**: use `ProvidesDialog` for expected conflicts and success states; prefer a helpful dialog over throwing for normal user-facing conditions such as "already running".
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

- Build disambiguation candidates after resolving the current run/profile, not from a global entity query.
- For a Shortcuts editor dropdown, use `DynamicOptionsProvider` with `@IntentParameterDependency` on the parameters that define the context. At runtime, rebuild the scoped candidates and accept a supplied entity only when its id is still in that set; otherwise disambiguate again.
- Align the entity identifier with the domain candidate identifier so selected values map back to the save/resolve module without guessing.
- When there are scoped candidates, use `requestDisambiguation`; `requestValue` on an optional parameter may not produce the desired editor or runtime behaviour.

## Reusing Intents in SwiftUI

- Prefer calling intents from UI so automation and in-app flows share one path.
- Use `Button(intent:)` or `Toggle(isOn:intent:)` (available when importing both `AppIntents` and `SwiftUI`) for direct, fire-and-forget actions; the system runs the intent and owns its result handling.
- That system-run button exposes no progress or errors to the view. When the row must show in-flight state, an error alert, or navigation, call the intent with `callAsFunction(donate:)` inside your own `Button`; do not reimplement the action against the service behind the intent's back.
- Translate entity selections into view state by stable id; do not copy entity fields into a SwiftData model object.

```swift
import AppIntents
import SwiftUI

struct EventRow: View {
    let event: EventEntity

    var body: some View {
        HStack {
            Text(event.name)
            Spacer()
            Button(intent: UndoLastEventOccuranceIntent(event: event)) {
                Label("Undo", systemImage: "arrow.uturn.backward")
            }
        }
    }
}
```

- `callAsFunction(donate:)` resolves parameters, runs `perform()`, and returns the result value, so a row that owns progress and errors keeps the single action path. Hold the `Task` in `@State`: ignore taps while it runs, cancel it when the row disappears, and publish no error after cancellation (`principle-narrow-state-lifetime`):

```swift
import AppIntents
import SwiftUI

struct EventRow: View {
    @State private var undoTask: Task<Void, Never>?
    @State private var error: Error?

    let event: EventEntity

    var body: some View {
        HStack {
            Text(event.name)
            Spacer()
            Button {
                guard undoTask == nil else { return } // one undo in flight
                undoTask = Task {
                    defer { undoTask = nil }
                    do {
                        _ = try await UndoLastEventOccuranceIntent(event: event)()
                    } catch {
                        // Cancellation is not a failure: show no alert for it.
                        if !Task.isCancelled { self.error = error }
                    }
                }
            } label: {
                if undoTask != nil {
                    ProgressView()
                } else {
                    Label("Undo", systemImage: "arrow.uturn.backward")
                }
            }
        }
        .onDisappear { undoTask?.cancel() }
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

- Return the app's own SwiftUI view as the intent result snippet with `.result(value:view:)` (which conforms the result to `ShowsSnippetView`); do not rebuild a second copy of the layout for Siri and Shortcuts. Put that shared view in a target or module both the app and the intent build against.
- A snippet renders outside the app's view hierarchy: pass resolved values into the shared view and remove `@Environment` app objects and `ModelContext` fetches from it.
- Return the value alongside the snippet so a following Shortcuts action still receives it. A `.result(value:view:)` snippet is static; an interactive snippet needs a `SnippetIntent` on iOS 26 or later.
- Keep the intent signature identical between Shortcuts and SwiftUI usage.
- Route service calls through the intent, not the view, to keep analytics, validation, and side effects consistent.
- To navigate to a live SwiftData model after an intent returns, resolve the returned entity `id` in the view's `ModelContext`. If opaque `perform()` result typing makes that awkward, choose explicitly between `Button(intent:)` and `callAsFunction(donate:)`; do not create a second hidden implementation path.

## Shortcuts Provider

Expose user-facing actions with `AppShortcutsProvider`.

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

- When shortcuts depend on dynamic app data, call `TimelineShortcuts.updateAppShortcutParameters()` at app launch and again from the code path that adds, renames, or deletes that data; otherwise the phrase offers old values until the next launch.
- Declare `supportedModes` for the execution the action needs:
  - `.background`: the action finishes without app UI.
  - `.foreground`: bring the app forward before the action runs.
  - `.foreground(.dynamic)`: start in the background and possibly continue in the foreground. The intent stays in the background until it calls `continueInForeground(_:alwaysConfirm:)` or throws `needsToContinueInForegroundError(_:alwaysConfirm:)`.
- Adopt `LiveActivityIntent` for an action that starts or updates a Live Activity, so it runs in the app process without opening the app.
- `openAppWhenRun` is deprecated from iOS 26; keep it only for deployment targets before iOS 26.
- After changing an intent parameter type or entity graph, tell the user to delete and re-add existing Shortcuts actions, which can hold stale serialized entity tokens.

## Metadata And Cache Checks

Compilation is not enough; verify the system-facing metadata (`principle-prove-it-works`).

- Run an `xcodebuild build` for the app target and confirm App Intents metadata extraction succeeds.
- When Shortcuts says an entity is missing, inspect generated or installed `Metadata.appintents`/`extract.actionsdata`: the entity should appear under `entities`, and the parameter should point at that entity type.
- Install and launch the rebuilt app on the target simulator/device before testing in Shortcuts, then terminate/reopen Shortcuts if it holds stale metadata.
- If simulator Debug builds compile but Shortcuts cannot discover the provider, check build settings such as `ENABLE_DEBUG_DYLIB = NO`.
- Treat Shortcuts cache issues as real debugging state: after changing parameter shapes, recreate the action in Shortcuts before judging the code path.

## Development Flow

1. Inventory the user actions in SwiftUI views and decide which ones should become system actions.
2. Model action inputs/outputs as flat `AppEntity` snapshots with display representations and scoped queries.
3. Implement focused `AppIntent`s that call shared domain services or modules; keep expected conflicts in dialogs.
4. Add context-aware prompting with `requestDisambiguation` for conditional choices.
5. Expose shortcuts through `AppShortcutsProvider` and refresh dynamic parameters at launch.
6. Reuse the same action path in SwiftUI via `Button(intent:)` or `callAsFunction(donate:)`.
7. Validate build, App Intents metadata, installed simulator/device metadata, and Shortcuts cache behaviour; cover query and perform paths with tests or builds.
8. Localize strings early (`LocalizedStringResource`) to keep Siri responses natural in all supported languages.
