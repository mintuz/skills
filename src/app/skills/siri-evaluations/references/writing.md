# Write: Siri scenarios and expectations

This stage turns the app's App Intents into a SiriEvaluations test file that documents turn-based
scenarios (what the user says) and trajectory expectations (which intent Siri must call, how it must
fill the parameters, which entities it must find, and what it must reply).

## Guardrails

- A test file should import `SiriEvaluations` and `Testing`, and nothing else:

  ```swift
  import SiriEvaluations
  import Testing
  ```

  SiriEvaluations re-exports AppIntentsTesting (`IntentDefinitions`, `.expect`, `.expectIdentifier`,
  `.result`, the value matchers) and Evaluations (`.evaluates`, `EvaluationContext`), so never add
  `import AppIntentsTesting` or `import Evaluations`. `Testing` is the one import the framework can't
  re-export.
- If the app ships App Skills, the suite should cover every one of them with a `Loads` expectation (see
  "Covering App Skills"). A suite that only checks intents leaves the skills untested.
- Never invent intent, entity, parameter, or identifier names. Every name in an expectation must be
  read from the app's source.
- Never change the app's App Intents code while writing scenarios. Writing tests and fixing the app
  are separate stages; the failures will tell you what to fix.
- Scenarios exercise real Siri on a real device. Keep a suite small and meaningful (a handful of
  scenarios per intent). It does not need to be exhaustive.

## Workflow

