# Making an Intent Available to Siri as a Tool

**SDK Version:** iOS 27.3, macOS 27.3, visionOS 27.3. Unavailable on watchOS and tvOS.

A *tool intent* is an app intent that Siri's model may choose and fill to fulfill a request. You adopt it with one argument to the existing `@AppIntent` macro: `@AppIntent(.tool)`. Nothing else about the intent changes. Its `perform()`, parameters, and result stay as they are, and it keeps working in Shortcuts, Spotlight, and App Shortcuts.

Siri can call a tool intent when:

- the request names the app,
- the app is in the foreground,
- a Live Activity from the app is running, or
- an entity from the app has been retrieved from search.

## Adopting `@AppIntent(.tool)`

```swift
@available(iOS 27.3, macOS 27.3, visionOS 27.3, *)
@AppIntent(.tool)
struct AddToCart {
    static let title: LocalizedStringResource = "Add to Cart"
    static let description = IntentDescription(
        "Adds a product to the shopping cart."
    )

    @Parameter(title: "Item", description: "The product to add")
    var item: ProductEntity

    @Parameter(title: "Quantity", description: "How many to add", default: 1)
    var quantity: Int

    func perform() async throws -> some IntentResult {
        try await Cart.shared.add(item, quantity: quantity)
        return .result()
    }
}
```

The macro adds a `ToolIntent` conformance, which includes `AppIntent`, so you don't need to write `: AppIntent`. Writing the conformance yourself is equivalent:

```swift
struct AddToCart: AppIntent, ToolIntent { … }
```

Prefer the macro for new intents. It keeps the intent's roles and its schema, if any, in one attribute. For an intent that already ships on releases before 27.3, use a gated extension instead (see "Deployment target below 27.3"). `ToolIntent` has no requirements beyond those of `AppIntent`.

## Writing metadata for the model

Siri's model decides when to call the tool and how to fill it from the intent's metadata. The most important parts are:

- the intent's `title` and `description`
- each parameter's `title` and `description`

Write them for someone who has never seen the app:

- **The intent's description says what it does and what it affects.** Use "Adds a product to the shopping cart," not "Cart action."
- **Add search keywords for words people use that the title and description don't.** Siri also uses the description's `searchKeywords` to retrieve the right tool, for example `IntentDescription("Adds a product to the shopping cart.", searchKeywords: ["basket", "buy"])`. Use words a person would say, not internal terms.
- **Each parameter description says what the value means and its format.** Use "The departure date, in the traveler's local time zone," or "Duration in minutes." Don't just repeat the title.
- **Make every action of a tool clear.** A tool can cover several closely related actions with a mode parameter, for example `action: add | remove`, when they work on the same kind of value. Make the mode an `AppEnum`, and describe each case so the model knows what it does. If the actions take different parameters, or the tool needs a skill to explain which combination does what, separate tools are usually clearer.
- **Similar intents are told apart in their descriptions.** If `Add to Cart` and `Add to Wish List` both exist, each description should make clear which one applies.
- **Add a parameter description when it says more than the title.** Leave it out when the title says everything, such as "Quantity" for an `Int`.

This is the same text that Shortcuts and Spotlight show, so improving it helps everywhere. There's no separate model-only description. Don't invent one.

## What Siri sees from a tool's output

The model reads what a tool returns and what it throws, and uses both to decide what to do next and what to tell the person.

- **Return a value when a later step needs one.** For example, a tool that places an order should return the order, `some ReturnsValue<OrderEntity>`, so the model can pass it to a tool that tracks the delivery. A tool that returns only `.result()` gives the model nothing to continue with.
- **Throw errors whose messages say what went wrong and what would fix it.** Siri sees the error. "That store doesn't deliver on Sundays" lets the model ask for another day. A generic "Operation failed" doesn't. Only errors that conform to `CustomLocalizedStringResourceConvertible` carry a real message, so conform the app's error type to it. See the app-intents-specialist skill's results-and-errors reference.

## Choosing which intents become tools

Make an intent a tool when a person would reasonably ask Siri to do it. That **includes** actions with real-world effects, like buying, booking, sending, or deleting. These are often the most valuable tools. For them:

- Keep, or add, the confirmation the intent would show anywhere else, for example `requestConfirmation` before charging the person.
- For a new intent, confirm before anything that deletes or overwrites the person's data, for example replacing a meal that's already planned. Don't confirm additions that are easy to undo.
- Make the description state the effect plainly, for example "Places the order and charges the saved payment method."

