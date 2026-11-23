# Environment, `@Entry`, and `FocusedValues`

## Prefer `@Entry` Over Manual Keys

On iOS 18 / macOS 15 / Xcode 16 and later, declare custom values on `EnvironmentValues`, `Transaction`, `ContainerValues`, and `FocusedValues` with `@Entry` instead of manual `EnvironmentKey`, `ContainerValuesKey`, or `FocusedValueKey` types.

- `FocusedValues` entries must have an `Optional` type and cannot declare a non-`nil` default.
- When reviewing code that uses manual `EnvironmentKey`, `ContainerValuesKey`, or `FocusedValueKey`, report migrating to `@Entry` as a top-line finding (with a one-line iOS 18 / macOS 15 availability caveat if the deployment target is unspecified). Show the refactored snippet; do not rewrite unrequested code silently.

```swift
extension EnvironmentValues {
    @Entry var badgeStyle: BadgeStyle = .standard
}

extension FocusedValues {
    @Entry var selectedDocumentID: UUID?
}
```

## Four Comparison Rules

These rules govern both `EnvironmentValues`/`@Environment` and `FocusedValues`/`@FocusedValue`:

1. Structs compare field by field (`Equatable` is a fast path, not a prerequisite).
2. Class references compare by pointer identity.
3. Closures and function values cannot be compared reliably across optimisation levels and captures.
4. Every environment write propagates to the entire subtree; fallback readers re-evaluate unstable defaults on every unrelated ancestor write.

### Compiler Warnings from `@Entry`

- `"Storing a closure in '@Entry var ...' may invalidate dependents on every update because closures may not be comparable"`
- `"Storing a class type in '@Entry var ...' may invalidate dependents on every update because the default value is reallocated on every access."`

## No Closures in Custom Environment or Focused Keys

Never store a closure in a custom `EnvironmentValues` or `FocusedValues` entry. Wrapping a closure in a `struct` or hoisting it to a `private let` on a `View` struct does not fix the comparison failure.

**Framework exception:** Do not flag or replace framework action types (`OpenURLAction`, `DismissAction`, `RefreshAction`) or keys (`\.openURL`, `\.dismiss`, `\.refresh`).

Choose the fix by capture pattern:

- **No captures:** Defunctionalise into a `struct` with `func callAsFunction(...)` for stateless actions, or move the action onto an `@Observable` model injected with `.environment(handler)` when coordinating shared state.
- **With captures:** Store the captured values on a `struct` with `callAsFunction()` (use optional `@Entry var submitAction: SubmitAction?` when meaningless without context) for small view-local state, or move state and method into an `@Observable` model for shared state.
- **Generic / open handler set:** Use a protocol (with `callAsFunction()` or a descriptive method such as `handleURL(_:)`) backed by concrete conforming structs when the handler set is extensible, or unify into a shared `@Observable` class when handlers share state and the set is closed.

```swift
struct SubmitAction {
    let formID: UUID
    let service: FormService

    @MainActor func callAsFunction() {
        service.submit(formID: formID)
    }
}

extension EnvironmentValues {
    @Entry var submitAction: SubmitAction?
}
```

## Keep Rapidly Updating Values Out of the Environment

Every environment write incurs comparison cost across every view reading any environment key in the subtree. Keep high-frequency sources out of `@Entry` / `.environment(\.key, value)`:

- Scroll offset (`scrollPosition`, `onScrollGeometryChange`)
- Window or container size (`GeometryReader`, `onGeometryChange`)
- Drag translation or location (`DragGesture().onChanged`)
- Per-frame animation progress (`TimelineView`, `CADisplayLink`)
- Timer-driven state (`Timer`, `.timer` publisher)
- Pointer, cursor, or hover location

Fixes:

- For purely visual scroll effects (opacity, scale, rotation), use `scrollTransition` or `visualEffect(in:)`, which run in the renderer without re-evaluating `body`.
- For non-rendering logic (layout thresholds, prefetching, model updates), write into an `@Observable` model and expose coarsened properties (for example `var isWide = false` updated via `onGeometryChange(for:of:action:)`).
- For per-item visibility in lists, avoid having every row read raw scroll offset or a shared `Set<Int>` of visible indices. Give each row its own persisted `@Observable` `ItemModel` (`var isVisible = false`) so updates stay O(1).

## Fix Unstable Default Values

`@Entry` wraps every default in a computed getter, and manual `EnvironmentKey` with `static var defaultValue` also re-evaluates on every fallback read. Defaults that allocate a fresh class instance (`ImageCache()`, or a struct holding `let cache = ImageCache()`) or vary per call (`Date()`, `UUID()`) invalidate dependents on every ancestor environment write.

- **Triage:** Live performance bug if any reader falls back to the default; latent guard if every reader has an upstream `.environment(...)` injection.
- **Do not mask with `Equatable`:** Conforming the default class to `Equatable` hides invalidation while still allocating and running `init` side effects on every read and giving each reader a distinct instance.
- **Do not over-fix stable defaults:** Fixed literals, `nil`, plain enum cases, `static let` / module-level `let` references, and structs constructed from stable values are already stable.

Pick one concrete fix (do not leave the choice unmade):

1. **Sentinel diagnostic first:** If readers detect absence via sentinels (`value.id.isEmpty`, `value.count == 0`, `value == .none`, `value === sentinel`), make the entry optional (`@Entry var cache: ImageCache?`) and remove the sentinel.
2. **Short shared default:** Keep `@Entry` backed by a stored constant: `private static let _defaultCache = ImageCache()` and `@Entry var cache = _defaultCache`.
3. **Complex or shared default:** Use a manual `EnvironmentKey` with a stored `static let defaultValue = ImageCache()` (never `static var`).

## Remove Unused Environment Reads

- KeyPath reads (`@Environment(\.key)`, `@FocusedValue(\.key)`) subscribe the view even if never referenced in `body`. Removing an unused one is an active performance fix.
- Type reads (`@Environment(Model.self)`) track per-property reads; an unused declaration has no live invalidation cost unless its default is unstable, so removing it is dead-code cleanup.
- Check direct reads, `_propertyName` projected forms, and helper methods called from `body` before removing.
- Use `Self._printChanges()` to diagnose unexpected invalidations.
