# SiriEvaluations authoring API

All types require OS 27.3 and are unavailable on tvOS, watchOS, and Mac Catalyst. A test file imports:

```swift
import SiriEvaluations
import Testing
```

## Naming the app's types

```swift
let appDefinitions = IntentDefinitions(bundleIdentifier: "com.example.CometCal")
let CreateEventIntent = appDefinitions.intents["CreateEventIntent"]   // AppIntentDefinition
let EventEntity = appDefinitions.entities["EventEntity"]              // AppEntityDefinition
let OrganizeEventSkill = appDefinitions.skills["organize-event"]      // SkillDefinition
```

Intent and entity keys are the Swift type names; skill keys are the `name:` in the skill's
`SKILL.md` (in the app's `*.skillsbundle`).

## Scenario structure

```swift
SiriScenario {
    UserTurn("first thing the user says") { /* this turn's expectations */ }
    UserTurn("reply to Siri's follow-up") { /* … */ }
} expectation: {
    /* whole-conversation expectations: Calls, Finds, OnScreen, Loads */
}
```

- All turns run in one Siri session, in order. `UserTurn("…")` with no block has no expectations.
- Expectations attach where the turn or scenario is built.
- The blocks are result builders, so `if` and `for` work inside them.
- Turn expectations are graded only against that turn. Scenario expectations see every turn, so a
  scenario's `expectation:` block takes `Calls`, `Finds`, `OnScreen` and `Loads`, and not
  `SiriResponse`.
- A turn that never ran fails its required expectations; its `Calls(.disallowed)` expectations hold.

## Facets

Each is written in a turn's block; all but `SiriResponse` can also go in the scenario's `expectation:`
block, with the same spelling.

- `Calls(_ ordering: .ordered | .unordered | .disallowed = .ordered) { … }` takes intent
  expectations: a bare definition (any call of that intent) or `X.expect(…)`.
  - `.ordered`: every intent is called, in the written order (other calls may come in between).
  - `.unordered`: every intent is called, in any order. Each call satisfies only one expectation, so
    two identical expectations need two calls.
  - `.disallowed`: fails if any call matches one of these intents (and its constraints, if any:
    `DeleteEventIntent.expect(title: .equals("Launch"))` forbids only deleting "Launch"). A call counts
    when it ran, and also when Siri chose it and asked the user to confirm it first. A call that
    stopped for a missing value, or failed, doesn't count.
- `Finds { … }` takes entity expectations: a bare definition, `E.expect(…)` with property checks, or
  `E.expectIdentifier("<id>")`. Siri found an entity of this shape, by search or resolution.
- `OnScreen { … }` takes identities only: a bare definition or `E.expectIdentifier("<id>")`. The entity
  was on screen, so the app must be staged in the foreground with the entity showing. To match one
  specific entity rather than any of its type, pass its identifier with `E.expectIdentifier("<id>")`.
- `SiriResponse(.contains("…"), …)`: Siri's reply on that turn contains each text. `caseSensitive:
  false` ignores case. It goes in a turn's block only, on the turn that produces the reply. There is
  no exact-match or language-model-judged reply check.
- `Loads(_ enforcement: .required | .preferred) { skill… }` takes App Skill definitions
  (`appDefinitions.skills["<name>"]`): Siri loaded the skill (the instructions the app ships for a
  task) in that turn, or anywhere in the scenario. The enforcement has no default; write `Loads(.required)` or
  `Loads(.preferred)`. Only `.required` is graded, by `.skillsLoadedAllPass`; `.preferred`
  appears in the report and never fails.

## Intent expectations

```swift
CreateEventIntent                                                    // any call of the intent
CreateEventIntent.expect(title: .equals("Comet Watch"))              // a scalar parameter
CreateEventIntent.expect(calendar: CalendarEntity)                   // an entity parameter, any calendar
CreateEventIntent.expect(calendar: CalendarEntity.expectIdentifier("deep-space"))  // a specific entity
CreateEventIntent.expect(title: .equals("Comet Watch"))
    .result(EventEntity.expect(title: .equals("Comet Watch")))       // the returned entity
CreateEventIntent.expect(title: .equals("Comet Watch")).result(.notNil)   // a scalar return value
```

## Entity expectations

```swift
EventEntity.expect(title: .equals("Comet Watch"))
EventEntity.expect(calendar: CalendarEntity.expect(title: .equals("Deep Space")))   // nested entity
EventEntity.expectIdentifier("meteor-shower")                                       // by identifier
```

- Unmentioned properties are unconstrained.
- `expectIdentifier` takes the entity's identifier as the app's entity query returns it.

## Value matchers

From AppIntentsTesting:

- `.equals("…")`: exact match. Prefer it whenever the whole value is known.
- `.contains("…")`: substring match. Cannot catch Siri stuffing extra words into a parameter.
- `.contains(regex: "…")`: regular-expression match.
- `.notNil` / `.isNil`: the value is present / absent. Write `.isNil` to expect absence: passing a
  literal `nil` (`.result(nil)`, `.expect(location: nil)`) leaves the value unchecked, so it can't fail.
- `.matches(#Predicate { … }, requirement: "…")`: a predicate; `requirement` is how the report
  describes it.

## Matching rules

- Matching is done by AppIntentsTesting, the same comparison an app's own intent tests use.
- An intent matches by its bundle and type; then its parameters and result are compared.
- Fail-closed: if a parameter or result the expectation constrains could not be decoded from what
  Siri did, a required call does not count as matched, and a disallowed call counts as called.

## Evaluations

A Siri evaluation is a type that conforms to Evaluations' `Evaluation`:

```swift
struct CometCalEvaluation: Evaluation {
    let name: String
    let dataset: SiriScenarioLoader

    func subject(from sample: SiriScenario) async throws -> SiriScenarioSubject {
        try await SiriService.run(scenario: sample)
    }

    var evaluators: Evaluators { SiriExpectationEvaluator() }

    func aggregateMetrics(using aggregator: inout MetricsAggregator) {
        Self.computeSiriMetrics(into: &aggregator)
    }
}

let evaluation = CometCalEvaluation(name: "CometCal - Create an event", dataset: SiriScenarioLoader { … })
```

### Setting up and cleaning up around each scenario

`subject(from:)` runs once for each scenario in the dataset, so code before and after the
`SiriService.run(scenario:)` call is per-scenario setup and cleanup:

```swift
func subject(from sample: SiriScenario) async throws -> SiriScenarioSubject {
    try await resetAppState()   // setup: put the app in the state the scenarios assume
    let subject = try await SiriService.run(scenario: sample)
    // cleanup: undo what Siri did, so the next scenario starts clean
    do { try await resetAppState() } catch { Issue.record(error) }
    return subject
}
```

### Adding your own evaluator

```swift
extension Metric { static let titleTrimmed = Metric("Title Trimmed") }

struct TitleTrimmedEvaluator: EvaluatorProtocol {
    func metrics(subject: SiriScenarioSubject, input: SiriScenario) async throws -> [Metric] {
        let titles = subject.siriTranscript.turns.flatMap(\.intentInvocations)
            .compactMap { $0.value.arguments["title"] }
        guard !titles.isEmpty else { return [Metric.titleTrimmed.ignore(rationale: "no title was bound")] }
        let clean = titles.filter { $0 == $0.trimmingCharacters(in: .whitespaces) }.count
        return [Metric.titleTrimmed.scoring(Double(clean) / Double(titles.count))]
    }
}

struct EventCreation: Evaluation {
    let name = "Event creation"
    let dataset: SiriScenarioLoader

    func subject(from sample: SiriScenario) async throws -> SiriScenarioSubject {
        try await SiriService.run(scenario: sample)
    }

    var evaluators: Evaluators {
        SiriExpectationEvaluator()
        TitleTrimmedEvaluator()
    }

    func aggregateMetrics(using aggregator: inout MetricsAggregator) {
        Self.computeSiriMetrics(into: &aggregator)
        aggregator.group("Domain") { $0.computeMean(of: .titleTrimmed) }
    }
}
```

- `evaluators` is a builder block: list one evaluator per line, `SiriExpectationEvaluator()` first.
  Don't build an array expression with `+`; the builder rejects it. Leaving `SiriExpectationEvaluator()`
  out drops every standard metric.
- A custom metric shows in the summary only if a card includes it, as `"Domain"` does above. A conformer
  that only calls `computeSiriMetrics` leaves the custom metric out, so its mean reads `-1`; one that
  defines only its own cards loses the standard ones (the standard metrics then read `-1`).
- When a scenario gives the evaluator nothing to judge, return `.ignore(rationale:)` rather than a score
  of 1: an ignored metric is left out of the average, so a scenario that never exercised the rule
  doesn't inflate it.
- A custom evaluator conforms to `EvaluatorProtocol` with
  `metrics(subject: SiriScenarioSubject, input: SiriScenario) async throws -> [Metric]` and reads
  `subject.siriTranscript`: per turn, `intentInvocations`, `foundEntities`, `onScreenEntities`,
  `loadedSkills`, and `response`. Every observation's `timestamp` is when the transcript was built, so
  it says nothing about order.

## Metrics

`result.aggregateValue(.mean(of: .<metric>))`. Each is 1 or 0 per scenario, and the summary card is
its mean across scenarios.

| Card group | Metric | Name in the report | Facet |
|---|---|---|---|
| Overview | `.intentsAllPass` | Intents | `Calls`, every ordering |
| App Entities | `.foundEntitiesAllPass` | Found Entities | `Finds` |
| App Entities | `.onScreenEntitiesAllPass` | Onscreen Entities | `OnScreen` |
| App Skills | `.skillsLoadedAllPass` | Skills Loaded | `Loads(.required)` |
| Siri Response | `.siriResponseAllPass` | Siri Response | `SiriResponse` |

- The metrics are named as Evaluations names its own tool-call metrics (`.toolsAllPass`,
  `.toolsPercentagePass`). The earlier names (`.intentsPass`, `.foundEntitiesPass`,
  `.onScreenEntitiesPass`, `.siriResponsePass`, `.skillsLoadedPass`) are deprecated aliases: write the
  `…AllPass` names, and rename the old ones when you touch a test that uses them.
- A facet with no expectations is ignored rather than scored. If no scenario has expectations for a
  facet, the report leaves out its card, and `aggregateValue(.mean(of:))` returns `-1` for it.
- A test gates on the `…AllPass` metrics above.
- The report's Diagnostics section shows how many turns completed, any observations that couldn't
  be decoded, and the Spotlight index.

## Loaders

```swift
SiriScenarioLoader {
    createEvent
    [paraphraseA, paraphraseB]
    for title in ["Comet Watch", "Star Party"] { makeScenario(title) }
}
```

## Scenarios as JSON

Write scenarios only in Swift: the DSL is type-checked, and JSON is not. If the developer wants a dataset
in a file, `SiriScenario` is `Codable`: decode it inside the test, run the evaluation there, and attach
the result so Xcode shows the report.

```swift
@Test func scenariosFromFile() async throws {
    let scenarios = try JSONDecoder().decode([SiriScenario].self, from: Data(contentsOf: url))
    let evaluation = CometCalEvaluation(name: "Scenarios from a file", dataset: SiriScenarioLoader { scenarios })
    let result = try await evaluation.run()
    Attachment.record(try result.jsonData(includeReportMetadata: true), named: "\(evaluation.name).xcevalresult")
    #expect(result.aggregateValue(.mean(of: .intentsAllPass)) >= 0.9)
}
```

A file holds one scenario or an array of them. Decode the shape you wrote (`SiriScenario.self` for one,
`[SiriScenario].self` for an array). Don't decode in the `.evaluates(…)` trait's arguments.
