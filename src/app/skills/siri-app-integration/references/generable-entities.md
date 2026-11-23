# Letting the Model Write Entity Values

**SDK Version:** iOS 27.3, macOS 27.3, visionOS 27.3. Unavailable on watchOS and tvOS.

When Siri calls a tool intent, it fills the parameters from the conversation. For most entities, the model has to find an existing value through the entity's query. Some entities aren't stored anywhere. They're plain values the model can write from what the person said, like a study plan, a draft message, or a delivery window. Mark those with `@AppEntity(.generable)`, and the model writes the value directly. `perform()` receives it, and no query runs.

## When to use it

Use `.generable` when **all** of these are true:

- The type is a `TransientAppEntity`. It describes a value, not an object the app stores and looks up.
- The model can write a complete value from the request without the app looking anything up.
- Every property is something the model can write (see "What a generable entity can contain").
- **The value is something a tool acts on**, such as a plan to set, a draft to send, or a window to schedule.

Don't use it for:

- **Objects the app owns**, like products, contacts, documents, or orders. Those stay ordinary `AppEntity` types with a query.
- **Search criteria.** Don't write a "search" or "find" tool that takes generable criteria and returns entities. Siri finds entities itself, through Spotlight and the entity's query (see `tool-intents.md`).

## A generable entity vs. separate parameters

When a tool needs several related values, group them into one generable entity rather than spreading them over a long list of parameters:

