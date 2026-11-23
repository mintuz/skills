---
argument-hint: "[write | run | analyze]"
name: siri-evaluations
description: "Write, run, and analyze SiriEvaluations scenarios, which measure how well Siri selects and fills in an app's App Intents. Use when the developer wants to evaluate how Siri uses their App Intents, App Entities, or App Skills; to add or fix a Siri scenario or expectation; to run a Siri evaluation or fix one that fails before grading; or to explain why a Siri scenario failed and what to change in the app. Takes an optional stage: write, run, or analyze."
---
SiriEvaluations tests how Siri uses an app's App Intents. A test describes what a user says to Siri,
turn by turn, and what Siri should do in response: which intents it calls and with which parameters,
which entities it finds, which App Skills it loads, and what it replies. Running the test drives Siri
and produces a report that grades each expectation. This skill writes those tests, runs them, and
explains the report.

# Guardrails

- **Public API only.** Write evaluations with the public SiriEvaluations API the references show.
  Never emit underscore-prefixed symbols.
- **Ground every name.** Every intent, entity, parameter, and App Skill name in a scenario comes from
  the app's source. Don't invent one to make a scenario compile.
- **Identifiers are a contract.** When a fix belongs in the app, don't make it by renaming an intent or
  entity type, changing an `AppEntity` id scheme, renumbering an `AppEnum`, or adding, removing, or
  renaming a parameter. That breaks existing integrations and every scenario that names them. Flag
  such a change instead of making it.
- **One stage at a time.** Do only the stage the developer asked for, then stop and offer the next one.
  Running drives Siri on a device, and analyzing can lead to changes in the app's code.

# Choosing the stage

| Stage | The developer wants to… | Read |
|---|---|---|
| `write` | create or change Siri scenarios and expectations from the app's App Intents | references/writing.md, then references/api.md as needed |
| `run` | run the evaluation on a device, find its report, or fix an error that stopped it before grading | references/running.md |
| `analyze` | understand why scenarios failed and what to change in the app or the test | references/analyzing.md |

Use the stage the developer named (`/siri-evaluations analyze`, "just run them"). "Diagnose" and
"explain" mean `analyze`. Otherwise, infer it from the request; if it could be more than one, ask. A
request for the whole loop ("get my app passing a Siri evaluation") starts at the first stage whose
prerequisites aren't met.

Read only the references for the chosen stage.

# Prerequisites

Before starting a stage, check that what it needs exists:

- **Tests**, needed by `run`: a test target with a SiriEvaluations suite (search the test sources for
  `SiriService.run(scenario:`, `SiriScenarioLoader`, and `.evaluates(`).
- **A report**, needed by `analyze`, in order of preference: one the developer points to, the result
  bundle of a run earlier in this conversation, or the newest `.xcresult` in the project's
  DerivedData `Logs/Test/` that contains a Siri evaluation. A report older than the last change to the
  tests or to the app's App Intents code is stale.

When something is missing, say what, and offer to produce it before continuing.
Wait for the developer to accept before doing the offered stages, and then do them in order, with
each stage's own guardrails.