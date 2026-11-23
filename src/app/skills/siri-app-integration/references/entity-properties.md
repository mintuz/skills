# Describing Entity Properties for Siri

**SDK Version:** `description:`, `authenticationPolicy:`, and `visibility:` on entity properties, and `IntentVisibility`, are available in 27.3 on every platform. The `indexingKey:` and `customIndexingKey:` variants are limited to iOS, macOS, and visionOS.

This applies to **every entity Siri's model sees**, not only generable ones:

- **Entities the model reads.** These are app-owned entities used as tool parameters or returned from tools. The model reads their properties to tell entities apart, to answer questions about them, and to pass values on to the next tool.
- **Entities the model writes.** These are generable entities (see `generable-entities.md`). The model reads each property's title and description to decide what to write in it.

## What the model reads

For each entity, the model reads:

- its `displayRepresentation`, which it uses to tell results apart, pick one, or ask the person which one they meant
- each property exposed with `@Property`, `@ComputedProperty`, or `@DeferredProperty`, with its title and `description`

An entity that exposes no properties gives the model only its display representation. The analyzer reports this as `SMA601`. A property without a description is `SMA203`.

## Example

```swift
struct StoreEntity: AppEntity, IndexedEntity {
    static let typeDisplayRepresentation: TypeDisplayRepresentation = "Store"
    static let defaultQuery = StoreQuery()

    var id: String

    @Property(title: "Name", description: "The store's name, such as Market Street",
              indexingKey: \.displayName)
    var name: String

    @Property(title: "City", description: "The city the store is in")
    var city: String

    @Property(title: "Closing Time", description: "When the store closes today, in its local time zone")
    var closesAt: Date

    @Property(title: "Tax ID", visibility: .internal)
    var taxID: String

    var displayRepresentation: DisplayRepresentation {
        DisplayRepresentation(title: "\(name)", subtitle: "\(city)")
    }
}
```

## Choosing which properties to expose

Expose what the model needs to do the app's tasks:

- what tells similar entities apart, such as the city of a store or the author of a recipe
- what people ask about, such as a store's closing time or an order's status
- what a later tool step needs, such as a flight's departure time before booking a car

Don't expose internal bookkeeping, such as row IDs or sync tokens. Hide sensitive values with `visibility: .internal` (see below).

## Writing titles and descriptions

Write for someone who has never seen the app.

- **The title names the property** in a word or short phrase: "Closing Time," not "Time."
- **The description says what the property holds.** It also says how to interpret the value, including its unit, time zone, or format, and gives an example when the format matters: "When the store closes today, in its local time zone," or "Length of the lesson in minutes, such as 45." Don't just repeat the title.
- **For a property the model writes**, such as one in a generable entity, the description has to be precise enough to write a correct value from. Use "IATA code of the departure airport, such as SFO," not "Origin." Otherwise the model might write "San Francisco" when the app expects "SFO."
- **Use an `AppEnum`** instead of a `String` when there's a fixed set of values, such as a cabin class or an order status.

## Arguments

`@Property`, `@ComputedProperty`, and `@DeferredProperty` take the same optional, labeled arguments, in this order:

| Argument | Use |
|---|---|
| `title:` | A word or short phrase naming the property. If you omit it, a title is generated from the property name. |
| `description:` | What the property holds and how to interpret it. Siri's model reads it. |
| `authenticationPolicy:` | The authentication the system requires before it reads the property, such as `.requiresAuthentication`. Use `nil` to apply the entity's policy. |
| `visibility:` | `.default` or `.internal`. See below. |
| `indexingKey:` or `customIndexingKey:` | The Spotlight attribute the property maps to, for an `IndexedEntity` (see `tool-intents.md`). |

```swift
@Property(title: "Name", description: "The store's name, such as Market Street", indexingKey: \.displayName)
var name: String

@ComputedProperty(title: "Open Now", description: "Whether the store is open at this moment")
var isOpen: Bool { hours.contains(.now) }
```

For when to use `@ComputedProperty` and `@DeferredProperty`, see the app-intents-whats-new-27 skill's convenience-properties reference. A `@DeferredProperty` isn't included when the system indexes an `IndexedEntity`.

## Hiding sensitive properties

`visibility: .internal` keeps a property available to the app and its extensions, such as widgets and controls. System features such as Siri, Shortcuts, and the model don't see it. Use it for sensitive values, like tax IDs, account numbers, or medical details, that the app's own intents and widgets need but Siri shouldn't read.

```swift
@Property(title: "Tax ID", visibility: .internal)
var taxID: String
```

**Don't combine `.internal` with `indexingKey:` or `customIndexingKey:`.** Indexing makes the property discoverable through Spotlight.

## Entities that also ship before 27.3

`description:`, `authenticationPolicy:`, and `visibility:` require 27.3, and Swift can't mark a stored property as available only on newer releases. So on an entity that isn't itself `@available(… 27.3, …)`, these arguments fail to build when the deployment target is earlier than 27.3:

```
error: 'init(title:description:authenticationPolicy:visibility:)' is only available in iOS 27.3 or newer
```

Until the deployment target reaches 27.3:

- Make the title carry the meaning, for example "Closing Time (Local)" or "Origin Airport Code."
- Spell out formats in the description of the tool parameter that uses the entity.
- **Don't expose a sensitive property that you can't hide with `.internal` yet.** Leave it out of the entity's properties.

A new entity that's `@available(iOS 27.3, macOS 27.3, visionOS 27.3, *)`, like most generable entities, can use these arguments at any deployment target.

## Common pitfalls

- **Treating descriptions as only for generable entities.** The model reads the properties of every entity it sees. Describe the properties of app-owned entities too.
- **An entity with no exposed properties.** The model sees only the display representation (`SMA601`).
- **Descriptions that repeat the title**, such as "Name" → "The name." Say what it holds and how to read it.
- **Missing units, time zones, or formats.** The model can misread or miswrite the value.
- **Exposing sensitive values to Siri.** Use `visibility: .internal`, or don't expose the property.
- **Combining `.internal` with an indexing key.** The property becomes discoverable through Spotlight anyway.
- **Using `description:` or `visibility:` on an entity that ships before 27.3** with an earlier deployment target. It doesn't build. Use the fallback above.
