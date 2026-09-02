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

This loop runs and inspects an Xcode project. It does not author Swift source or tests.
Send that work to `app:swift-testing`, then come back here to run it.

## 1. Discover Before You Guess

- Find the container first. List the checkout for a `.xcworkspace` or a `.xcodeproj`.
- List the schemes of a workspace with `xcodebuild -list -workspace <name>.xcworkspace`.
- List the targets, build configurations, and schemes of a project with
  `xcodebuild -list -project <name>.xcodeproj`. Use this form when you need a target name.
- Build and test with the same container flag you listed with, and always name the scheme:
  `xcodebuild test -workspace <name>.xcworkspace -scheme <Scheme>`. The `test` action fails
  without a scheme.
- List simulator UDIDs with `xcrun simctl list devices available -j`. Resolve the UDID
  once, then reuse it.
- Never address a simulator by name. Duplicate names ("iPhone 17 Pro Max") cause
  "No booted simulator named …" failures. Only the listing output separates two devices that
  share a name, so give the listing command beside the UDID whenever you replace a name.
- When a scheme needs a runtime that the default Xcode does not have (for example a
  watchOS beta), export `DEVELOPER_DIR=/Applications/Xcode-<version>.app/Contents/Developer`
  for the whole session. Every `xcodebuild` and `xcrun` call must select the same Xcode, not
  only the first call.

## 2. Build and Test in the Background

- Never let `xcodebuild` hold the foreground. A clean build or a test run routinely exceeds
  the 600 s command timeout. A command killed at the timeout leaves no verdict.
- Start the run in the background. Redirect its output to a log file in the scratchpad. Keep
  a handle whose exit status you can read later.
- Prefer the harness's background facility (`Bash` with `run_in_background: true`) and the
  task handle it returns.
- When only a plain shell is available, make the run record its own exit status. A later
  shell cannot `wait` for another shell's child, so wait for that status file instead. Give
  every attempt its own log and status path; a status file left by an earlier attempt ends
  the wait at once and reports the wrong result:

  ```bash
  ( xcodebuild ... > "$LOG" 2>&1; echo $? > "$LOG.status" ) &   # start it
  until [ -f "$LOG.status" ]; do sleep 5; done                  # wait, in a later call
  ```

- Use `CODE_SIGNING_ALLOWED=NO` for simulator builds.
- Pin the destination as `platform=iOS Simulator,id=<udid>`.
- When only one target matters, scope the test run with `-only-testing:<TestTarget>`.
- Never wait with a chained foreground `sleep`; the harness blocks it.
- Wait on the handle you kept with the harness's blocking wait (`Monitor`, or the
  task-output wait), or wait for the `.status` file with the loop above. Read the exit status
  first. Read the log's terminal marker second. Do not wait by grep alone: the loop keeps
  polling when `xcodebuild` exits before it writes a marker.

## 3. Read Results Correctly (Swift Testing Is Not XCTest)

- Swift Testing does NOT emit XCTest's `Test Case ... passed` lines.
- `Executed 0 tests, with 0 failures` is the empty XCTest summary. It proves nothing.
- The real verdict is `✔ Test run with N tests in M suites passed` plus
  `** TEST SUCCEEDED **`. Check that N is greater than zero. A pattern that also matches
  zero proves nothing.
- Grep once with the full set of terminal markers: `\*\* BUILD SUCCEEDED \*\*`,
  `\*\* BUILD FAILED \*\*`, `\*\* TEST SUCCEEDED \*\*`, `\*\* TEST FAILED \*\*`,
  `Testing failed:`, and `^error:`. Judge the marker together with the exit status.
- To confirm which suites ran, match both spellings: XCTest prints `Test Suite '.*' started`,
  and Swift Testing prints a `Suite .* started` record. Match them case-sensitively as printed.
- Always pass `-resultBundlePath`, and give every attempt its own path. `xcodebuild` fails
  when the path already exists.
