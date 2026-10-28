---
name: xcuitest
description: >
  WHEN authoring or repairing XCTest UI automation with XCUIApplication,
  accessible queries, launch fixtures, permission alerts or screenshot comparisons;
  NOT for non-UI XCTest, Swift Testing, unchanged test execution or visual taste review;
  provides isolated UI-test patterns and observable lifecycle assertions.
---

# Author Reliable XCTest UI Automation

Author UI tests in the project's existing XCTest UI target: `import XCTest`,
`XCTestCase`, `test…` methods, `XCUIApplication` and XCTest assertions.
Swift Testing's `@Test` and `#expect` do not supply UI automation APIs.
Do not migrate frameworks merely because the tests are written in Swift.

## Responsibility and proof

- Read the requirement, existing UI target/test plan, fixtures and neighbouring
  tests before changing a case. Keep its agreed behaviour and scenario identity.
- Use `tdd` for the failing-before/passing-after workflow. This skill owns the
  UI assertion and fixture design, not a replacement test runner.
- Use `xcode-dev-loop` for Apple toolchain discovery, building, running, installing
  and inspecting results; use documented project commands if it is unavailable.
  Running an unchanged target alone is an execution task, not test authorship.
- Swift Testing unit/integration authorship belongs to `swift-testing`. Existing
  non-UI XCTest unit, integration and `measure` tests retain their established
  XCTest conventions and framework-neutral TDD; this skill does not own them.
  Dedicated reusable non-UI XCTest authorship remains a separate gap.
- Interactive appearance judgement belongs to `visual-feedback`, not unattended
  baseline approval. Requirement acceptance remains with the authoritative
  contract and `acceptance-review`.

State the exact public action and observable result. Ask which plausible defect
would still pass: a Save button's existence does not prove saving; a seeded note
seen after launch does not prove persistence. Assert the intended value, record,
ordering, denial or navigation outcome, not just that the app is alive.

## Isolate launch preconditions

Use the project's existing test-build seams, not invented environment keys or a
new production back door. Confine DEBUG/seed/reset support to authorised test
builds; a test-side repair does not grant production configuration changes.

1. Allocate a unique per-test store/account namespace, safe across workers and
   simultaneous runs. Reuse existing disposable backend fixtures and their
   owner/run IDs and readiness checks. A unique string is isolation only if the
   app/backend actually scopes its mutable state to it.
2. Set documented keys on the **specific app instance's**
   `app.launchEnvironment` before `app.launch()`. `setenv` in the UI test runner,
   an `xcodebuild` shell variable and the app's startup environment are separate
   boundaries. Do not assume automatic inheritance. Use `launchArguments` only
   where the app already interprets those arguments.
3. Verify the selected app/backend/store through an existing observable
   diagnostic, fixture request log or resulting scoped data. The variable's
   spelling alone is not evidence that the app consumed it.
4. Reset only the owned namespace on its initial launch. Before a persistence
   relaunch, remove or disable the reset key, keep the same store ID and backend,
   terminate the app and launch it again. Do not reseed the target value.
5. Arrange cleanup of owned fixtures/resources on success, failure and
   cancellation using the suite's existing teardown facilities. Keep diagnostic
   evidence outside cleanup targets. Never erase a shared simulator/store,
   reset another worker's permissions or kill processes by name.

A DEBUG deep link may seed unrelated records for a create-form test, or establish
an explicitly separate seeded-list rendering case. It cannot insert the target
record in a test claiming to create it through the form. For that case, start
from isolated known data, perform Add → enter fields → Save through the public
UI, assert the new record, then relaunch without reset/seed and assert it again.
Document any stand-in and the narrower boundary it actually exercises.

## Query, wait, interact, assert

Prefer existing accessibility identifiers, scoped by element type/container:
`app.buttons["settings.open"]`, `app.staticTexts["appearance.selection"]`.
Use a stable accessible label when that is the project contract; pin the locale
and avoid ambiguous translated or dynamic strings. Inspect the hierarchy when a
query is uncertain. Do not conceal duplicates with `.firstMatch` unless choosing
the first is genuinely the requirement. Accessible queries are not a complete
VoiceOver or accessibility audit.

- Use `waitForExistence(timeout:)` before reading an element, and bounded
  `XCTNSPredicateExpectation`/`XCTWaiter` checks for properties such as
  `isHittable`, `isEnabled`, label/value changes or disappearance. Match the
  supported SDK and existing project wait helpers.
- Wait for the state needed by the next action: existence alone does not mean
  a covered/disabled button is tappable. For scrolling, use bounded gestures in
  the identified container until the intended element becomes actionable.
- Prefer `tap()`, `typeText(_:)` and the appropriate control API. Avoid guessed
  coordinates, blind swipes, fixed sleeps and unbounded polling/retry loops.
- Assert exact expected content/state after the action. Wait for the expected
  value, not merely the previous screen's existence. Include useful failure
  messages and preserve screenshot/hierarchy diagnostics without swallowing
  the failed assertion. Fail fast when a required precondition is missing.

[Persistence example](references/persistence-example.md) shows real APIs using an
explicit example app contract, including the first-launch-only reset. Adapt its
identifiers and seams to the inspected project; they are not built-in APIs.

## Handle app and system alerts deliberately

Separate cases with known owned permission states: undetermined → allow,
undetermined → deny where required, and an already-denied explanation/settings
journey. Do not rely on test order or reset a shared device to obtain these states.
A store reset does not necessarily reset OS permissions, keychain or accounts.
Reuse the approved fixture and the project's approved system-prompt convention.