1. **Inventory the app's App Intents surface.** Do not guess:
   - the app's bundle identifier (the app target's `PRODUCT_BUNDLE_IDENTIFIER`)
   - every type conforming to `AppIntent` (and its `@Parameter` properties, their types, whether
     they're optional, and the intent's `title`/`description`)
   - every `AppEntity` (its properties, its `EntityQuery`, the identifiers its entities use, and
     whether it's `IndexedEntity` or otherwise donated to Spotlight)
   - the App Skills the app ships: the instructions Siri loads to decide and chain the app's intents.
     They live in a `*.skillsbundle` in the app target's resources, one `Skills/<folder>/SKILL.md`
     per skill (`find . -name '*.skillsbundle' -not -path '*/DerivedData/*'`). For each, note the
     frontmatter `name:` (the key for `skills["…"]`), its `description`, and which intents its
     instructions call, ask about, or forbid.
   Identifiers used in expectations are the Swift type names (`CreateEventIntent`, `EventEntity`) and
   the Swift property names of parameters and entity properties (`title`, `calendar`).
2. **Choose what to cover.** Prioritize, in order: the app's primary actions, intents with entity
   parameters, multi-step flows (find then act), and destructive intents (to assert Siri does *not*
   call them when it shouldn't). Add at least one scenario per App Skill.
   Confirm the list with the developer if the app has more than a few intents.
3. **Write utterances** the way a user would speak them. Keep them natural, one request per turn,
   and name the app ("In <app name>, …") unless the scenario is deliberately testing app-less
   routing. Add paraphrases as separate scenarios, not as extra turns. Use values the device will
   actually have (an entity the user must have created, a calendar that exists). If a scenario needs
   state, set it up in the evaluation's `subject(from:)` before `SiriService.run(scenario:)` with what
   the app already has (its own App Intents, run through AppIntentsTesting), and clean up after the
   run, recording a cleanup failure with `Issue.record` rather than throwing (see references/api.md →
   "Setting up and cleaning up around each scenario"). If the app has no way to create that state,
   tell the developer what must exist on the device before the run.
4. **Write expectations** for each turn — see "Choosing expectations" below.
5. **Write the test file** from the template below, in a Swift Testing test target that runs on the
   same device as the installed app. Add the target if none exists; it needs no special settings.
6. Build the test target and fix compile errors. Then stop. Tell the developer what the suite
   covers, including which App Skills it checks with `Loads` (or that the app ships none), and offer
   to run it.

## Test file template

```swift
import SiriEvaluations
import Testing

// Declared once per test target: a name, a dataset, the Siri run, the expectation evaluator and the
// standard report.
struct CometCalEvaluation: Evaluation {
    let name: String
    let dataset: SiriScenarioLoader

    func subject(from sample: SiriScenario) async throws -> SiriScenarioSubject {
        // Per-scenario setup goes here, before the run. Cleanup goes after it and must not throw.
        try await SiriService.run(scenario: sample)
    }

    var evaluators: Evaluators {
        SiriExpectationEvaluator()
    }

    func aggregateMetrics(using aggregator: inout MetricsAggregator) {
        Self.computeSiriMetrics(into: &aggregator)
    }
}

@Suite("CometCal - Siri", .serialized)
struct CometCalSiriEvaluationTests {
    static let appDefinitions = IntentDefinitions(bundleIdentifier: "com.example.CometCal")
    static let CreateEventIntent = appDefinitions.intents["CreateEventIntent"]
    static let DeleteEventIntent = appDefinitions.intents["DeleteEventIntent"]
    static let EventEntity = appDefinitions.entities["EventEntity"]
    static let CalendarEntity = appDefinitions.entities["CalendarEntity"]
    static let PlanEventSkill = appDefinitions.skills["plan-event"]

    static let createEvent = SiriScenario {
        UserTurn("In CometCal, create an event called Comet Watch tomorrow at 3PM in my Deep Space calendar") {
            Calls {
                CreateEventIntent
                    .expect(
                        title: .equals("Comet Watch"),
                        calendar: CalendarEntity.expectIdentifier("deep-space")
                    )
                    .result(
                        EventEntity.expect(title: .equals("Comet Watch"))
                    )
            }

            Calls(.disallowed) { DeleteEventIntent }
        }
    }

    static let evaluation = CometCalEvaluation(
        name: "CometCal - Create an event",
        dataset: SiriScenarioLoader { createEvent }
    )

    @Test("Siri creates the event with the right title and calendar", .evaluates(evaluation))
    func createsEvent() {
        let result = EvaluationContext.current.result
        #expect(result.aggregateValue(.mean(of: .intentsAllPass)) == 1.0)
    }

    // The app ships a plan-event App Skill: Siri should load it for the task it describes.
    static let planEvent = SiriScenario {
        UserTurn("Help me plan a launch party in CometCal") {
            Loads(.required) { PlanEventSkill }
        }
    }

    static let skillsEvaluation = CometCalEvaluation(
        name: "CometCal - App Skills",
        dataset: SiriScenarioLoader { planEvent }
    )

    @Test("Siri loads CometCal's App Skills", .evaluates(skillsEvaluation))
    func loadsSkills() {
        let result = EvaluationContext.current.result
        #expect(result.aggregateValue(.mean(of: .skillsLoadedAllPass)) == 1.0)
    }
}
```

- `.serialized` is required: the device runs one Siri conversation at a time.
- Declare the `Evaluation` conformer above once per test target (named for the app) and copy it as
  written. It supplies `name`, `dataset`, `subject(from:)`, `evaluators` and
  `aggregateMetrics(using:)`, and its `subject(from:)` returns
  `try await SiriService.run(scenario: sample)`, which runs the scenario through Siri. Pass `sample`
  itself, unchanged: a subject run from any other scenario isn't graded.
  Don't declare `Sample`, `SampleLoader` or `Subject` typealiases; Evaluations infers them. The
  conformer's memberwise initializer takes `name` first, and it is required: `name` titles the report.
- Assert only on metrics for the facets the scenarios constrain (a facet with no expectations is not
  scored): `.intentsAllPass` for `Calls` (every ordering, including `.disallowed`),
  `.foundEntitiesAllPass` for `Finds`, `.onScreenEntitiesAllPass` for `OnScreen`,
  `.siriResponseAllPass` for `SiriResponse`, `.skillsLoadedAllPass` for `Loads(.required)`. Never
  assert on the mean of a `…PercentagePass` share: it has no summary card, so it reads `-1`. The full
  list is in references/api.md.
- One evaluation value (an instance of the conformer) per behavior under test, one `@Test` per
  evaluation. Several scenarios for the same behavior go in one loader:
  `SiriScenarioLoader { scenarioA; scenarioB }`.
- The API requires OS 27.3, so the test target's deployment target must be 27.3 or later: raise it on
  the test target, and the app keeps its own. Don't work around a lower one by marking a `@Suite` or
  `@Test` with `@available(iOS 27.3, *)`: Swift Testing rejects it ("Attribute 'Suite' cannot be
  applied to this structure because it has been marked '@available(iOS 27.3, *)'").

## Choosing expectations

Expectations attach where the turn or scenario is built: in the trailing block of
`UserTurn("…") { … }` for that turn, or in `SiriScenario { … } expectation: { … }` when it doesn't
matter which turn does it. A scenario's `expectation:` block takes `Calls`, `Finds`, `OnScreen` and
`Loads`; `SiriResponse` goes in a turn's block only, on the turn that produces the reply.

| Developer wants to know… | Write |
|---|---|
| Siri picked the right intent | `Calls { CreateEventIntent }` |
| …and filled a text parameter correctly | `CreateEventIntent.expect(title: .equals("…"))` |
| …and resolved an entity parameter to a specific entity | `CreateEventIntent.expect(calendar: CalendarEntity.expectIdentifier("<id>"))` |
| …and passed some entity of the right type | `CreateEventIntent.expect(calendar: CalendarEntity)` |
| …and the intent returned the right value | `CreateEventIntent.expect(…).result(EventEntity.expect(title: .equals("…")))`, or `.result(.equals("…"))` for a scalar |
| Several intents, in order | `Calls { FindEventIntent; DeleteEventIntent }` |
| Several intents, any order | `Calls(.unordered) { A; B }` |
| Siri did *not* do something | `Calls(.disallowed) { DeleteEventIntent }` |
| Siri found the right entities | `Finds { EventEntity.expect(title: .contains("…")) }` |
| Siri saw a specific entity on screen | `OnScreen { EventEntity.expectIdentifier("<id>") }` |
| What Siri said | `SiriResponse(.contains("…"))`, or `.contains("…", caseSensitive: false)` |
| Siri loaded one of the app's App Skills | `Loads(.required) { appDefinitions.skills["<skill name>"] }`, or `Loads(.preferred)` — see "Covering App Skills" |

- Prefer `.equals` over `.contains` when the whole value is known.
- Constrain only what the utterance determines. Don't assert parameters the user never mentioned, or
  dates/times as exact strings; they are formatted by the system and are brittle.
- An entity-valued *parameter* takes only an identity: the bare entity definition, or
  `.expectIdentifier("<id>")` with an identifier the app actually uses (read it from the app's entity
  query or sample data). To check the entity's properties, check the intent's `.result(...)` instead.
- `Finds` takes entity expectations with property checks (`EventEntity.expect(title: .equals("…"))`),
  as well as a bare definition or `.expectIdentifier`. `OnScreen` takes only identities (a bare
  definition or `.expectIdentifier`).
- Pair every action scenario with `Calls(.disallowed)` for the app's destructive intents when a wrong
  pick would be harmful.
- To expect that a value is absent, write `.isNil` (`.expect(location: .isNil)`, `.result(.isNil)`).
  Passing a literal `nil` leaves the value unchecked, so that expectation can never fail.
- A clarification is a turn: if Siri should ask for a missing value, expect a
  `SiriResponse(.contains("…"))` with a word the question must contain on that turn, and put the
  answer and the `Calls` expectation on the next `UserTurn`.

## Covering App Skills

When the app ships App Skills, cover each of the following:

- **Ask for the skill's task.** Use the utterance a user would say to get the job the skill's
  `description` describes, naming the app ("In SkyBound, clean up my old flights").
- **Choose the enforcement.** `Loads(.required) { … }` when the request is what
  the skill exists for and Siri should load it; it is graded by `.skillsLoadedAllPass`. `Loads(.preferred)
  { … }` when the app's intents alone could reasonably satisfy the request; it shows in the report
  but is never scored.
- **Follow the skill's instructions.** If the skill interviews the user before acting, the first turn
  should check only `Loads`; add turns that answer its questions, with the `Calls` on the turn where the
  call should happen. If the skill calls intents directly, put those `Calls` on the same turn as the
  `Loads`. If it forbids something ("archive, never delete"), add `Calls(.disallowed)` for it.
- **Give skills their own evaluation** asserting `.skillsLoadedAllPass`, as in the template, so a skill
  Siri didn't load is reported separately from a wrong intent call.