**Tools are always available.** A tool can't be enabled or disabled, so the model can find and call it in any of the situations listed at the top of this reference, such as when the request names the app, whatever the app is doing. Don't make an intent a tool if it only works while the app is running, or only when the app is in a particular UI state, such as a specific screen being open. A tool should work whenever it's called, or throw a clear error that says what the person needs to do.

## Entity parameters the model finds through a query

For a parameter whose type is an app-owned (non-transient) entity, the model gets a value from the app rather than writing one.

**Don't write tools that search for the app's entities.** A "search recipes" or "find products" tool that takes criteria and returns entities duplicates what Siri already does. Siri finds entities itself, through Spotlight and the entity's query, using the mechanisms below. Make the entities findable, and write tools that **act on** an entity and take it as a parameter, like "add this recipe's ingredients to the shopping list." This applies to large or remote catalogs too: make their items entities Siri can find, not results of a search tool.


- **The entity's query must implement `entities(for:)`** to look entities up by identifier. Every non-transient entity a tool uses needs it.
- **Give Siri a way to find candidates.** Siri finds entities from what the person said in two ways. **Prefer `IndexedEntity` wherever the entities can be indexed.** Siri looks them up in Spotlight without launching the app, which is faster and cheaper. It also lets Siri find an entity when the request doesn't name the app. For privacy, Siri sends a query to the app only when the person names the app. `EnumerableEntityQuery` always runs the app's code. Use it for small sets that can't be indexed.

| Mechanism | Use when | What to implement |
|---|---|---|
| `IndexedEntity` | The entities can be indexed in Spotlight. This is the preferred mechanism, and the right one for large or growing sets like documents, recipes, products, or contacts. Lookups don't launch the app. | Conform the entity to `IndexedEntity`, give its searchable properties Spotlight keys such as `@Property(title: "Name", indexingKey: \.displayName)`, and index the entities with Core Spotlight. Indexing is covered in the app-intents-whats-new-27 skill's spotlight-indexing reference. |
| `EnumerableEntityQuery` | The full set is small and bounded, like the person's lists or courses, and indexing doesn't fit. Every lookup runs the app's `allEntities()`. | Conform the query to `EnumerableEntityQuery` and return every entity from `allEntities()`. |

  **For tool intents, Siri doesn't use `suggestedEntities()`, `EntityStringQuery`'s `entities(matching:)`, or `EntityPropertyQuery`.** Siri doesn't call `suggestedEntities()` ahead of time, when it offers the app's tools to the model, so suggested entities aren't surfaced. Keep them if the app already has them, for example for Shortcuts, but don't add them to make an entity findable for a tool.
- **The model reads each entity's `displayRepresentation`** to tell results apart, pick one, or ask the person which one they meant. Make it specific: a title that names the thing, and a subtitle that tells similar ones apart, such as `DisplayRepresentation(title: "\(name)", subtitle: "\(neighborhood)")`. Don't show an internal identifier, such as a UUID or a database ID.
- **Expose and describe the properties Siri needs**, and hide sensitive ones with `visibility: .internal`. The model reads the properties of every entity it sees, whether as a parameter or in a result. See `entity-properties.md`.

## Intents that conform to a schema

Add `.tool` to the `@AppIntent(schema:)` the intent already uses. The result does everything `@AppIntent(schema:)` does, including the schema's conformances and default `@Parameter` attributes, and also adds `ToolIntent`:

```swift
@available(iOS 27.3, macOS 27.3, visionOS 27.3, *)
@AppIntent(.tool, schema: .journal.createEntry)
struct CreateEntryIntent {
    var title: String?
    var message: AttributedString
    var mediaItems: [IntentFile]
    var entryDate: Date?
    var location: CLPlacemark?

    // The schema requires returning an entity that adopts
    // @AppEntity(schema: .journal.entry).
    func perform() async throws -> some ReturnsValue<JournalEntryEntity> { … }
}
```

Adding `.tool` doesn't relax the schema's contract. The intent's parameters and result must still match the schema, and the build reports any mismatch, for example `requires that 'perform()' must return @AppEntity(schema: .journal.entry)`.

**Only Shortcuts-only schema domains can be tools:** `books`, `browser`, `journal`, `presentation`, `reader`, `spreadsheet`, `whiteboard`, and `wordProcessor`. Intents in the Apple Intelligence + Siri primary domains (`audio`, `calendar`, `camera`, `clock`, `files`, `mail`, `maps`, `messages`, `notes`, `phone`, `photos`, `reminders`, `system`) are already handled by Siri. Combining one with `ToolIntent` is a build error, however it's written:

