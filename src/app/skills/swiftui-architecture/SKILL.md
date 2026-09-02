---
name: swiftui-architecture
description: WHEN building SwiftUI views, managing state, setting up shared services, or making architectural decisions; NOT for UIKit or legacy patterns; provides pure SwiftUI data flow without ViewModels using @State, @Binding, @Observable, and @Environment.
---

# Modern SwiftUI Architecture

Concise entry point for pure SwiftUI architecture without ViewModels. Use the references for patterns, examples, and edge cases.

## Scope

This skill covers SwiftUI views and their data flow.

When a request asks you to restructure UIKit or AppKit code, say that this guidance does not cover that code. Leave its internals alone. Answer at the boundary instead:

- Wrap an existing view controller in `UIViewControllerRepresentable` to show it in SwiftUI.
- Wrap an existing view in `UIViewRepresentable` only when a `UIView` is already separated from its controller.
- Use `UIHostingController` for the opposite direction, to show a SwiftUI view inside UIKit.
- On macOS, use `NSViewControllerRepresentable`, `NSViewRepresentable`, and `NSHostingController` in the same three roles.

Keep the wrapped code's state where it already lives. Pass the SwiftUI side's values into the wrapper. Send the wrapper's events back out through a callback.

## Start Here

- State management: `references/state-management.md`
- Observable services: `references/observable-patterns.md`
- Async work: `references/async-patterns.md`
- Navigation: `references/navigation-patterns.md`
- UI components: `references/lists.md`, `references/scrollview.md`, `references/forms.md`, `references/grids.md`, `references/sheets.md`, `references/tabs.md`
- Anti-patterns: `references/anti-patterns.md`

## Typical Flow

1. Give every mutable value and dependency one owner and lifetime (`references/state-management.md`).
   - Keep a value in `@State` in the view that uses it.
   - Lift it to the nearest common ancestor when sibling views read it. Pass it down as an argument or a `@Binding`.
   - Move it into a shared `@Observable` service only when it must outlive that ancestor, when it is domain state that unrelated features read, or when passing it down would thread it through views that do not use it. A value in a service takes the service's lifetime, so it stays set after the screen closes.
   - Retain each shared service once with `@State`. Inject each service separately through the environment. Mutate shared state through actions on the service.
2. Keep views declarative and business logic in the injected services (`references/observable-patterns.md`).
3. Give every async path one owner and one lifetime (`references/async-patterns.md`).
   - Use `.task` for work that starts with the view.
   - Use `.task(id:)` for work that must restart when an input changes. SwiftUI cancels the running task when that identity changes and when the view disappears. Put any debounce inside that task.
   - Start no input-driven work from `onChange` with an unstructured `Task`.
   - For work a user triggers, hold the `Task` in `@State`. Cancel the previous one before you start the next. State what happens to an in-flight task when the view disappears.
   - Tie each result to the input that produced it, so a superseded result never renders as the current one.
   - Check `Task.isCancelled` immediately before every write to view state that follows an await, because a cancelled task keeps running until it checks.
   - Treat cancellation as a non-error outcome. Let a retry re-enter the same path.
4. Wire navigation with `NavigationStack` and typed destinations. Follow `references/navigation-patterns.md` when the project already depends on the AppRouter package.
5. Build UI using the matching component guides. Audit every decision against `references/anti-patterns.md`.

Finish when every value and service has one stated owner, data flows down and actions up, and every async path has explicit cancellation and terminal-state behavior.
