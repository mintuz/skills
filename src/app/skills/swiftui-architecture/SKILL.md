---
name: swiftui-architecture
description: WHEN building SwiftUI views, managing state, setting up shared services, or making architectural decisions; NOT for UIKit or legacy patterns; provides pure SwiftUI data flow without ViewModels using @State, @Binding, @Observable, and @Environment.
---

# Modern SwiftUI Architecture

Pure SwiftUI architecture without legacy `ObservableObject` ViewModels, combining clear ownership with Apple's SwiftUI performance and API guidance.

## Scope

This skill covers evergreen SwiftUI views, data flow, performance, localisation, animations, and soft-deprecated APIs.

- For new iOS 27 / macOS 27 SwiftUI APIs and `@State` macro migration errors, use `swiftui-whats-new-27`.
- For SwiftUI document-based apps (`Document` protocol, `DocumentGroup`), use `building-document-based-swiftui-applications`.
- When asked to restructure UIKit or AppKit code, state that this guidance does not cover UIKit/AppKit internals and leave them alone. Answer only at the boundary:
  - Wrap an existing view controller in `UIViewControllerRepresentable` (`NSViewControllerRepresentable` on macOS).
  - Wrap an existing view in `UIViewRepresentable` (`NSViewRepresentable` on macOS) only when it is already separated from its controller.
  - Use `UIHostingController` (`NSHostingController` on macOS) to show a SwiftUI view inside UIKit/AppKit.
  - Keep wrapped state where it already lives; pass SwiftUI values into the wrapper and send events back via callbacks.

## Large-Codebase Review Workflow

When asked for general SwiftUI best-practice or performance guidance on a large codebase:

1. Scan the project to identify discrete areas.
2. Propose focus areas one at a time, offering choices where applicable.
3. If the user asks for a whole-codebase review, divide the review into sections with a checklist.

## References

Read a reference when its topic applies:

- State ownership, value inputs, `@State`, KeyPath bindings, and `.onChange` isolation: `references/state-management.md`
- `@Observable` services, `@MainActor`, `Equatable`, and invalidation granularity: `references/observable-patterns.md`
- Async work and `.task(id:)` lifecycle: `references/async-patterns.md`
- View structure, `View.init`, and single-child `Group`: `references/structure.md`
- `@Entry`, `EnvironmentValues`, `FocusedValues`, closures, unstable defaults, and high-frequency updates: `references/environment.md`
- `ForEach`, `List`, `Table`, identity, derived collections, and unary row fast path: `references/foreach.md`
- Conditional modifiers and `AnyShapeStyle`: `references/modifiers.md`
- Localisation, `LocalizedStringResource`, `bundle: #bundle`, and format styles: `references/localization.md`
- Custom `@Animatable` views/shapes and `AnimatableValues`/`AnimatablePair`: `references/animations.md`
- Soft-deprecated APIs policy and SDK 27 catalogue: `references/soft-deprecation.md`, `references/soft-deprecated-apis.md`
- Navigation and components: `references/navigation-patterns.md`, `references/lists.md`, `references/scrollview.md`, `references/forms.md`, `references/grids.md`, `references/sheets.md`, `references/tabs.md`
- Anti-patterns audit: `references/anti-patterns.md`

## Core Architecture and Performance Flow

1. **Give every mutable value and dependency one owner and lifetime** (`references/state-management.md`, `principle-derive-from-one-owner`):
   - Keep screen-local UI state in `private` `@State` in the view that uses it (`private` enables `@State` lazy initialisation).
   - Lift state to the nearest common ancestor when sibling views share it, passing narrow values down and `@Binding` or callbacks up.
   - Move state into an app-wide shared `@Observable` service only when it must outlive that ancestor, when unrelated features read it, or to avoid threading through unrelated intermediate views. State placed in a shared service persists after the screen closes and invalidates every reader when it changes (`principle-narrow-state-lifetime`).
   - Retain each shared service once with `@State`, inject each service separately via `.environment(...)`, and mutate shared state through actions on the service.
   - A view-local `@State private var model = ...` `@Observable` model is allowed specifically for invalidation isolation, caching derived collections, or coarsening high-frequency geometry/scroll values; keep business logic in injected services (`principle-keep-the-core-pure`).

