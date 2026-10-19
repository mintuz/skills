---
name: swift-testing
description: WHEN writing, running, or diagnosing Swift Testing suites, including migrating XCTest tests to them and a crashing or non-reporting test target under xcodebuild; NOT for authoring XCTest or XCUITest tests; returns macro-driven test patterns, the XCTest boundary, and the correct way to read xcodebuild results.
---

# Swift Testing Framework: Basics

## Core Concepts

- Import `Testing` to unlock macros; tests are plain functions annotated with `@Test`.
- Name tests freely; XCTest's `test` name prefix has no meaning in Swift Testing. Use `@Test("Display Name")` to set the navigator title.
- `#expect` is the primary assertion; pass it a boolean expression.
- Assert one behaviour per test function; split a test that checks unrelated behaviours.
- Mark the test function `async`/`throws` for async or throwing tests.
- Swift Testing and XCTest run side by side in the same test target; a project that still holds XCTest tests is a supported end state.
- When one change would be too large to review or bisect, convert an XCTest target in stages: give the staged order, one class or small batch per stage, and keep the target green between stages (`principle-sequence-verifiable-units`).
- Swift Testing covers unit and integration tests but has no UI-automation or performance-measurement API. Keep XCUITest tests and XCTest `measure` performance tests on XCTest.

## Example: Simple Test

```swift
import Testing

func add(_ a: Int, _ b: Int) -> Int { a + b }

@Test("Verify addition function") func verifyAdd() {
    let result = add(1, 2)
    #expect(result == 3)
}
```

## Expecting Throws

Pass an error type to `#expect(throws:)` to assert that any error of that type is thrown. Pass an `Equatable` error value to assert the exact case. Bind the error that `#require(throws:)` returns when you must assert on its properties; Xcode 16.3 added that returned error. Do not use the deprecated `throws:` matcher-closure overload.

```swift
@Test func verifyThrowingFunction() throws {
    #expect(throws: MyError.self) {
        try throwingFunction()
    }

    #expect(throws: MyError.invalidInput) {
        try throwingFunction()
    }

    let error = try #require(throws: MyError.self) {
        try throwingFunction()
    }
    #expect(error == .invalidInput)
}
```

## Require vs Expect

`#require` throws immediately when the condition is false, halting the test. It is handy for unwrapping optionals before further assertions.

```swift
@Test func verifyOptionalFunc() throws {
    let result = try #require(optionalFunc()) // unwrap or fail fast
    #expect(result > 0)
}
```

## Recording Issues

`Issue.record("message")` records a failure without stopping the test; add an explicit `return` when the rest cannot run. Prefer `try #require` when a value must exist before the test continues.

```swift
@Test func verifyOptionalFunc() throws {
    guard let result = optionalFunc() else {
        Issue.record("optional result is nil")
        return
    }
    #expect(result > 0)
}
```

## Reading Results Under xcodebuild

`app:xcode-dev-loop` owns reading xcodebuild results; keep these rules when you run Swift Testing:

- `Executed 0 tests, with 0 failures` is the empty XCTest summary; it proves nothing about the Swift Testing run.
- Give every run a fresh `-resultBundlePath <bundle>` and read the verdict there with `xcrun xcresulttool get test-results summary --path <bundle>`: a pass needs the expected non-zero test count, no failure or crash, and a zero exit status (`principle-prove-it-works`).
- Take the expected test count from the target's tests or test plan, never from the run you are judging.
- A run that executed zero tests is not a pass, whatever its exit status (`principle-gaps-are-not-passes`). Suspect the selection first: confirm `-only-testing` still names the current suite and test after any rename, and that the target belongs to the test plan.
- When `test-without-building` fails to load the test bundle, rerun with `xcodebuild test` so the build graph runs first. A load error names the missing library, not the cause.
- When the test runner hangs before establishing connection, shut down only the pinned simulator (`xcrun simctl shutdown <udid>`), then retry once with a new result-bundle path (`principle-clean-up-what-you-started`).

## Parameterized and Parallel Tests

- Put table cases in one `@Test(arguments:)` with immutable, `Sendable` arguments. When a case type's values do not identify failures clearly, give it a stable `CustomTestStringConvertible` description.
- Tests and parameterized cases run in parallel by default. Create every mutable fixture inside the test invocation (e.g. an in-memory database container, its context, the object under test, its records); share only immutable case data (`principle-separate-before-serializing-shared-state`).
- Swift Testing does not isolate `static` properties, singletons, or other global state between tests; never reach a mutable fixture through one.
- Use `.serialized` only when a dependency genuinely cannot be isolated; keep production concurrency unchanged.
- Prove a flake fixed with repeated full-target runs under normal parallel execution, the expected case count, and clean fresh result bundles; one isolated pass is insufficient (`principle-scale-verification`).
