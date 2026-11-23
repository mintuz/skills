# Soft-Deprecated SwiftUI APIs

Soft-deprecated APIs carry `@available(..., deprecated: 100000.0)` in SDK headers: they emit no compiler warning, but signal that new code should use a modern replacement.

Verify whether an API is soft-deprecated against `references/soft-deprecated-apis.md` (166 entries from SDK 27.0) rather than relying on memory, and inspect SDK headers for `deprecated: 100000.0` on newer SDKs.

## Strict Scoping Rule

This rule takes precedence even when a prompt asks for "other observations" or "additional notes":

- Discuss soft-deprecated APIs **only** in views directly modified or explicitly reviewed for the user's request.
- Never mention, flag, or offer to migrate soft-deprecated APIs in untouched views in the same file, and never proactively scan outside the requested code.

## Mode-Specific Behaviour

- **Generating new code:** Never generate or recommend soft-deprecated APIs (for example `NavigationView`, `TabView(selection:)` with `.tabItem`, `ScrollView(showsIndicators:)`, `foregroundColor(_:)`, `cornerRadius(_:)`, `edgesIgnoringSafeArea(_:)`, `coordinateSpace(name:)`).
- **Review, refactor, modernise, or clean up:** Flag soft-deprecated APIs inside the requested scope as informational (not urgent) and give their modern replacements from `references/soft-deprecated-apis.md`.
- **Feature addition or bug fix:** If the edited view already uses a soft-deprecated API, keep it unchanged in the code diff and add a brief trailing note offering migration as a separate step. Ignore soft-deprecated APIs in untouched views completely.