```swift
@AppIntent(.tool, schema: .messages.sendMessage)
struct SendMessageIntent { … }
// ❌ error: 'ToolIntent' can't be adopted by an intent that conforms to
//    '.messages.sendMessage' because the schema is in a primary domain

@AppIntent(schema: .messages.sendMessage)
struct SendMessageIntent: ToolIntent { … }    // ❌ same error

extension SendMessageIntent: ToolIntent {}    // ❌ same error
```

The fix is to remove `.tool` or `ToolIntent`. The schema adoption already makes the intent available to Siri.

## Trait syntax

`AppIntentTraits` is a set. Pass one trait or a list literal:

```swift
@AppIntent(.tool)
@AppIntent([.tool])
@AppIntent(.tool, schema: .journal.createEntry)
@AppIntent([.tool], schema: .journal.createEntry)
```

The macro reads the traits as written in the source:

| Written | Result |
|---|---|
| A trait in a variable, or computed with `union(_:)` | Build error. Write the traits inline. |
| The same trait twice, e.g. `[.tool, .tool]` | Build error |
| `@AppIntent([])` with no schema | Build error |
| `@AppIntent([], schema: …)` | Warning, no effect. Use `@AppIntent(schema:)`. |

## Deployment target below 27.3

The macro uses the availability declared on the type, so which form to use depends on whether the intent already exists on earlier releases:

| Situation | Form |
|---|---|
| The intent already ships, or must stay available, on releases before 27.3. This is the usual case when adopting in an existing app. | Leave the intent as is, and add the conformance in a gated extension. |
| The intent is new and only needs to exist on 27.3 and later | `@AppIntent(.tool)` with `@available` on the type |

**Existing intent.** Don't put `@available(iOS 27.3, …)` on an intent that already ships. That would remove it from Shortcuts, Spotlight, and App Shortcuts on earlier releases.

```swift
struct AddToCart: AppIntent { … }       // unchanged, still available on earlier releases

@available(iOS 27.3, macOS 27.3, visionOS 27.3, *)
extension AddToCart: ToolIntent {}
```

**New intent, 27.3 and later only:**

```swift
@available(iOS 27.3, macOS 27.3, visionOS 27.3, *)
@AppIntent(.tool)
struct AddToCart { … }
```

**Targets that build for watchOS or tvOS.** `ToolIntent` is unavailable on those platforms, so `@available(…, *)` alone isn't enough. Wrap the conformance in `#if !os(watchOS) && !os(tvOS)`. Check the target's supported platforms to decide whether you need it.

## Common pitfalls

- **Adding `.tool` without fixing the metadata.** A tool with the title "Run" and no description is effectively invisible to the model, or gets called for the wrong requests. Review the title and descriptions in the same change.
- **Overlapping with what Siri already does.** A tool that duplicates a built-in Siri feature or a primary-domain schema, such as setting a timer, sending a message, playing music, or controlling home accessories, competes with the system for those requests. Adopt the schema if one fits (see "Intents that conform to a schema"). Otherwise make the title and description say what's specific to the app. The analyzer reports close matches with system schemas as `SMA701` (see `metadata-analyzer.md`).
- **A mode parameter the model can't interpret.** If the cases of a mode or action parameter aren't described, or the right combination of mode and other parameters isn't clear from the metadata, the model guesses. Describe every case, or split the tool.
- **Leaving out the actions people most want.** Purchases, bookings, and other actions with effects should be tools. Keep their confirmation, but don't exclude them.
- **Tools that depend on the app's state.** Tools are always callable whenever Siri can reach the app. A tool that only works while the app is running, or on a particular screen, fails for most requests.
- **Returning nothing useful.** A tool that returns only `.result()`, or throws a generic error, leaves the model nothing to act on.
- **Adding `.tool` to a primary-domain schema intent.** It's a build error, and Siri already handles that intent. See above.
- **Inventing a model-only description or tool name.** No such API exists.
- **Referring to tools by their Swift type name in skills or descriptions.** Write "the Add to Cart tool", using the title in natural language, not `AddToCart`. Within a tool's own description, write "this tool". How Siri represents tool names internally isn't part of the API and can change.
- **Dropping the feature for an older deployment target.** Gate it with `@available` instead.
- **A query Siri can't find candidates with.** A query that only implements `entities(for:)` lets Siri resolve identifiers it already has, but not find a store from "the Market Street store." Add `IndexedEntity`, or `EnumerableEntityQuery` for a small set.
- **A vague or identifier-only `displayRepresentation`.** The model reads it to choose between results. "Store 4417" can't be told apart from other stores. "Market Street", with the subtitle "San Francisco", can.
- **Writing a search or find tool.** Siri finds entities itself through Spotlight and queries. Make the entities findable, and take them as parameters instead.
