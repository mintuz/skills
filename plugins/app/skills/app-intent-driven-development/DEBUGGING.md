# App Intents System-Boundary Debugging

Use this sequence when compiled intent code differs from Siri, Shortcuts, Spotlight, widget, Live Activity, or SwiftUI behavior.

## 1. Extraction

Build the app and relevant extension targets. Read the App Intents metadata extraction diagnostics before changing runtime code.

If extraction fails, inspect the referenced intent, entity, query, parameter, result, and static metadata declarations. Confirm each custom type is included in the intended target and actor isolation compiles for metadata extraction.

**Complete when:** extraction succeeds or the failing declaration and diagnostic are named.

## 2. Installed metadata

Inspect generated or installed `Metadata.appintents` or `extract.actionsdata`. Confirm:

- the intent appears;
- each custom entity appears;
- parameters and results point to the intended entity types;
- the shortcut provider exposes the intended action.

**Complete when:** the installed metadata graph matches the Swift declarations or the first mismatch is identified.

## 3. Registration and cache

Install and launch the rebuilt app before opening the system surface. Call `updateAppShortcutParameters()` during app initialization when parameters are dynamic, then reopen the host surface.

After changing an intent parameter type, entity identifier, or entity graph, delete and recreate existing Shortcuts actions so stale serialized values cannot mask the new metadata.

If a simulator Debug build extracts metadata but the provider remains undiscoverable, inspect the target’s debug dylib settings, including whether `ENABLE_DEBUG_DYLIB = NO` is required for that configuration.

**Complete when:** the host reloads current metadata and a newly created action uses the current parameter graph.

## 4. Target and process

For widgets and Live Activities, confirm the intent belongs to every required target and all control parameters are resolved before interaction. Confirm the selected intent protocol and execution mode place `perform()` in the process that owns its dependencies.

Trace the shared domain operation directly when one surface works and another fails; the first divergence identifies whether the defect is system wiring or business behavior.

**Complete when:** the failing layer is proven by build output, installed metadata, host behavior, or runtime tracing, and the same surface passes after the smallest fix.
