# App Intent Implementation Patterns

Use only the patterns that match the action contract in [`SKILL.md`](SKILL.md).

## Entity and query

Keep the entity as a stable system snapshot and resolve live app data by identifier:

```swift
import AppIntents

struct TaskEntity: AppEntity {
    nonisolated static var typeDisplayRepresentation: TypeDisplayRepresentation {
        "Task"
    }

    nonisolated static var defaultQuery: TaskQuery {
        TaskQuery()
    }

    let id: UUID
    let title: String
    let isComplete: Bool

    var displayRepresentation: DisplayRepresentation {
        DisplayRepresentation(
            title: "\(title)",
            subtitle: isComplete ? "Completed" : "Open",
            image: .init(systemName: isComplete ? "checkmark.circle.fill" : "circle")
        )
    }
}

struct TaskQuery: EntityQuery {
    @MainActor
    func entities(for identifiers: [TaskEntity.ID]) async throws -> [TaskEntity] {
        try await TaskStore.shared.fetch(ids: identifiers)
    }

    @MainActor
    func suggestedEntities() async throws -> [TaskEntity] {
        try await TaskStore.shared.fetchRecent()
    }
}
```

Use a string identifier for a valid domain candidate that is not persisted yet. Store related identifiers and display names instead of nesting app models or other entity values.

## Focused intent

Keep system metadata on the intent and business behavior in the shared domain operation:

```swift
import AppIntents

struct CompleteTaskIntent: AppIntent {
    nonisolated static let title: LocalizedStringResource = "Complete Task"
    nonisolated static let description = IntentDescription(
        "Marks a task as complete and returns the updated task."
    )

    @Parameter(
        title: "Task",
        requestValueDialog: "Which task should I complete?"
    )
    var task: TaskEntity

    init(task: TaskEntity) {
        self.task = task
    }

    init() {}

    @MainActor
    func perform() async throws -> some IntentResult & ReturnsValue<TaskEntity> & ProvidesDialog {
        let updated = try await CompleteTask.run(id: task.id)
        return .result(
            value: updated,
            dialog: "Completed \(updated.title)."
        )
    }

    nonisolated static var parameterSummary: some ParameterSummary {
        Summary("Complete \(\.$task)")
    }
}
```

Set `openAppWhenRun` or adopt a specialized foreground or surface protocol only when the action contract requires that execution mode.

## Context-scoped disambiguation

Resolve the controlling context before building candidates:

```swift
@Parameter(title: "Resolution")
var resolution: StopResolution

@Parameter(title: "Benchmark Lap")
var benchmarkLap: BenchmarkLapEntity?

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

Add a `DynamicOptionsProvider` with `@IntentParameterDependency` when the Shortcuts editor also needs context-scoped options. Keep runtime disambiguation so execution revalidates the current candidates.

Use `requestDisambiguation` for an optional scoped choice rather than relying on `requestValue` to produce the intended editor or runtime behavior.

## SwiftUI and shortcuts

Use the native intent-backed button for direct actions:

```swift
Button(intent: CompleteTaskIntent(task: task)) {
    Label("Complete", systemImage: "checkmark.circle")
}
```

Publish user-facing shortcuts from one provider:

```swift
import AppIntents

struct TaskShortcuts: AppShortcutsProvider {
    @AppShortcutsBuilder
    nonisolated static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: CompleteTaskIntent(),
            phrases: ["Complete a task in \(.applicationName)"],
            shortTitle: "Complete Task",
            systemImageName: "checkmark.circle.fill"
        )
    }
}
```

Call `TaskShortcuts.updateAppShortcutParameters()` during app initialization when the provider exposes dynamic parameter values.
