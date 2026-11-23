# SwiftUI Localization

## String Catalogs and Bundles

- Xcode builds sync strings into existing `.xcstrings` String Catalogs automatically, but do not create one automatically. If a project uses `.strings`/`.stringsdict`, add strings there rather than asking to migrate.
- Route strings across multiple catalogues with `tableName:` (for example `Text("Explore", tableName: "Navigation", comment: "Navigation tab label")`).
- **Swift packages and frameworks must pass `bundle: #bundle`** (preferred over `Bundle.module` and `Bundle(for: MyClass.self)`). Without `bundle: #bundle`, SwiftUI looks in `Bundle.main` and renders unlocalized text. Apps, app extensions, and XPC services can omit `bundle:`.

```swift
Text("Explore", bundle: #bundle)
```

## Automatic `LocalizedStringKey` in Views

- `Text`, `Button`, `Label`, `.navigationTitle`, and alerts accept `LocalizedStringKey` and localize string literals automatically.
- Do not wrap string literals in `NSLocalizedString`, `String(localized:)`, or `LocalizedStringResource` inside SwiftUI view initialisers; eager resolution ignores `@Environment(\.locale)` overrides.
- Follow the project's key convention (natural-language strings or opaque keys such as `"start_workout"`).
- Use `Text(verbatim:)` to opt out of localization for string literals (for example `Text(verbatim: "Session: \(sessionID)")`). Do not add `verbatim:` for an already-typed `String` variable (it already uses the non-localizing `StringProtocol` overload).

## Variables, Enums, and Non-View Types (`LocalizedStringResource`)

- Passing a `String` variable to `Text` skips localization, and `LocalizedStringKey(runtimeString)` cannot be extracted at build time.
- Expose localizable display names on enums and user-facing strings on non-view types (models, tips, section headers) as `LocalizedStringResource` (with `bundle: #bundle` inside packages/frameworks) so resolution defers to display time under the active locale.
- Apply this to new types and edited user-facing text; do not sweep unrelated existing `String` properties.

```swift
enum Theme: String, CaseIterable, Identifiable {
    case light, dark, system
    var id: String { rawValue }

    var title: LocalizedStringResource {
        switch self {
        case .light: "Light"
        case .dark: "Dark"
        case .system: "System"
        }
    }
}
```

## Interpolation, Casing, and Locale-Aware Formatting

- **Interpolate, never concatenate:** `Text("Created by \(authorName)")` preserves `LocalizedStringKey` and lets translators reorder words. Never concatenate with `+` or glue separately localized `Text` fragments.
- **Bake casing into the string literal:** Write `Text("SECTION HEADER")` rather than transforming localized strings at runtime with `.textCase(_:)`, `.localizedUppercase`, or `.localizedCapitalized`. Display user-typed text as-is. If runtime casing is unavoidable, use `.localizedUppercase` / `.localizedCapitalized`.
- **Use format styles, not hardcoded formatters:**
  - Dates: `Text(workout.date, format: .dateTime.month().day().year())` (cached and locale-aware; never allocate `DateFormatter` in `init` or use hardcoded `"MM/dd/yyyy"`). If `DateFormatter` is unavoidable, call `setLocalizedDateFormatFromTemplate(_:)`.
  - Currency: `Text(product.price, format: .currency(code: store.currencyCode))`.
  - Lists: `items.formatted()` or `items.formatted(.list(type: .and))` instead of `items.joined(separator: ", ")`.
- **Outside SwiftUI views:** Use `String(localized:comment:)` instead of `NSLocalizedString`, `String(format:)`, or `String.localizedStringWithFormat`. Never interpolate inside `NSLocalizedString`.

## Layout, Locale Environment, and Translator Comments

- Use `.leading` and `.trailing` instead of `.left` and `.right` for RTL layouts.
- Avoid fixed widths/heights around localized text; use `ViewThatFits` when longer translations may overflow.
- Use dynamic text styles (`.font(.body)`) rather than fixed point sizes (`.font(.system(size: 17))`) so line height adapts for tall scripts.
- Read the active locale with `@Environment(\.locale)` instead of `Locale.current`.
- Add `comment:` for ambiguous strings (noun vs verb) and describe interpolated placeholders by position ("the first variable is..., the second is..."), keeping one source of truth between `comment:` and the String Catalog.
