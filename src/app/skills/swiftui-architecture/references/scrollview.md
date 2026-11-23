# ScrollView Patterns

## When to Use ScrollView

- **Custom vertical layouts**: Content not fitting List row structure
- **Horizontal scrolling**: Chips, tags, media strips, carousels
- **Mixed content**: Combining different layout types
- **Chat interfaces**: Custom message layouts with input toolbars

Use List instead for:
- Standard vertical feeds with consistent row structure
- Settings screens with sections
- Simple data tables

## Basic Patterns

### Vertical Scrolling

```swift
ScrollView {
    LazyVStack(spacing: 16) {
        ForEach(items) { item in
            CustomCard(item: item)
        }
    }
    .padding()
}
```

Use `LazyVStack` for large collections to defer loading, and a plain `VStack` for small, predetermined content.

### Horizontal Scrolling

```swift
ScrollView(.horizontal) {
    LazyHStack(spacing: 12) {
        ForEach(tags) { tag in
            TagChip(title: tag.name)
        }
    }
    .padding(.horizontal)
}
.scrollIndicators(.hidden)
```

## Scroll Position Management

### Scroll to Position

```swift
struct ChatView: View {
    @State private var messages: [Message] = []

    var body: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack {
                    ForEach(messages) { message in
                        MessageRow(message: message)
                            .id(message.id)
                    }
                }
            }
            .onChange(of: messages) { _, _ in
                // Scroll to latest message
                if let lastID = messages.last?.id {
                    withAnimation {
                        proxy.scrollTo(lastID, anchor: .bottom)
                    }
                }
            }
        }
    }
}
```

### Track Scroll Geometry (iOS 18+)

Use `onScrollGeometryChange` and coarsen values into a boolean or bucket rather than writing per-frame raw offsets into `@Environment` or broad `@State` (see `references/environment.md`). For purely visual scroll effects (scale, opacity, rotation), prefer `scrollTransition` or `visualEffect(in:)`.

```swift
struct TrackingScrollView: View {
    let items: [Item]
    @State private var isScrolledPastHeader = false

    var body: some View {
        ScrollView {
            LazyVStack {
                ForEach(items) { item in
                    ItemView(title: item.name, date: item.date)
                }
            }
        }
        .onScrollGeometryChange(for: Bool.self) { geometry in
            geometry.contentOffset.y > 120
        } action: { _, passed in
            isScrolledPastHeader = passed
        }
    }
}
```

## Layout Patterns

### Grid Layout

```swift
ScrollView {
    LazyVGrid(
        columns: [
            GridItem(.adaptive(minimum: 100, maximum: 200))
        ],
        spacing: 16
    ) {
        ForEach(items) { item in
            GridCell(item: item)
                .aspectRatio(1, contentMode: .fit)
        }
    }
    .padding()
}
```

### Chat with Input Toolbar

```swift
struct ChatView: View {
    @State private var messages: [Message] = []
    @State private var inputText = ""
    @FocusState private var inputFocused: Bool

    var body: some View {
        VStack(spacing: 0) {
            ScrollView {
                LazyVStack {
                    ForEach(messages) { message in
                        MessageBubble(message: message)
                    }
                }
            }
            .scrollDismissesKeyboard(.interactively)

            // Input bar
            HStack {
                TextField("Message", text: $inputText)
                    .focused($inputFocused)
                    .textFieldStyle(.roundedBorder)

                Button("Send") {
                    sendMessage()
                }
                .disabled(inputText.isEmpty)
            }
            .padding()
            .background(.background)
        }
    }

    private func sendMessage() {
        // Send message logic
        inputText = ""
    }
}
```

**Alternative**, using `.safeAreaInset`:

```swift
ScrollView {
    LazyVStack {
        ForEach(messages) { message in
            MessageBubble(message: message)
        }
    }
}
.safeAreaInset(edge: .bottom) {
    HStack {
        TextField("Message", text: $inputText)
        Button("Send") { sendMessage() }
    }
    .padding()
    .background(.thinMaterial)
}
```

## Keyboard Handling

### Dismiss Keyboard on Scroll

```swift
ScrollView {
    LazyVStack {
        // Content
    }
}
.scrollDismissesKeyboard(.interactively)  // Dismiss while scrolling
// or
.scrollDismissesKeyboard(.immediately)    // Dismiss when scroll starts
```

## Performance

### Use Lazy Containers

```swift
// Good: Lazy loading for large collections
ScrollView {
    LazyVStack {
        ForEach(hundreds) { item in
            HeavyView(item: item)
        }
    }
}

// Bad: All views created upfront
ScrollView {
    VStack {
        ForEach(hundreds) { item in
            HeavyView(item: item)  // All rendered immediately!
        }
    }
}
```

### Avoid Expensive Operations in Rows

Keep `View.init` and `body` free of `DateFormatter` allocations, JSON decoding, or file I/O. For dates and numbers, use SwiftUI's cached, locale-aware `Text(_:format:)` directly in `body` (see `references/structure.md` and `references/localization.md`):

```swift
// Good: Narrow inputs and cached locale-aware formatting
struct ItemView: View {
    let title: String
    let date: Date

    var body: some View {
        VStack(alignment: .leading) {
            Text(title)
            Text(date, format: .dateTime.day().month().year())
        }
    }
}

// Bad: Allocating DateFormatter in init or body on every render
struct BadItemView: View {
    let item: Item
    let formattedDate: String

    init(item: Item) {
        self.item = item
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        self.formattedDate = formatter.string(from: item.date)
    }

    var body: some View {
        VStack(alignment: .leading) {
            Text(item.name)
            Text(formattedDate)
        }
    }
}
```

## Common Mistakes

- **Nesting ScrollViews on the same axis**: creates gesture conflicts
- **Competing scroll views**: multiple scrollable areas fight for gestures
- **Missing keyboard dismissal**: forms without `.scrollDismissesKeyboard()`
