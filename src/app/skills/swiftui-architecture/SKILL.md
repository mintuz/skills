---
name: swiftui-architecture
description: WHEN building SwiftUI views, managing state, setting up shared services, or making architectural decisions; NOT for UIKit or legacy patterns; provides pure SwiftUI data flow without ViewModels using @State, @Binding, @Observable, and @Environment.
---

# Modern SwiftUI Architecture

Concise entry point for pure SwiftUI architecture without ViewModels. Use the references for patterns, examples, and edge cases.

## Start Here

- State management: `references/state-management.md`
- Observable services: `references/observable-patterns.md`
- Async work: `references/async-patterns.md`
- Navigation: `references/navigation-patterns.md`
- UI components: `references/lists.md`, `references/scrollview.md`, `references/forms.md`, `references/grids.md`, `references/sheets.md`, `references/tabs.md`
- Anti-patterns: `references/anti-patterns.md`

## Typical Flow

1. Give every mutable value and dependency one owner and lifetime (`references/state-management.md`): keep UI-only state local; retain each shared `@Observable` service once with `@State`, inject it separately through the environment, and mutate shared state through actions.
2. Keep views declarative and business logic in the injected services (`references/observable-patterns.md`).
3. Bind async work to the view lifecycle with `.task` or `.task(id:)` (`references/async-patterns.md`). Choose the previous-result policy explicitly: clear input-scoped results before debouncing when they must not appear under a new input; when the product intentionally uses stale-while-refresh, label the retained result with its source input. Make empty input, cancellation, loading/error state, stale-result exclusion, and retry through the same structured path explicit.
4. Wire navigation with AppRouter (`references/navigation-patterns.md`).
5. Build UI using the matching component guides, then audit every decision against `references/anti-patterns.md`.

Finish when every value and service has one stated owner, data flows down and actions up, and every async path has explicit cancellation and terminal-state behavior.
