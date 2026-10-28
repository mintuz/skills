---
name: xcode-dev-loop
description: >
  WHEN building, testing, or visually verifying an Xcode project from the command line —
  xcodebuild runs, Swift Testing result reading, simulator install/launch, and screenshots;
  NOT for authoring Swift source or tests; returns the canonical build/test/inspect loop.
---

# Xcode Dev Loop

Discover, build in the background, read results, launch on a simulator, capture screens.
This loop runs and inspects; it does not author Swift source or tests. Route
Swift Testing authoring to `swift-testing`, XCTest UI automation to `xcuitest`,
and existing non-UI XCTest unit/integration or `measure` tests to the project's
established XCTest conventions with `tdd`. A dedicated reusable non-UI XCTest
authoring guide remains a gap. Preserve the suite's framework rather than forcing
a migration. Return here to execute and interpret the real result.

## 1. Discover Before You Guess

- Find the container first: list the checkout for a `.xcworkspace` or `.xcodeproj`.
- List the schemes of a workspace with `xcodebuild -list -workspace <name>.xcworkspace`.
- List the targets, build configurations, and schemes of a project with
  `xcodebuild -list -project <name>.xcodeproj` (use this form when you need a target name).
- Build and test with the container flag you listed with, and always name the scheme:
  `xcodebuild test -workspace <name>.xcworkspace -scheme <Scheme>`. The `test` action fails
  without a scheme.
- List simulator UDIDs with `xcrun simctl list devices available -j`; resolve the UDID
  once, then reuse it.
- Read installed simulator command options with `xcrun simctl help <subcommand>`.
- Never address a simulator by name: duplicate names ("iPhone 17 Pro Max") cause
  "No booted simulator named …" failures. Only the listing output separates same-named
  devices, so give the listing command beside the UDID whenever you replace a name.
- When a scheme needs a runtime the default Xcode lacks (e.g. a watchOS beta), export
  `DEVELOPER_DIR=/Applications/Xcode-<version>.app/Contents/Developer` for the whole
  session, so every `xcodebuild` and `xcrun` call selects the same Xcode.

## 2. Build and Test in the Background

- Never let `xcodebuild` hold the foreground: a clean build or test run routinely exceeds
  the 600 s command timeout, and a command killed at the timeout leaves no verdict.
- Start the run in the background, redirect its output to a log file in the scratchpad, and
  keep a handle whose exit status you can read later. Prefer the harness's background
  facility (`Bash` with `run_in_background: true`) and the task handle it returns.
- With only a plain shell, make the run record its own exit status; a later shell cannot
  `wait` for another shell's child. Give every attempt its own log and status path; a stale
  status file ends the wait at once and reports the wrong result:

  ```bash
  ( xcodebuild ... > "$LOG" 2>&1; echo $? > "$LOG.status" ) &   # start it
  until [ -f "$LOG.status" ]; do sleep 5; done                  # wait, in a later call
  ```

- Use `CODE_SIGNING_ALLOWED=NO` for simulator builds.
- Pin the destination as `platform=iOS Simulator,id=<udid>`.
- When one target or test matters, scope the run with `-only-testing:<TestTarget>[/<Suite>/<test>]`; preserve the log.
- Never wait with a chained foreground `sleep`; the harness blocks it.
- Wait on the kept handle with the harness's blocking wait (`Monitor`, or the task-output
  wait), or for the `.status` file with the loop above. Read the exit status first, then the
  log's terminal marker. Do not wait by grep alone: it keeps polling when `xcodebuild` exits
  before writing a marker.

## 3. Read Results Correctly (Swift Testing Is Not XCTest)

- Swift Testing does NOT emit XCTest's `Test Case ... passed` lines.
- `Executed 0 tests, with 0 failures` is the empty XCTest summary; it proves nothing.
- Always pass `-resultBundlePath` with a new path per attempt; `xcodebuild` fails when the
  path already exists.
- Read the verdict from that fresh bundle with
  `xcrun xcresulttool get test-results summary --path <bundle>`. A pass needs the expected
  non-zero test count there, no failure or crash there, `** TEST SUCCEEDED **`, and a zero
  exit status (`principle-prove-it-works`).
- The log's `✔ Test run with N tests in M suites passed`, with N greater than zero,
  corroborates that count; a pattern that also matches zero proves nothing. A filtered or
  `-quiet` log can omit the line, so never treat its absence alone as the verdict.
- Take the expected test count from the target's tests or test plan, never from the run you
  are judging.
- Match the expected case IDs against `xcresulttool get test-results tests --path
  <bundle>`; totals alone do not prove each selected case ran. Inspect `test-details`
  and `metrics` when a case fails or measures performance, preserving the actual
  measurements and failure reason. Pin the toolchain, configuration, device and
  workload for comparisons. State the non-UI XCTest authoring-guide gap explicitly
  when using project conventions as the fallback.
- A run that executed zero tests is not a pass, whatever its exit status
  (`principle-gaps-are-not-passes`). Suspect the selection before the code: confirm
  `-only-testing` still names the current suite and test after any rename, and that the
  target belongs to the test plan.
- Grep once with the full set of terminal markers: `\*\* BUILD SUCCEEDED \*\*`,
  `\*\* BUILD FAILED \*\*`, `\*\* TEST SUCCEEDED \*\*`, `\*\* TEST FAILED \*\*`,
  `Testing failed:`, and `^error:`. Judge the marker together with the exit status.
- To confirm which suites ran, match both spellings: XCTest prints `Test Suite '.*' started`,
  and Swift Testing prints a `Suite .* started` record. Match them case-sensitively as printed.
