# Opening Content and URL Representations

## `OpenIntent` (iOS 16+)

- Use `OpenIntent` (refines `SystemIntent` → `AppIntent`) instead of hand-rolling a plain `AppIntent` to open an item.
- Declares `var target: Value { get set }` (`AppEntity` or `AppEnum`), defaults `openAppWhenRun` to `true`, and supplies a default `perform()` returning `.result()`.
- On iOS 26+, declare `supportedModes` (`.foreground`) rather than relying on deprecated `openAppWhenRun`. When writing a custom `perform()`, still hop to `@MainActor` for navigation state.

## `OpenURLIntent` (iOS 18+)

- Use `OpenURLIntent` for opening universal links or URLs from an intent, widget, or Live Activity.
- Never call `UIApplication.shared.open(_:)` inside `perform()`; return `.result(opensIntent: OpenURLIntent(url))` with `some IntentResult & OpensIntent` (never deprecated `OpensAppIntent`).
- Construct with `OpenURLIntent(url)` or the throwing/async-throwing entity/enum initialisers (`try`/`try await`, never force-unwrap).

## `URLRepresentableIntent`, `URLRepresentableEntity`, and `URLRepresentableEnum` (iOS 18+)

- Implement `static var urlRepresentation: URLRepresentation` (`IntentURLRepresentation<Self>`, `EntityURLRepresentation<Self>`, `EnumURLRepresentation<Self>`).
- **Universal links only:** Requires `applinks:` associated domains. Does **not** work with custom URL schemes (use `OpenIntent` + custom `perform()` for custom schemes).
- **Leave `perform()` alone:** The protocol provides `perform()` and routes through universal links (setting `openAppWhenRun` to `false` when combined with `OpenIntent`). Writing a custom `perform()` is dead code or causes double opens.
- **Key-path interpolation:** Interpolate parameter/property key paths (`\(\.$page)`, `\(\.$contentID)`), not values. `String`, `Int`, and `URL` convert automatically; other types must conform to `CustomURLRepresentationParameterConvertible` (`urlRepresentationParameter`) or they resolve to empty. `EnumURLRepresentation` interpolates `\(.rawValue)` / a specific case or uses `[Enum: EnumSingleURLRepresentation]`.
- **Stable URL contract:** Treat URL templates as a frozen public contract; evolve formats additively and keep old links resolvable. `URLRepresentableEntity.urlRepresentationParameter` defaults to the entity's `id` string, coupling URL stability to `AppEntity.id` stability.
