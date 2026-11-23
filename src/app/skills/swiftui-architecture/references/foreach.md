# `ForEach`, `List`, and Collection Performance

These rules apply to `ForEach`, `List(_:id:rowContent:)`, `List(_:rowContent:)`, `List(_:id:selection:rowContent:)`, `Table`, `OutlineGroup`, `List(_:children:rowContent:)`, and `ForEach` inside `Picker` or `DisclosureGroup`.

## Element Identity

- **Never use indices or offsets as identity:** Avoid `ForEach(items.indices, id: \.self)` and `ForEach(items.enumerated(), id: \.offset)`. Insertions, deletions, and reorders corrupt row state and break animations.
- **Use `.enumerated()` with element identity when an index is needed:** Write `ForEach(items.enumerated(), id: \.element.id)` and pass the index as row data. On Swift 6.1+, `.enumerated()` conforms conditionally to `RandomAccessCollection`, so pass `items.enumerated()` directly without wrapping in `Array(...)` (use `Array(...)` only on pre-Swift 6.1 toolchains).
- **No transient IDs in `body`:** Even `let id = UUID()` fails if elements are constructed inside `body` (for example `titles.map { Item(title: $0) }`). Store synthesized IDs in durable state (`@State`, `@Observable`, database) or derive `id` from an immutable (`let`) natural key.
- **Immutable identity:** Never derive `id` from a field mutated in place (for example `var id: String { title }` while editing `title` destroys the row and drops focus on every keystroke).
- **Use `Identifiable` selectively:** Conform types with natural identity to `Identifiable`. For types without natural identity, pass an explicit `id:` key path instead of forcing `Identifiable`.
- **Keep `id` cheap to hash:** Avoid `id: \.self` on large `Hashable` structs (hashes every field on every diff). Key by a small primitive (`UUID`, `Int`, short `String`, `URL`), leaving the struct's `Hashable` conformance intact.

## Cache Derived Collections

Never sort, filter, deduplicate, or group inline inside `ForEach` or `List` in `body` (`ForEach(items.filter(...))`).

- Cache derived collections on an `@Observable` model (updated via `didSet` or mutating methods), or in local `@State` updated via `.onChange(of:)` for view-local filters.
- Cheap O(1) slices such as `prefix(n)` or already-prepared arrays are safe inline.

## Unary Row Views and the `List` Fast Path

`List` materialises all row IDs upfront. When a row builder produces a constant single top-level view (**unary**), SwiftUI templates IDs from the `ForEach` element ID without evaluating every row's `body`.

These patterns are **multi-shape** and defeat the fast path (forcing O(N) body evaluation):

- Top-level `switch` or `if`/`else` inside the `ForEach` closure
- Multiple sibling views in the row closure
- Bare top-level `if` without `else` (produces 0 or 1 views; filter the collection upstream instead)
- `AnyView` rows (erases structural identity and defeats templating)

Note: `Group` and `ForEach` are passthroughs and do **not** make a row unary. Replacing `AnyView` with a `@ViewBuilder` helper returning `some View` still produces a multi-shape `_ConditionalContent` row.

**Fix:** Wrap branching row content in a concrete row `View` struct with a single-root container (`VStack`, `HStack`, `ZStack`, or custom wrapper). Do not flatten structurally distinct branches into one view with conditional modifiers.

```swift
struct FeedRowView: View {
    let item: FeedItem

    var body: some View {
        HStack {
            switch item.kind {
            case .text(let body):
                TextRowContent(body: body)
            case .photo(let url):
                PhotoRowContent(url: url)
            }
        }
    }
}
```

## Diagnostic Launch Argument

Launch the app with `-LogForEachSlowPath YES` to log every `ForEach` inside lazy containers (`List`, `LazyVStack`, etc.) whose row builder produces a non-constant number of views.
