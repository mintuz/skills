---
name: app-intent-driven-development
description: WHEN designing, implementing, or debugging App Intent-first iOS features for Siri, Shortcuts, Spotlight, widgets, Live Activities, or SwiftUI; NOT UIKit-only flows or general SwiftUI architecture; produces one intent-backed action path with scoped entities, system metadata, and end-to-end validation.
---

# App Intent-Driven Development

Treat App Intents as a **system boundary** around one action path. Model what the system needs, route every surface through the same domain operation, and verify the metadata the system actually installs.

## 1. Define the action contract

Trace the existing feature from UI entry point through state, persistence, side effects, and user-visible result. Record:

- the single action and its observable result;
- required and optional inputs;
- expected conflicts that need a user-facing dialog;
- each surface that invokes it: Siri, Shortcuts, Spotlight, widget, Live Activity, or SwiftUI;
- the process and target where each surface executes;
- the deployment target and API availability for each surface.

Keep purely local presentation changes in SwiftUI. Make an action an `AppIntent` when a system surface must discover, configure, or run it.

**Complete when:** every requested surface maps to the same action contract, and its inputs, result, conflicts, process, and target are explicit.

## 2. Model the system boundary

Represent custom inputs and outputs as flat `AppEntity` snapshots:

- Give each entity a stable, persistent identifier that resolves back to current app data.
- Include primitive values, dates, identifiers, and display strings needed outside the app.
- Supply `typeDisplayRepresentation`, `displayRepresentation`, and useful icons or subtitles.
- Keep display representations self-contained so system surfaces can render them without app-only environment state.
- Resolve live SwiftData or service models by identifier inside the action path.
- Keep query work bounded and cooperatively cancellable. Preserve the input identifier order from `EntityQuery.entities(for:)` when the caller depends on it.
- Scope `suggestedEntities()` to useful current or recent values. Add `EntityStringQuery` only when text search is part of the contract.

For context-dependent choices, derive candidates after resolving the controlling parameter or current app state. Use a `DynamicOptionsProvider` with `@IntentParameterDependency` for editor options and runtime `requestDisambiguation` as the final resolver. Candidate identifiers must match the domain identifiers consumed by the action.

When this run writes or revises Swift types, read and apply every matching pattern in [IMPLEMENTATION.md](IMPLEMENTATION.md) before editing.

**Complete when:** the system can resolve every custom value by stable identifier, render it meaningfully, and offer only candidates valid for the current context.

## 3. Implement one action path

Create one focused `AppIntent` per user action. Keep parameters few and localized; provide `parameterSummary`, `requestValueDialog`, and result dialogs where they improve system prompting.

Route `perform()` to the same domain operation used by the app. Put validation, persistence, analytics, and side effects in that shared operation. Return an entity when another system step needs or usefully renders the updated value; use a dialog-only result when no structured output is needed.

Express expected conflicts such as “already running” as helpful dialogs. Reserve thrown errors for failures the action cannot resolve. Apply actor isolation at the real boundary: SwiftData contexts, app settings, Live Activities, and UI-bound services commonly require `@MainActor`; static metadata may require `nonisolated` under Swift 6 isolation.

Choose execution mode from the action contract. Use the app process when the action needs app-only state, foreground continuation, or the applicable specialized intent protocol. Widget and Live Activity controls must receive fully resolved parameters because those surfaces cannot prompt at tap time.

**Complete when:** every surface reaches one domain operation and produces the same validation, side effects, and result semantics.

## 4. Publish and reuse the action

Expose discoverable actions with `AppShortcutsProvider`, localized phrases, a short title, and an appropriate system image. Call `updateAppShortcutParameters()` during app initialization when shortcut parameters depend on dynamic app data.

Use SwiftUI’s `Button(intent:label:)` or related intent-backed control initializers for direct actions. For an in-app flow that needs local progress, navigation, or error state, use a regular SwiftUI control that calls the same domain operation as the intent.

Include interactive widget intents in both the app and widget extension targets. Use the intent protocol appropriate to the surface, including `LiveActivityIntent` for Live Activity controls.

**Complete when:** every requested surface discovers the action, supplies resolved inputs, and reaches the shared operation in the intended process.

## 5. Verify the installed system contract

Run the smallest build and runtime checks that cover the action contract:

1. Build the relevant app and extension targets; confirm App Intents metadata extraction succeeds.
2. Install and launch the rebuilt app on the target simulator or device.
3. Exercise each requested system surface and the in-app surface.
4. Inspect installed or generated metadata when an intent, entity, or parameter is absent.
5. After changing parameter or entity shape, recreate existing Shortcuts actions before judging runtime behavior.

When discovery, rendering, prompting, or execution differs from the compiled code, follow [DEBUGGING.md](DEBUGGING.md) until the failing metadata, registration, cache, target, or process layer is identified.

**Complete when:** the build extracts metadata, installed metadata describes the intended graph, every requested surface runs the action, and any untested surface is named with the exact blocker.

## Handoff

Report the action contract, files changed, surfaces exercised, build command and result, metadata or cache checks, and remaining blockers.
