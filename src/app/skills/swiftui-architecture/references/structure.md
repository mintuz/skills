# View Structure and Invalidation Boundaries

## Separate `View` Structs for Sections

A `View` struct is SwiftUI's unit of invalidation. Computed properties (`private var header: some View`) and `@ViewBuilder` helper methods inline into the enclosing `body` and share its invalidation boundary.

- Declare each named section of a multi-section view (header/list/footer, sidebar/main, content/counter, product detail sections) as its own `struct` conforming to `View` with narrow inputs.
- Keep computed properties or `@ViewBuilder` helpers only for tiny fragments reused 2–3 times inside the same `body` that have no independent invalidation boundary.

```swift
struct ProductDetailView: View {
    let product: Product

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                ProductHeaderView(title: product.title, price: product.price)
                ProductGalleryView(imageURLs: product.imageURLs)
                ProductReviewsView(productID: product.id)
            }
        }
    }
}
```

## Keep `View.init` Constant-Time

SwiftUI invokes `View.init` every time the parent re-evaluates `body` (frequently in `List`, `LazyVStack`, scroll containers, and animated views). `init` is not a one-time setup hook.

- Never load data, decode JSON (`JSONDecoder().decode`), read the file system, allocate `DateFormatter`, format dates, or build large collections in `init`.
- Pass prepared values, load/decode in the model layer or `.task`, and format dates with SwiftUI's cached, locale-aware `Text(date, format: .dateTime.day().month().year())` in `body`.
- When a derived value must be computed once and cached for the view's lifetime, store it on a `@State`-owned `@Observable` model or compute it in `.task`.

## Avoid Single-Child `Group`

`Group { SomeView() }` wraps one concrete child in `Group<SomeView>`. Every chained modifier must type-check against `Group<SomeView>` for no benefit. Drop the `Group` and apply modifiers directly to the child.

Valid `Group` uses:

- Wrapping a `ForEach`
- Applying shared modifiers to a `TupleView` of multiple sibling views without adding a layout container
- Wrapping an `if`/`else` or `switch` (`_ConditionalContent`) so shared modifiers apply uniformly across branches
