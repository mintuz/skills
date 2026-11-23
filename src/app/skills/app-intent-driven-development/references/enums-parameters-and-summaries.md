# `AppEnum`, Parameters, `ParameterSummary`, and Factoring

## Factoring: `AppEnum` vs `AppEntity` vs Plain `@Parameter`

- **`AppEnum`:** Compile-time fixed sets only. Never model runtime/user data as an `AppEnum` (freezes stale values into `.actionsdata` and bloats metadata).
- **`AppEntity` + `EntityQuery`:** Dynamic, queryable, browsable runtime records (only the type schema goes into metadata).
- **Plain `@Parameter` (`String`, `Int`, `Bool`, `Date`, `Measurement`):** Free-form user input; do not wrap free-form inputs in synthetic entities such as `SearchTermEntity` or `DurationEntity`.
- **Intent granularity:** Split by user verb; avoid mega-intents whose title needs "and/or" or whose optional parameters go unused across unrelated branches. Share helpers in app services.

## `AppEnum` Persistence and Exhaustiveness

`AppEnum` refines `RawRepresentable where RawValue: LosslessStringConvertible`. The system persists enum choices as `rawValue.description` and deserialises by string lookup.

- **Freeze raw values:** Assign explicit stable raw values (prefer `String`, never rely on implicit `Int` raw values). Never rename, reorder, or renumber shipped raw values — only append new cases. Renaming display text in `caseDisplayRepresentations` is safe; deleting a shipped case orphans saved shortcuts.
- **`caseDisplayRepresentations` `fatalError` trap:** `[Self: DisplayRepresentation]` is an unchecked dictionary. A missing case compiles cleanly and traps at runtime (`unsafeDisplayRepresentation`) when displayed. Add the case, raw value, and `caseDisplayRepresentations` entry in the same edit.

## Parameters and `@IntentParameterDependency`

- **Inline vs restart prompting:**
  - `try await $param.requestValue(_:)` resolves inline in the same `perform()` pass (no restart).
  - `throw $param.needsValueError(_:)` aborts and restarts `perform()` from the top.
  - Never use the deprecated synchronous `requestValue(_:) -> Error` overload.
- **Non-optional `AppEnum` prompting:** An unfilled non-optional `AppEnum` does not throw `needsValueError`. With `> 1` option, it auto-disambiguates using `requestDisambiguationDialog` (not `requestValueDialog`). With `== 1` option (or 1 dynamic option), it auto-assigns silently with no UI prompt.
- **`@IntentParameterDependency`:** Inside `DynamicOptionsProvider` or `EntityQuery`, declare `@IntentParameterDependency<TheIntent>(\.$otherParam) var dep`. Guard the optional projection (`guard let dep else { return [] }`) when unset. Reading a key path not declared in `@IntentParameterDependency(...)` causes a runtime `fatalError`; never force-unwrap.

## `ParameterSummary` DSL

`AppIntent` provides unqualified typealiases `Summary`, `When`, `Switch`, `Case`, and `DefaultCase`.

- **Shortcuts editor allowlist and ordering:** Only parameters interpolated in `Summary("…\(\.$x)…")` or listed in the trailing `@ParameterKeyPathsBuilder` block `{ \.$y }` appear in the Shortcuts editor; all others are silently hidden. Field order follows interpolation order then trailing block order, never `@Parameter` declaration order.
- **Edit-time conditional visibility:** Use `When` or `Switch`/`Case`/`DefaultCase` in `parameterSummary` (`perform()` runs too late to hide fields in the editor). `When`'s first argument must be a real `\.$param` key path on the intent.
- **Separate operator enums:**
  - `EquatableComparisonOperator`: `.equalTo`, `.notEqualTo`
  - `HasValueComparisonOperator`: `.hasNoValue`, `.hasAnyValue` (no value argument)
  - `OneOfComparisonOperator`: `.oneOf` (array of values)
  - `ComparableComparisonOperator`: `.lessThan`, `.lessThanOrEqualTo`, `.greaterThan`, `.greaterThanOrEqualTo`
- **`Switch` completeness:** `Case` accepts one value or an array (`Case([.a, .b])`). Add `DefaultCase` whenever `Case` branches do not cover every value.
- **Literal `%` escaping:** Write `%` once in `Summary(...)`; interpolation escapes `%` to `%%` automatically (writing `%%` renders doubled `%%`).