For app-owned alerts, query the specific `app.alerts` alert and intended button
with bounded waits. For system interruptions, use the approved direct query or
`addUIInterruptionMonitor(withDescription:handler:)` approach for the tested OS
and locale. Match the expected alert and named action, never the first arbitrary
SpringBoard button. Register a monitor **before** triggering the alert. A monitor
is invoked when an attempted UI interaction encounters an interruption; merely
registering it or waiting does not dismiss the prompt. Use the project's known
safe app interaction to trigger handling, then assert the resulting app state.

Return `true` from a monitor only after recognising the expected alert and
actually handling the intended button; return `false` for unrelated alerts or
missing actions. Remove the monitor with `removeUIInterruptionMonitor(_:)` after
its scope. XCTest's implicit interruption handling may dismiss an unclaimed alert,
so `false` does not guarantee it remains visible. Record whether the scoped
handler tapped the expected action and verify the actual permission/app outcome;
an unexpected prompt or implicit dismissal is not successful handling.
See [alert handling](references/alert-handling.md).

Use bounded checks for outcomes such as `scanner.ready`, or the denied
`camera.explanation` plus Open Settings action. Assert the specified transition
when Settings navigation is required. Simulator permission UX/scanner readiness
is not proof of actual camera image capture; retain a hardware/device obligation
when capture is required.

## Separate screenshots from automated comparisons

`XCTAttachment(screenshot: app.screenshot())` records a diagnostic image;
`attachment.lifetime = .keepAlways` retains it when needed. It does **not** compare
pixels, detect a clipped total or turn button existence into a visual regression
assertion. XCTest UI automation has no built-in snapshot-diff assertion.

Use synthetic data and disposable accounts for screenshots and result bundles.
Before sharing, inspect and redact derivatives; keep necessary originals
access-controlled under the project's retention policy, including `.keepAlways`
attachments. Never publish credentials, customer data or whole unreviewed bundles.

Reuse the project's already selected, supported snapshot engine, configuration
and test integration. If none exists, engine adoption/configuration is an
explicit project decision and missing prerequisite: propose the integration,
but do not install packages or describe a functioning comparison suite.

Before comparing, match approved device model, OS/runtime, scale/orientation,
locale/timezone, appearance, text size, fonts, fixture data and render readiness.
Use observable readiness, not a delay hiding animation or loading. Apply only
authorised masks/tolerances; a mask must not hide the feature under test. Retain
expected, actual and diff images plus the engine's machine result and relevant
configuration. A screenshot attachment remains diagnostic evidence alongside it.

Baseline additions/updates need the project's authorised review against the
requirement. Never replace an approved image automatically, update-until-green,
loosen tolerance or approve a changed baseline merely because the test failed.
An approved reference image without an implemented selected engine is not
an automated comparison pass; report that capability unverified. Raw diffs do
not decide visual taste or requirement correctness.

## Keep system and device boundaries explicit

Preserve useful simulator UI cases, but name the stand-in and unproved boundary:

| Executable stand-in | Does not prove | Required boundary evidence |
| --- | --- | --- |
| DEBUG deep link seeds a reminder | Spoken Siri phrase invokes the shortcut and creates it | Required physical phone, signed build, intent/shortcut configuration and actual Siri invocation/result |
| Injected local notification opens a reminder | Real remote push delivery/open | Correct signed/provisioned build, push entitlement, service/device registration and real remote delivery/open |
| DEBUG Pro flag displays unlocked UI | StoreKit sandbox purchase unlocks Pro | Required StoreKit product configuration, signed build, sandbox account and actual transaction/unlock evidence |
| Simulator scanner-ready state | Physical camera or other hardware operation | Supported physical device, permission and real hardware operation |

Use `app-intent-driven-development` for intent integration design when relevant,
not as substitute execution proof. Do not invent Siri speech, purchase or remote
push APIs to cross missing boundaries. Once prerequisites exist, return actual
Apple build/test/device execution to `xcode-dev-loop` or established project
commands. Missing device, entitlement, signing or account keeps the corresponding
obligation **blocked/unverified**, even if every stand-in UI test passes.

## Hand off execution and judge the returned evidence

When execution is authorised, name one `xcode-dev-loop` executor or actual
documented project command in the handoff/report, including device/system
follow-through. It uses the project's recipes and owns discovery, build,
install, run, native case-result inspection, process verdicts and teardown.
Send exact case/test-plan IDs, isolated fixture and permission preconditions,
reset-versus-relaunch rules and expected outcomes. Do not create another runner.

Require returned case IDs and non-zero execution count, source identity including
dirty changes, actual built/installed product, toolchain, device/runtime, fixture
ID and evidence that the requested permission state held. Expected cases must
have fresh native results with no unexplained skips, failures or crashes.
Authored code, a screenshot, a total count or an old result alone is not proof.
Keep unavailable device/system boundaries explicit.

Retain failed attempts and their evidence. A seeded pass cannot close a failed
persistence obligation: remove the target reseed, preserve the original failure
and use only a declared retry policy or a diagnosed setup/infrastructure reason.
Never suppress assertions, retry indefinitely or erase shared state to get green.

Report authored changes separately from exercised proof: exact case and attempt
IDs, each pass/fail/blocked/not-run result, evidence paths, stand-ins and
cleanup/retention gaps. A later passing retry must not conceal an earlier
behavioural failure or unresolved flakiness. Until that failure is explained and
the required behaviour is proved, do not claim the test or product fixed.
Hand both attempts and their retained evidence to `debug` or the project's named
diagnostic owner. Do not investigate or request another run here.
If execution was unavailable or not requested, label the code unexecuted.
