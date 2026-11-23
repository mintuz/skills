# Run: SiriEvaluations tests on a device

Run the SiriEvaluations suite, find its evaluation report, and handle the errors that stop a run
before grading.

## Guardrails

- Never try to reach the Siri evaluation service other than through `SiriService.run(scenario:)`,
  called from an `Evaluation`'s `subject(from:)` and run with `.evaluates(…)`.
- A Siri evaluation drives the real Siri UI on the destination. Tell the developer before running
  that the device must stay unlocked and untouched for the run, and that they need to enter the
  device's passcode when it asks to turn on Automation Mode. Each turn can take up to a minute.
- Run SiriEvaluations tests one at a time (`.serialized` suites, never parallel testing).
- A run that stops before grading is an environment problem. It is not a reason to change
  expectations.

## Before the first run

Check each of these on the destination:

1. A physical device (iPhone, iPad, or Apple Vision Pro) running OS 27.3 or later. Simulators are
   not supported.
2. Developer Mode is on, and the device is connected and prepared for development in Xcode.
3. Siri is on, Apple Intelligence is on, and its models have finished downloading (Settings → Siri).
4. The app under evaluation is built, installed, and has been launched at least once since install,
   so its App Intents are registered and its entities are indexed in Spotlight. Reinstalling the app
   resets this.
5. For `OnScreen` expectations, the app is in the foreground with the relevant content visible.

## Running

Use Xcode's own test tools (run a single test by its identifier).

## Finding the report

Each `@Test` using `.evaluates(…)` produces an evaluation report:

- **In Xcode:** the Report navigator (⌘9) → the test run → the evaluation. It shows the summary
  cards (Overview, App Entities, Siri Response, App Skills) and one row per scenario. Each scenario
  opens to "Diagnostics" (how many turns completed, any observations that couldn't be decoded, the
  Spotlight index), "Scenario" (its whole-conversation expectations, if it has any), and "Turn 1",
  "Turn 2", … with the user's utterance, every check written for that turn, and Siri's response.
- **From a result bundle:** `xcrun xcresulttool export attachments --path <bundle>.xcresult
  --output-path <directory>` exports one evaluation result (`.xcevalresult`) per evaluation,
  alongside the test's other attachments (screenshots). Its JSON has `results`, one entry per
  scenario: `Input` (the scenario), `Expected`, the metrics (each with `kind`, `value`,
  `rationale`), and `Response`, whose `value` is the tree of what Siri did (Diagnostics, Scenario if
  any, then each turn).
- The test's own `#expect` on a metric is only the summary. The per-scenario checks are what explain a
  failure, so always read the report, not just the test's pass/fail.

When the run is graded (the report has scenario rows), stop. Summarize the metrics and how many
scenarios failed, and offer to analyze the failures (references/analyzing.md).

## When the run doesn't get to grading

If the test fails before its scenarios are graded, or every scenario fails the same way, the
environment is the problem, not the app or the test. The test failure message says what stopped the
run. Check "Before the first run" again, fix what the message points to, and rerun. Don't change the
scenarios or the app for it.
