---
name: app-intent-driven-development
description: WHEN designing or debugging App Intent-first iOS features for Siri, Shortcuts, widgets, Live Activities, or reuse of an existing intent in SwiftUI; NOT for actions with no system surface; provides AppEntity, metadata, prompting, and view-reuse patterns.
---

# App Intent-First Driven Development

Design features as App Intents first, then reuse those intents across Shortcuts, widgets, and SwiftUI views so automation and UI stay in lockstep.

## Scope Check

An action earns an App Intent when it needs a system surface. System surfaces include Siri, Shortcuts, App Shortcuts, Spotlight, widgets, Controls, the Action button, Focus filters, and Live Activities. Treat the list as examples, not as a closed set.

- The UI framework does not decide this. A UIKit app can adopt App Intents. A SwiftUI app can hold actions that must stay inside one screen.
- Keep an action with no system surface in the shared domain service the screen already calls. Do not add an intent for consistency alone.
- An unused intent still costs work. It widens discoverability in system surfaces. It adds App Intents metadata and Shortcuts cache upkeep. It adds system-facing verification with no user benefit.
- A refusal is a product decision about surfaces. It is not a limit of the app's UI framework.
- When a system surface becomes a requirement, extract the intent around the same service. Leave the service unchanged.
- A scope decision is a deliverable. Record the surface that is missing, the cost the refusal avoids, and the condition that reverses the decision.

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
- Prefer primitive values, dates, ids, and display strings on entities. Use an entity-typed property only when the system needs that relationship. If an entity needs to refer to another model, store `profileID` and `profileName`, not `profile: ProfileEntity`.
- Start with plain `EntityQuery`. Add `EntityStringQuery` only when search is required and verify generated metadata after adding it.
- Keep `suggestedEntities()` conservative. For child values such as laps/results, prefer active-run/current-profile suggestions over global history.
- Entity IDs do not have to be UUIDs. Use a `String` id when the selectable thing can be a domain candidate that is not persisted yet, such as a `"final"` lap.
- Use an identifier that stays the same across launches. Never reuse an identifier for a different record. Never derive an identifier from an array index, a row position, or a display name, because a saved shortcut stores the identifier and would then resolve to whatever record later takes that place.
- Return only the records that still exist from `entities(for:)`. Omit an identifier you cannot resolve. Never substitute a nearby record. The system then treats the value as unavailable, and the intent can report the missing item or prompt again.
- Keep entity display independent of app-only formatting state. Shortcuts may render it without your SwiftUI environment.

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

- **Parameters**: keep them few. Make a value the action cannot work without a required, non-optional parameter. Give that parameter a `requestValueDialog`, and the system asks the user for it before `perform()` runs.
- **Missing values**: never substitute a guessed or remembered default for a value the user did not supply. An optional parameter is not requested automatically. Call `try await $parameter.requestValue(...)` or `$parameter.requestDisambiguation(among:)` inside `perform()`, or throw `$parameter.needsValueError(...)`. Define the behavior for an optional value that stays nil.
- **Callers that already know a value**: construct the same intent with that value from a widget, a Control, or a view, so no prompt appears. Do not add a second intent for the pre-filled path. A widget or Control cannot show a request-value prompt, so it must supply every value the action needs.
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

- Build disambiguation candidates after resolving the current run/profile. Do not rely on a global entity query for context-sensitive choices.
- If the Shortcuts editor should show a dropdown, use `DynamicOptionsProvider` with `@IntentParameterDependency` on the parameters that define the context. At runtime, rebuild the scoped candidates. Accept a supplied entity only when its id is still present in that set. Otherwise disambiguate again.
- Keep the entity identifier aligned with the domain candidate identifier so selected values map back to the save/resolve module without guessing.
- Do not assume `requestValue` on an optional parameter will produce the desired editor or runtime behavior. Use `requestDisambiguation` when there are scoped candidates to choose from.

## Reusing Intents in SwiftUI