- On failure, read the bundle summary for the structured crash reason, such as
  `Test crashed with signal abrt`; it may appear only there. The log may repeat it as an
  underlying error, but the bundle is the reliable source. Do not re-run blind.
- Treat `The test runner hung before establishing connection` and diagnostic-collection
  timeouts as a suspected environmental fault, not a proven diagnosis. Shut down the
  pinned simulator (`xcrun simctl shutdown <udid>`) only if this run created and still
  owns it, then retry once within the run's time bounds with a new result-bundle path.
  Pinning a pre-existing device does not confer ownership: preserve it and report
  blocked when recovery needs its shutdown. Never use `xcrun simctl shutdown all`.
- Pass `TEST_RUNNER_<NAME>=<value>` on the `xcodebuild test` command; Xcode strips the
  prefix and gives the variable to the test runner process. A UI test target's app under test
  does not receive it; set `XCUIApplication.launchEnvironment` for that case.
- `test-without-building` runs the product and `.xctestrun` file an earlier build produced,
  so it can report a success that excludes your latest source change. Rebuild with
  `xcodebuild test` before you trust a pass, and whenever that product is the suspect.
- A test-bundle load error names the missing library, not the cause. When a load failure
  survives the rebuild, inspect the framework's embedding and runpath settings as candidates.

## 4. Install, Launch, and Drive

- Install the build you just made before launching. Never launch whatever is already on the
  device: it can come from another branch (`principle-prove-it-works`).
  Record revision plus relevant uncommitted-source identity and bind it to the
  actual built, installed and launched product; a matching HEAD alone is insufficient.
- `simctl install` needs a booted device. Boot the pinned device with
  `xcrun simctl bootstatus <udid> -b`, which boots it if shut down and waits for the boot to
  finish. Do not call `xcrun simctl boot` first: it fails on a running device.
- Know the product path before you install: pass `-derivedDataPath <dir>` to the build, or
  read `BUILT_PRODUCTS_DIR` and `FULL_PRODUCT_NAME` from `xcodebuild -showBuildSettings`.
  On that call repeat every flag the build used, including `-derivedDataPath`, the scheme,
  and the destination; different flags report another build's product path.
- Read the bundle id from that build, not from memory:
  `/usr/libexec/PlistBuddy -c 'Print :CFBundleIdentifier' <app-path>/Info.plist`.
- Prefer the simulator MCP: call its install action with the new `.app` path, then its
  launch action with the bundle id. Pass the pinned UDID to both; their device argument is
  optional and defaults elsewhere.
- A running MCP server does not inherit a `DEVELOPER_DIR` exported in a shell. When the run
  needs a beta Xcode, use the `xcrun` commands with that `DEVELOPER_DIR` instead.
- When the MCP launch fails with `Failed to spawn xcrun (via disclaimer)`, fall back to
  `xcrun simctl install <udid> <app-path>`, then `xcrun simctl launch <udid> <bundle-id>`.
- A deep link (`xcrun simctl openurl <udid> <scheme>://<path>`) or existing
  DEBUG/seed mechanism may establish a screen or fixture precondition. It must
  not replace the public interaction that the claimed journey is meant to prove.
  Use accessible UI automation for that boundary, not blind coordinate taps.
  For capture-only screen setup, prefer an existing deep link or DEBUG scenario
  over UI navigation; its purpose here is to reach the state, not prove creation
  or another public-action boundary.
- Read the accessibility hierarchy before you tap; coordinates are the last resort.

## 5. Screenshots

- Pick ONE capture mechanism per run: `xcrun simctl io <udid> screenshot <path>.png` when
  the file must persist for comparison, the MCP screenshot action to look now. Never use
  both for the same frame.
- Number the files (`round2/01-hub-gate.png`) so rounds diff cleanly against a baseline.
- A freshly erased simulator posts a system banner soon after boot. Wait for the boot with
  `xcrun simctl bootstatus <udid> -b`, then read the accessibility hierarchy and confirm no
  system alert covers the view. Capture only after that check passes; a fixed short delay is
  not evidence (`principle-observe-dont-infer`).

## Isolation, cleanup and evidence

Use independently owned simulator/app/fixture state when a run mutates data.
Do not erase or reset a user's shared simulator or store. Record ownership before
launch; only a created device may be shut down/deleted as this run's teardown.
On success, error or cancellation, release only resources still owned by the run,
never kill by process name or trust a reused PID. Preserve logs, result bundles
and captures outside cleanup targets and confirm they survive teardown. A blocked
device/entitlement/system boundary is not proved through another simulator path.

Use synthetic data and disposable accounts. Inspect and redact shareable log,
result-bundle and capture derivatives; keep necessary originals access-controlled
under the project's retention policy. Never publish credentials, customer data
or whole unreviewed bundles.

In a capture plan, name the pinned UDID and derive the bundle identifier from
the intended build; pass both to the launch command. Report missing state proof,
failed cleanup and unavailable evidence explicitly rather than implying success.

## 6. Cadence

- Compile after the domain layer and again after the first view, not once at the end
  (`principle-sequence-verifiable-units`).
- Run the test suite once, early, before you declare a change done.

## Related Skills

- **`app:debug`** — structured feedback loop for simulator failures, user-reported or observed
- **`core:visual-feedback`** — interactive appearance diagnosis and before/after
  review; this loop supplies the execution, captures and identity/state evidence.
- **`app:swift-testing`** — Swift Testing authoring; **`app:xcuitest`** —
  XCTest UI authoring. Keep non-UI XCTest tests in their existing framework.
- **`app:swiftui-architecture`** — SwiftUI patterns for the code under test
