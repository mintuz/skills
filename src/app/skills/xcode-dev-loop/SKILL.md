---
name: xcode-dev-loop
description: >
  WHEN building, testing, or visually verifying an Xcode project from the command line —
  xcodebuild runs, Swift Testing result reading, simulator install/launch, and screenshots;
  NOT for authoring Swift source or tests; returns the canonical build/test/inspect loop.
---

# Xcode Dev Loop

The command-line loop for an Xcode project: discover, build in the background, read the
results correctly, launch on a simulator, then capture screens.

## 1. Discover Before You Guess

- List schemes and targets with `xcodebuild -list -project <name>.xcodeproj`.
- List simulator UDIDs with `xcrun simctl list devices available -j`. Resolve the UDID
  once, then reuse it.
- Never address a simulator by name. Duplicate names ("iPhone 17 Pro Max") cause
  "No booted simulator named …" failures.
- When a scheme needs a runtime that the default Xcode does not have (for example a
  watchOS beta), set `DEVELOPER_DIR=/Applications/Xcode-<version>.app/Contents/Developer`
  on every `xcodebuild` call in the session, not only the first call.

## 2. Build and Test in the Background

- Start `xcodebuild` with the harness's background facility, redirect output to a log
  file in the scratchpad, and retain the task handle so its exit status is observable.
- Use `CODE_SIGNING_ALLOWED=NO` for simulator builds.
- Pin the destination as `platform=iOS Simulator,id=<udid>`.
- When only one target matters, scope the test run with `-only-testing:<TestTarget>`.
- Wait on the task handle with the harness's blocking wait, then inspect both its exit
  status and the log's terminal marker. A grep-only loop can hang when `xcodebuild`
  exits before writing a marker.

## 3. Read Results Correctly (Swift Testing Is Not XCTest)

- Swift Testing does NOT emit XCTest's `Test Case ... passed` lines.
- `Executed 0 tests, with 0 failures` is the empty XCTest summary. It proves nothing.
- The real verdict is `✔ Test run with N tests in M suites passed` plus
  `** TEST SUCCEEDED **`.
- Grep once with the full set: `\*\* TEST SUCCEEDED \*\*`, `\*\* BUILD FAILED \*\*`,
  `Testing failed:`, `^error:`, and `Test suite .* started` to confirm which suites ran.
- Always pass `-resultBundlePath`. On failure, read
  `xcrun xcresulttool get test-results summary --path <bundle>`. Crash reasons such as
  `Test crashed with signal abrt` appear only there. Do not re-run blind.
- `The test runner hung before establishing connection` and diagnostic-collection
  timeouts are environmental. Run `xcrun simctl shutdown all`, then retry once.
- `TEST_RUNNER_<NAME>` variables reach the app only through `xcodebuild test`.
  `test-without-building` ignores them silently and can report a stale success.

## 4. Install, Launch, and Drive

- Prefer the simulator MCP `launch` action.
- When `launch` fails with `Failed to spawn xcrun (via disclaimer)`, fall back to
  `xcrun simctl install <udid> <app-path>`, then
  `xcrun simctl launch <udid> <bundle-id>`. Take the bundle id from `Info.plist`.
- Reach screens by deep link with `xcrun simctl openurl <udid> <scheme>://<path>`, or by a
  DEBUG scenario or seed mechanism when the app has one. Do not use blind coordinate taps.
- Read the accessibility hierarchy before you tap. Coordinates are the last resort.

## 5. Screenshots

- Pick ONE capture mechanism per run. Use `xcrun simctl io <udid> screenshot <path>.png`
  when the file must persist for comparison. Use the MCP screenshot action when you only
  need to look now. Never use both for the same frame.
- Number the files (`round2/01-hub-gate.png`) so rounds diff cleanly against a baseline.
- A freshly erased simulator posts a system banner about a minute after boot. Let the
  simulator settle before the first capture.

## 6. Cadence

- Compile after the domain layer, then again after the first view. Do not compile once at
  the end.
- Run the test suite once, early, before you declare a change done.

## Related Skills

- **`app:debug`** — structured feedback loop for simulator failures, user-reported or observed
- **`app:swift-testing`** — writing the tests this loop runs
- **`app:swiftui-architecture`** — SwiftUI patterns for the code under test