- Prefer calling intents from UI so automation and in-app flows share one path.
- Use `Button(intent:)` or `Toggle(isOn:intent:)` for direct, fire-and-forget actions. Importing both `AppIntents` and `SwiftUI` makes these initialisers available. The system runs the intent and owns its result handling.
- The system-run button does not expose progress or errors to the view. When the row must show in-flight state, an error alert, or navigation, call the intent with `callAsFunction(donate:)` inside your own `Button`. Do not reimplement the action against the service behind the intent's back.
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
            Button(intent: UndoLastEventOccuranceIntent(event: event)) {
                Label("Undo", systemImage: "arrow.uturn.backward")
            }
        }
    }
}
```

- When the row must own progress and errors, invoke the intent itself with `callAsFunction(donate:)`. It resolves parameters, runs `perform()`, and returns the result value, so the view keeps the single action path:

```swift
import AppIntents
import SwiftUI

struct EventRow: View {
    @State private var isWorking = false
    @State private var error: Error?

    let event: EventEntity

    var body: some View {
        HStack {
            Text(event.name)
            Spacer()
            Button {
                guard !isWorking else { return }
                Task {
                    isWorking = true
                    defer { isWorking = false }
                    do {
                        _ = try await UndoLastEventOccuranceIntent(event: event)()
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

- Return the app's own SwiftUI view as the intent result snippet with `.result(value:view:)`, which conforms the result to `ShowsSnippetView`. Do not rebuild a second copy of the layout for Siri and Shortcuts.
- Put that shared view in a target or module that both the app and the intent build against.
- A snippet renders outside the app's view hierarchy. Pass resolved values into the shared view. Remove `@Environment` app objects and `ModelContext` fetches from it.
- Return the value alongside the snippet so a following Shortcuts action still receives it. A snippet built from `.result(value:view:)` is static; an interactive snippet needs a `SnippetIntent` on iOS 26 or later.
- Keep the intent signature identical between Shortcuts and SwiftUI usage.
- Avoid reimplementing service calls in views; route through the intent to keep analytics, validation, and side effects consistent.
- If a view needs to navigate to a live SwiftData model after an intent returns, resolve the returned entity `id` in the view's `ModelContext`. If opaque `perform()` result typing makes that awkward, choose explicitly between `Button(intent:)` and `callAsFunction(donate:)`. Do not create a second hidden implementation path.

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

- Call `TimelineShortcuts.updateAppShortcutParameters()` at app launch when shortcuts depend on dynamic app data. Call it again from the code path that adds, renames, or deletes that data, or the phrase keeps offering the old values until the next launch.
- Declare `supportedModes` for the execution the action needs. Use `.background` when the action finishes without app UI. Use `.foreground` to bring the app forward before the action runs. Use `.foreground(.dynamic)` when the action starts in the background and may need to continue in the foreground. A dynamic intent stays in the background until it calls `continueInForeground(_:alwaysConfirm:)` or throws `needsToContinueInForegroundError(_:alwaysConfirm:)`.
- Adopt `LiveActivityIntent` for an action that starts or updates a Live Activity, so the action runs in the app process without opening the app.
- `openAppWhenRun` is deprecated from iOS 26. Keep it only for deployment targets before iOS 26.
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
6. Reuse the same action path in SwiftUI via `Button(intent:)` or `callAsFunction(donate:)`.
7. Validate build, App Intents metadata, installed simulator/device metadata, and Shortcuts cache behavior.
8. Localize strings early (`LocalizedStringResource`) to keep Siri responses natural in all supported languages.

## Quick Checklist

- [ ] Entity has an identifier that is stable across launches and never reused, plus `typeDisplayRepresentation`, rich `displayRepresentation`, and flat stored properties.
- [ ] Child/contextual entity suggestions are scoped to the current run/profile, not global history.
- [ ] Queries are fast, cancellable, and start as plain `EntityQuery` unless search is required.
- [ ] Intent reuses shared domain services; no duplicated business logic.
- [ ] Parameters are minimal; a required value is non-optional with a `requestValueDialog`, and no missing value is guessed.
- [ ] Conditional choices use `requestDisambiguation` with context-built candidates.
- [ ] Results return entities only when the metadata graph stays simple and useful.
- [ ] `AppShortcutsProvider` is registered; dynamic parameters refresh on launch when needed.
- [ ] Build output confirms App Intents metadata extraction.
- [ ] Installed metadata and Shortcuts cache are checked after changing entity/parameter shapes.
- [ ] Strings are localized; tests or builds cover query and perform paths.
