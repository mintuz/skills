---
name: swiftui-architecture
description: >
  WHEN building, refactoring, or debugging SwiftUI view hierarchies, state ownership and bindings, Observation-backed services, lifecycle-aware async work, navigation or presentation, or native collection and form layouts;
  NOT for UIKit-only or legacy patterns, App Intent system contracts, or Swift test implementation;
  produces one source of truth per value, native SwiftUI data flow without ViewModels, and verified behavior under the resolved toolchain
---

# Modern SwiftUI Architecture

Treat the view tree as a **source-of-truth graph**: give each mutable value one owner, expose the narrowest mutation surface, and derive UI from that state. Keep transient presentation state in views and reusable business operations in domain models or services; this architecture has no ViewModel layer.

## 1. Resolve the local contract

Inspect the deployment targets, resolved SDK and Swift version, app and scene roots, affected views, state owners, models, services, persistence, routes, every caller, and the closest tests. Trace each requested behavior from its source of truth through view reads, mutations, side effects, persistence, and user-visible result.

Use the related skill that owns each boundary:

- For a reported defect, `app:debug` owns reproduction, root-cause isolation, approval, and before/after evidence; apply this skill to the approved SwiftUI edit.
- When a system surface must discover or run the action, load `app:app-intent-driven-development` before designing that boundary.
- Before adding or changing Swift tests, load `app:swift-testing`.

Preserve the project's working data flow and public behavior outside the requested change. Apply only APIs available to the resolved deployment target; report an availability conflict instead of silently raising the target.

**Complete when:** every requested behavior has an identified source of truth, owner, lifetime, mutation path, side effect, affected caller, platform constraint, and observable proof.

## 2. Load the changed branches

Read every row matching the edit completely before designing it. Select all overlapping rows.

| Changed concern | Read completely |
| --- | --- |
| Local state, ownership, values passed down, callbacks, `@Binding`, or environment scope | [State management](references/state-management.md) |
| Shared mutable model, service, Observation, or dependency injection | [State management](references/state-management.md) and [observable patterns](references/observable-patterns.md) |
| Loading, refresh, search, retry, or cancellation | [Async patterns](references/async-patterns.md) |
| Stack navigation, route data, programmatic navigation, or deep links | [Navigation patterns](references/navigation-patterns.md) |
| Sheet or full-screen presentation | [Navigation patterns](references/navigation-patterns.md) and [sheets](references/sheets.md) |
| Tab selection or independent tab history | [Navigation patterns](references/navigation-patterns.md) and [tabs](references/tabs.md) |
| Standard rows, sections, swipe actions, or selection | [Lists](references/lists.md) |
| Custom or horizontal scrolling and scroll position | [Scroll views](references/scrollview.md) |
| Settings, data entry, focus, or validation | [Forms](references/forms.md) |
| Multi-column or adaptive collections | [Grids](references/grids.md) |
| ViewModel removal or a suspected architecture failure mode | [Anti-patterns](references/anti-patterns.md) and every affected concern above |

Treat bundled examples as patterns, not API-version authority. Resolve conflicts against the installed SDK and current Apple documentation. AppRouter examples apply when the dependency is already resolved or explicitly requested; otherwise retain the project's router or use native `NavigationStack`.

**Complete when:** every changed concern maps to a row, each selected file has been read to the end, and every reference or availability conflict is resolved before editing.

## 3. Design the source-of-truth graph

Assign each value the narrowest stable owner and interface:

- Use private `@State` for view-owned transient values and owned observable models.
- Pass read-only values with `let`, send actions upward with focused closures, and use `@Binding` only when a child edits parent-owned state.
- Use `@Bindable` when a control needs bindings to properties of an `@Observable` model.
- Put a shared observable model or service in `@Environment` at the nearest ancestor common to all consumers. Keep feature-scoped dependencies below the app root.
- Make a type observable only when views observe its changing properties. Keep persistence, networking, and domain side effects behind the project's existing boundary.
- Bind asynchronous work to the view lifecycle with `.task` or `.task(id:)`, propagate cooperative cancellation, and update UI-bound state at the existing actor boundary.
- Represent navigation and presentation as lightweight values with stable identity. Keep one owner for each stack, selected tab, sheet, and full-screen cover.

Keep `body` declarative and co-locate a view's state, actions, loading or error state, and presentation state. Reuse existing types and native SwiftUI before introducing another abstraction or dependency.

**Complete when:** every mutable value, dependency, task, route, and presentation has one owner, explicit lifetime, and bounded mutation surface, and every new type has a current caller and distinct responsibility.

## 4. Implement the smallest complete change

Edit the shared owner rather than patching individual consumers. Preserve stable IDs, actor isolation, accessibility semantics, persistence behavior, route compatibility, and unaffected state restoration.

For a ViewModel migration, first account for every input, output, side effect, loading or error state, and caller. Move transient state into its owning view and reusable operations into the existing domain or service boundary; remove the old layer only after every caller reaches the new source of truth.

For async work, surface loading, success, empty, error, retry, and cancellation states that belong to the requested behavior. For navigation or presentation, keep destination construction exhaustive and keep route payloads independent of view instances.

**Complete when:** affected callers compile against the new source of truth, requested behavior is implemented end to end, old ownership paths are removed, and no orphaned state, route, wrapper, or abstraction remains.

## 5. Verify every changed branch

Run the repository formatter, the smallest affected build and tests, then the containing target. Exercise the runtime branch under the resolved device and OS when behavior is interactive:

- mutate each changed value from every entry point and confirm all dependent views update;
- make async work succeed, fail, retry, and cancel without a stale state write;
- push, pop, deep-link, switch tabs, present, and dismiss for each changed navigation case;
- exercise collection identity, selection, edits, focus, and validation touched by the change;
- compare every requested behavior and preserved caller with the contract from step 1.

A successful build proves compilation, not behavior. Record exact commands and results; name the command, target, device, or state that blocks any check.

**Complete when:** every changed branch has passing build and behavioral evidence under the resolved toolchain, or an explicit blocker without a claimed pass.

## Handoff

Report the source-of-truth graph, selected references, changed files, deployment target and toolchain, build and test commands with results, runtime branches exercised, compatibility decisions, and remaining blockers.