- On failure, read `xcrun xcresulttool get test-results summary --path <bundle>`. It gives
  the structured crash reason, such as `Test crashed with signal abrt`. The log may repeat it
  as an underlying error, but the bundle is the reliable source. Do not re-run blind.
- Treat `The test runner hung before establishing connection` and diagnostic-collection
  timeouts as a suspected environmental fault, not a proven diagnosis. Shut down only the
  simulator you pinned: `xcrun simctl shutdown <udid>`. Then retry once with a new
  result-bundle path. Use `xcrun simctl shutdown all` only when the user says the whole
  device set is disposable.
- Pass `TEST_RUNNER_<NAME>=<value>` on the `xcodebuild test` command. Xcode strips the prefix
  and gives the variable to the test runner process. A UI test target's app under test does
  not receive it; set `XCUIApplication.launchEnvironment` for that case.
- `test-without-building` reuses the product built earlier. It can report a success that
  excludes your latest source change, so rebuild with `xcodebuild test` before you trust a
  pass.

## 4. Install, Launch, and Drive

- Install the build you just made before you launch it. Never launch whatever is already on
  the device: it can come from another branch.
- Boot the pinned device before you install: `xcrun simctl bootstatus <udid> -b` boots it
  when it is shut down and waits for the boot to finish. `simctl install` needs a booted
  device. Do not call `xcrun simctl boot` first: it fails on a device that already runs.
- Know the product path before you install. Pass `-derivedDataPath <dir>` to the build so the
  path is predictable, or read `BUILT_PRODUCTS_DIR` and `FULL_PRODUCT_NAME` from
  `xcodebuild -showBuildSettings`. Repeat every flag the build used on that call, including
  `-derivedDataPath`, the scheme, and the destination. Different flags report a different
  product path, so you would install an app from another build.
- Read the bundle id from that build, not from memory:
  `/usr/libexec/PlistBuddy -c 'Print :CFBundleIdentifier' <app-path>/Info.plist`.
- Prefer the simulator MCP. Call its install action with the path of the new `.app`, then its
  launch action with the bundle id. Pass the pinned UDID to both actions; their device
  argument is optional and defaults elsewhere.
- An MCP server that is already running does not inherit a `DEVELOPER_DIR` you export in a
  shell. When the run needs a beta Xcode, use the `xcrun` commands with that `DEVELOPER_DIR`
  instead of the MCP.
- When the MCP launch fails with `Failed to spawn xcrun (via disclaimer)`, fall back to
  `xcrun simctl install <udid> <app-path>`, then `xcrun simctl launch <udid> <bundle-id>`.
- Reach screens by deep link with `xcrun simctl openurl <udid> <scheme>://<path>`, or by a
  DEBUG scenario or seed mechanism when the app has one. Do not use blind coordinate taps.
- Read the accessibility hierarchy before you tap. Coordinates are the last resort.

## 5. Screenshots

- Pick ONE capture mechanism per run. Use `xcrun simctl io <udid> screenshot <path>.png`
  when the file must persist for comparison. Use the MCP screenshot action when you only
  need to look now. Never use both for the same frame.
- Number the files (`round2/01-hub-gate.png`) so rounds diff cleanly against a baseline.
- A freshly erased simulator posts a system banner soon after boot. Wait for the boot to
  finish with `xcrun simctl bootstatus <udid> -b`. Then read the accessibility
  hierarchy and confirm that no system alert covers the view. Capture only after that check
  passes; a fixed short delay is not evidence.

## 6. Cadence

- Compile after the domain layer, then again after the first view. Do not compile once at
  the end.
- Run the test suite once, early, before you declare a change done.

## Related Skills

- **`app:debug`** — structured feedback loop for simulator failures, user-reported or observed
- **`app:swift-testing`** — writing the tests this loop runs
- **`app:swiftui-architecture`** — SwiftUI patterns for the code under test