2. **Design `@Observable` models and view inputs for minimal invalidation** (`references/observable-patterns.md`, `references/structure.md`):
   - Mark `@Observable` classes `@MainActor` (unless `SWIFT_DEFAULT_ACTOR_ISOLATION` is MainActor); `@Observable` is unsupported on `actor`.
   - Make `@Observable` stored property types and collection element types (`Array`, `Set`, `Dictionary`) `Equatable` so generated setters skip no-op invalidations.
   - Pass narrow value-type inputs (only the fields a view reads or forwards). Flatten nested value-type structs stored on `@Observable` models, and cache derived/filtered collections (via `didSet` or `.onChange(of:)`) instead of recomputing `.filter`/`.sorted` inline in `body`.
   - Never have row views index back into a parent `@Observable` collection (`model.items[index]`); pass narrow fields or persisted per-row `@Observable` models instead.
   - Declare multi-section views as separate `View` structs, keep `View.init` constant-time (no JSON decoding, file I/O, or `DateFormatter` allocation), and drop single-child `Group` wrappers.
   - Prefer KeyPath bindings (`@Bindable` + computed property or labeled `subscript`) over closure `Binding(get:set:)`. Extract `.onChange(of:)` into a dedicated `ViewModifier` when an expensive `body` observes a value it does not render.

3. **Keep `@Environment` and `@FocusedValue` invalidation-safe** (`references/environment.md`):
   - Prefer `@Entry` (iOS 18 / macOS 15+) over manual `EnvironmentKey`/`FocusedValueKey` types.
   - Never store custom closures in `@Entry` (defunctionalise into a `struct` with `callAsFunction` or use an `@Observable` model; leave framework actions such as `\.dismiss` and `\.openURL` alone).
   - Never use unstable defaults that allocate a class (`ImageCache()`) or vary per read (`Date()`, `UUID()`); back `@Entry` with a `private static let`, use a stored `static let defaultValue`, or make the entry `Optional` (always choose `Optional` when readers check sentinels).
   - Keep rapidly updating values (scroll offset, geometry, drag, timers, pointer location) out of `.environment`; use `scrollTransition`/`visualEffect(in:)` for visual effects or coarsened `@Observable` properties for logic. Remove unused KeyPath `@Environment(\.key)` reads.

4. **Give every async path one owner and lifetime** (`references/async-patterns.md`):
   - Use `.task` for work starting with the view and `.task(id:)` for input-driven work (putting any debounce inside the task). Include a retry counter or token in the `.task(id:)` identity so retrying an unchanged query re-enters the same structured async path.
   - Never start input-driven work from `onChange` with an unstructured `Task`.
   - For user-triggered work, store the `Task` in `@State`, cancel the previous task before starting the next, and define disappearance behaviour explicitly.
   - Bind results to the input that produced them, check `Task.isCancelled` immediately before every state write after `await`, and treat cancellation as a non-error outcome.

5. **Keep `ForEach`, `List`, modifiers, animations, localisation, and APIs modern**:
   - **`ForEach`/`List` (`references/foreach.md`):** Use stable, immutable, cheap-to-hash IDs (never `indices`, `\.offset`, transient `UUID()` in `body`, or `id: \.self` on large structs; use `items.enumerated()` with `id: \.element.id` when indices are needed). Make `List` rows unary single-root concrete `View` structs (no `AnyView`, no bare top-level `if`/`else`/`switch`) and diagnose slow paths with `-LogForEachSlowPath YES`.
   - **Modifiers (`references/modifiers.md`):** Never write `.if(...)` `@ViewBuilder` modifier extensions; use ternary arguments and wrap incompatible `ShapeStyle` branches (such as `.primary` vs `.tint`) in `AnyShapeStyle(...)`.
   - **Animations (`references/animations.md`):** Use `@Animatable` and `@AnimatableIgnored`; use manual `animatableData` with `AnimatableValues` (iOS 26+) or `AnimatablePair` (earlier targets) only for custom setter logic.
   - **Localisation (`references/localization.md`):** Rely on automatic `LocalizedStringKey` literals in views, pass `bundle: #bundle` inside Swift packages and frameworks, expose non-view/enum text as `LocalizedStringResource`, use `Text(_:format:)` / `.formatted()` instead of hardcoded formatters or runtime casing, and use `.leading`/`.trailing`.
   - **Soft-deprecated APIs (`references/soft-deprecation.md`, `references/soft-deprecated-apis.md`):** Never generate soft-deprecated APIs in new code; during reviews or edits, discuss soft-deprecated APIs only in directly reviewed or modified views.

Finish when every value, service, and async path has one stated owner and explicit cancellation/terminal-state behaviour, data flows down and actions up, and invalidation, collection, localisation, and API choices follow the references above.