- **Define and document the values once, and reuse them.** A flight-tracking app can define a `FlightInfo` once and use it in several intents and as a property of other entities, with one set of titles and descriptions for the model and the person.
- **Group values by meaning.** One property holding a `FlightInfo` replaces five properties with a common prefix, like `flightNumber`, `flightDate`, and `flightOrigin`, that are grouped only by name.
- **Use the same type as input and output.** A tool returns a single value, while it can take many parameters. A generable entity can be what one tool takes and what another returns. For example, "Get Study Plan" can return the `StudyPlan` that "Set Study Plan" takes.
- **Get every entity feature,** including ones added later, such as annotating onscreen content with an entity (see the app-intents-whats-new-27 skill's onscreen-entities reference).
- **Describe the whole value**, with a type display representation and an instance display representation. A list of parameters can't do that.

Keep a separate parameter for a single value that stands on its own, such as a quantity or a yes/no choice, and for app-owned entities that Siri finds (see "What a generable entity can contain").

## Adopting `@AppEntity(.generable)`

```swift
@available(iOS 27.3, macOS 27.3, visionOS 27.3, *)
@AppEntity(.generable)
struct StudySession {
    static let typeDisplayRepresentation: TypeDisplayRepresentation = "Study Session"

    @Property(title: "Duration", description: "Length of the session in minutes, such as 15")
    var minutes: Int

    @Property(title: "Skill", description: "What the session practices")
    var skill: StudySkill        // an AppEnum: .vocabulary, .grammar, .listening, .speaking

    var displayRepresentation: DisplayRepresentation {
        DisplayRepresentation(title: "\(minutes) min")
    }

    init() {}
}

@available(iOS 27.3, macOS 27.3, visionOS 27.3, *)
@AppEntity(.generable)
struct StudyPlan {
    static let typeDisplayRepresentation: TypeDisplayRepresentation = "Study Plan"

    @Property(title: "Daily Sessions", description: "The sessions to do each day, in order")
    var sessions: [StudySession]

    @Property(title: "Exam Date", description: "The day of the person's exam, if they have one. Leave empty when there's no exam.")
    var examDate: Date?

    var displayRepresentation: DisplayRepresentation {
        DisplayRepresentation(title: "\(sessions.count) sessions a day")
    }

    init() {}
}

@available(iOS 27.3, macOS 27.3, visionOS 27.3, *)
@AppIntent(.tool)
struct SetStudyPlan {
    static let title: LocalizedStringResource = "Set Study Plan"
    static let description = IntentDescription(
        "Replaces a course's daily study plan with a new set of practice sessions."
    )

    @Parameter(
        title: "Plan",
        description: "The new daily plan, as practice sessions. For example, 10 minutes of vocabulary, then 15 minutes of listening."
    )
    var plan: StudyPlan

    @Parameter(title: "Course", description: "The course whose plan to replace")
    var course: CourseEntity     // app-owned; Siri finds it through its query

    func perform() async throws -> some ReturnsValue<StudyPlan> {
        try await StudyPlanner.shared.apply(plan, to: course)
        return .result(value: plan)
    }
}
```

When the person says "for my Spanish course, plan 10 minutes of vocabulary and 15 minutes of listening every day until my exam on June 3", the model writes the `StudyPlan`, including its sessions and exam date. Siri finds the Spanish course through `CourseEntity`'s query, and `perform()` receives both.

The macro adds a `GenerableEntity` conformance, which includes `TransientAppEntity`, so you don't need to write `: TransientAppEntity`. Writing the conformance yourself is equivalent:

```swift
struct StudyPlan: TransientAppEntity, GenerableEntity { … }
```

Prefer the macro for new entities, to match `@AppIntent(.tool)`. For an entity that already ships on releases before 27.3, use a gated extension instead (see "Deployment target below 27.3").

## Property descriptions

The model writes each property from its title and `description`, so **every property of a generable entity needs a description precise enough to write a correct value from.** State the format or unit and give an example, such as "in minutes, such as 15," "in kilograms," or "ISO 4217 currency code." Also describe the overall shape in the tool parameter's description, as `SetStudyPlan` does above.

The arguments, `visibility:`, and the deployment-target rules are the same as for every entity. See `entity-properties.md`.

## What a generable entity can contain

Every property must be one of these, or an array of one:

- a value type supported by `@Property`, such as `String`, `Int`, `Double`, `Bool`, `Date`, `URL`, or `Measurement`
- an `AppEnum`
- another generable entity, like `StudySession` above

Optional properties, such as `Date?` or `String?`, are allowed. Use them for values the person might not give, like `examDate` above, and say in the description what leaving them out means. Don't invent sentinel values like "0 means no exam."

A property whose type is an app-owned (non-generable) entity is a **build error**, because the model can't create that value:

```swift
@AppEntity(.generable)
struct StudyPlan {
    @Property(title: "Course") var course: CourseEntity
    // ❌ error: 'StudyPlan' is a 'GenerableEntity', but property 'course' is
    //    'CourseEntity', which the model cannot author. Make 'CourseEntity' a
    //    'GenerableEntity', or remove the property from the generable entity.
}
```

While this error remains, no App Intents metadata is exported for the target, so none of the app's intents reach Siri.

**Fix:** make the app-owned entity a **separate parameter** on the intent, as `SetStudyPlan` does with `course`. Siri finds that one through the entity's query or Spotlight, as usual. Don't make `CourseEntity` generable just to silence the error. That's only right if courses really are plain values the model can write and the app never needs to look one up.

## Entities that conform to a schema

`@AppEntity(.generable, schema:)` does everything `@AppEntity(schema:)` does and also adds `GenerableEntity`. **None of today's entity schemas are transient, though, so there's currently no schema this applies to.** Don't add `.generable` to an existing `@AppEntity(schema:)` entity.

## Trait syntax

`AppEntityTraits` follows the same rules as `AppIntentTraits` (see `tool-intents.md`):

```swift
@AppEntity(.generable)
@AppEntity([.generable])
```

A trait in a variable or computed value, a trait listed twice, or an empty list without a schema is a build error. An empty list with a schema is a warning.

## Deployment target below 27.3

Use the same rule as for tool intents (see `tool-intents.md`):

- **Existing entity** that already ships on earlier releases, or is used by intents that do: leave it as is, and add the conformance in a gated extension. Don't put `@available(iOS 27.3, …)` on the type.
- **New entity** used only by 27.3-and-later tool intents: use `@AppEntity(.generable)` with `@available(iOS 27.3, macOS 27.3, visionOS 27.3, *)` on the type.
- **Targets that build for watchOS or tvOS:** also wrap the conformance in `#if !os(watchOS) && !os(tvOS)`.

```swift
struct StudyPlan: TransientAppEntity { … }   // unchanged

@available(iOS 27.3, macOS 27.3, visionOS 27.3, *)
extension StudyPlan: GenerableEntity {}
```

## Changing an existing entity's shape

Fixing a generable entity sometimes means moving a property out of the entity and into a new intent parameter (see "What a generable entity can contain"). That changes the intent's parameters. Saved shortcuts that run the intent will now ask for the new parameter, or fail if it's required and has no default. **Tell the developer about this change. Don't make it silently.** When you can, make the new parameter optional.

## Common pitfalls

- **Writing a search tool around a generable entity.** Siri finds the app's entities itself. Make the entities findable (see `tool-intents.md`) and write tools that act on them.
- **Making a stored, app-owned entity generable.** The model would invent values that don't exist in the app. Keep it a queried `AppEntity`.
- **Putting an app-owned entity inside a generable entity.** It's a build error. Move it to its own intent parameter.
- **Leaving property descriptions empty or vague.** The model guesses the format and gets it wrong. State the format or unit, with an example.
- **Applying `.generable` to a type that isn't a `TransientAppEntity`.** `GenerableEntity` refines `TransientAppEntity`.
- **Adding `.generable` to a schema entity.** No current entity schema is transient.
- **Expecting a query to run.** For a generable parameter, `perform()` receives the model's value directly. Validate it in `perform()` (for example, reject a plan with no sessions with a clear error), and don't expect a query to have checked it.
