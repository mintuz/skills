# Analyze: why scenarios failed, and what to fix

Read a Siri evaluation report and, for each unsatisfied expectation, identify what Siri actually
observed (different intent called, no intent called, a parameter missing, other entities found, an
unexpected clarification, a forbidden intent called, a reply that didn't match), then decide, based
on the goal of the scenario, whether the fix belongs in the app's App Intents code or in the scenario
itself.

## Guardrails

- Diagnose from the report, not from the test's pass/fail. Each claim about what Siri did should quote
  a check row or a transcript line from the report.
- Decide first whether the failure is in the **environment**, the **app**, or the **test**. Only app
  failures lead to App Intents changes. Don't edit intents to compensate for an incorrect expectation
  or a device that was not ready.
- Never make a scenario pass by loosening its expectation unless the expectation doesn't match the
  goal of the scenario. Say so explicitly when you do.
- Siri is nondeterministic. One failure out of several paraphrases is a signal to investigate, not
  proof. A failure that repeats across reruns and paraphrases may be systematic.
- After changes to App Intents code, the app must be rebuilt, reinstalled, and launched before
  rerunning (see references/running.md).

## Reading the report

Xcode shows each scenario as a table: **Key** (what is checked), **Subject** (what Siri observed),
**Expected** (what the scenario asked for), and **Issues**, which flags every row where Subject and
Expected differ. Each scenario has these sections:

- **Diagnostics**: context for the run rather than checks: how many of the app's entities Spotlight
  had indexed, how many turns completed, and anything Siri did that could not be read. A check that
  depends on something that could not be read cannot be trusted.
- **Scenario**: the scenario's whole-conversation expectations, if it has any.
- **Turn 1, Turn 2, …**: the user's utterance, a group of rows for each expectation written for the
  turn, then Siri's response.

Each group starts with a row for what the expectation checks (an intent call, an entity, the reply, or
an App Skill), followed by a row for each parameter or property it constrains. Subject shows what Siri
actually did: the call it made and its arguments, the entities it found or saw on screen, its reply, or
the skills it loaded. A row that could not be checked, because the call never ran or what Siri did
could not be read, is neither a pass nor a failure; look at the turn's earlier rows and the
Diagnostics for the reason.

A metric's rationale only counts the checks that held. The flagged rows show which ones failed.

## Workflow

1. **Get the report.** Ask for it or export it.
2. **Rule out the environment.** If every scenario fails the same way, the Diagnostics show fewer
   completed turns than the scenario has, or the Spotlight index is empty, stop and work through references/running.md → "When the run doesn't get to grading"
   instead.
3. **For each failing scenario**, walk the failing check rows in turn order. The first failure in a
   turn usually explains the rest (an intent that wasn't called leaves its parameter rows unchecked).
4. **Read the app code the failure points at**: the intent's `title`, `description`, `@Parameter`
   declarations, `parameterSummary`, `perform()` return type and dialog; the entity's
   `displayRepresentation`, `EntityQuery`, and indexing. Read the scenario too; confirm the
   expectation matches what the utterance actually asks for.
5. **Write up each failing scenario** in this shape:

   > **"In CometCal, create an event called Comet Watch tomorrow at 3PM"** — ✗ Turn 1, `title` of
   > `CreateEventIntent`: Siri set "Comet Watch tomorrow at 3PM", the scenario expected "Comet Watch"
   > **What happened:** Siri called `CreateEventIntent(title: "Comet Watch tomorrow at 3PM")` — the
   > date and time were folded into the title.
   > **Why:** `title`'s parameter has no description, and the intent has no `date` parameter Siri
   > could put "tomorrow at 3PM" into. *(app — systematic across 3 paraphrases)*
   > **Fix:** `CreateEventIntent.swift:14` — add a description to `title` ("The event's name only,
   > without its date or time") and a `startDate` parameter. Diff below.

   Group scenarios that fail for the same reason and give the fix once.
6. **Rerun** the failing scenarios after the developer applies fixes, and compare the report with the
   previous one. If a fix didn't move the metric, say so and revisit the diagnosis.
