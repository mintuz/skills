# App Shortcut Phrases, Donation, and Localization

## `AppShortcut` Phrases and Limits

- Always use `AppShortcut(intent:phrases:shortTitle:systemImageName:)`; omitting `shortTitle` and `systemImageName` calls the deprecated iOS 17 initialiser and renders blank tiles.
- `systemImageName` must be a compile-time string literal naming an SF Symbol (never a variable or computed expression).
- Every phrase must include `\(.applicationName)` (`AppShortcutPhraseToken.applicationName` -> `${applicationName}`); without it, Xcode warns and the runtime index silently drops the phrase (`Phrase missing \(.applicationName)`).
- Configure app-name synonyms in `Info.plist` with `INAlternativeAppNames` (`INAlternativeAppName` + optional pronunciation hint, max 3 per localisation) and `INPreferredForAppShortcuts`.
- **Interpolatable parameter types:** Only finite named option sets work in phrases: `AppEnum`, `AppEntity`, or `Bool`. For `Bool`, set `@Parameter(..., displayName: Bool.IntentDisplayName(true: "On", false: "Off"))` (`title:` alone produces no spoken variants). Free-form `String`, numeric, and `Date` parameters cannot be interpolated meaningfully.
- **Hard caps:**
  - Maximum **10 `AppShortcut`s per app** (enforced at build time by `appintentsmetadataprocessor`).
  - Approximately **1,000 expanded phrases per locale** (excess phrases are truncated). Avoid near-duplicate phrasings — flexible matching handles minor variants, and duplicates hurt Siri accuracy.
- Call `updateAppShortcutParameters()` at launch and on dynamic-option mutations (not needed for compile-time-fixed `AppEnum` phrases). Test phrase matching with **Product > App Shortcuts Preview**.

## Donation (`IntentDonationManager`)

- Direct in-app UI actions are **not** auto-donated (unlike SiriKit `INInteraction`). Call `IntentDonationManager.shared.donate(intent:)` — or `donate(intent:result:)` when the intent returns a value — **after** the in-app action succeeds.
- **Never donate inside `perform()`:** System-run intents are already donated; donating inside `perform()` double-counts.
- Use the `async throws` overload when delivery verification matters (tests, diagnostics) and the synchronous overload for fire-and-forget calls.
- Delete stale donations when the underlying user data is deleted.
- **`PredictableIntent` trap:** `PredictableIntent` (`predictionConfiguration`) only provides display descriptions for suggestions; it does not donate interactions.

## Localization

- User-facing App Intents slots (`title`, `IntentDescription`, `DisplayRepresentation`, `TypeDisplayRepresentation.name`, `IntentDialog`, `@Parameter(title:)`, `AppShortcut.shortTitle`, `AppShortcutPhrase`) extract keys from **compile-time source literals**. Passing a runtime `String` into `LocalizedStringResource(stringLiteral:)` or `IntentDialog(stringLiteral:)` compiles and works in the development language, but generates no catalogue key and ships untranslated.
- `AppShortcut` phrases extract to `AppShortcuts.xcstrings`, separate from `Localizable.xcstrings`.
- Interpolate dynamic counts into literal templates (`"Delete \(count) items"`) using String Catalog / `.stringsdict` plural rules; never concatenate or hand-pluralise.
- For counted entity names, use `TypeDisplayRepresentation(name: "Book", numericFormat: "\(placeholder: .int) books")` with `.stringsdict` rules (`zero`/`one`/`other`).
- User-authored proper nouns belong in `DisplayRepresentation(title: "\(name)")`.
