---
name: swift-testing
description: WHEN writing, running, or diagnosing Swift Testing suites, including migrating XCTest tests to them and a crashing or non-reporting test target under xcodebuild; NOT for authoring XCTest or XCUITest tests; returns macro-driven test patterns, the XCTest boundary, and the correct way to read xcodebuild results.
---

# Swift Testing Framework: Basics

Guidance for starting with Swift Testing (Testing framework) and writing clear, macro-driven tests.

## Core Concepts

- Import `Testing` to unlock macros; tests are plain functions annotated with `@Test`.
- Name tests freely; XCTest's `test` name prefix has no meaning in Swift Testing. Use `@Test("Display Name")` to set the navigator title.
- `#expect` is the primary assertion; pass a boolean expression to assert truthy outcomes.
- Assert one behaviour per test function. Split a test that checks unrelated behaviours.
- Async/throwing tests are supported via `async`/`throws` on the test function.
- Swift Testing and XCTest run side by side in the same test target. A project that still holds XCTest tests is a supported end state.
- Convert an existing XCTest target in stages when one change would be too large to review or to bisect. Give the staged order, one class or small batch per stage. Keep the target green between stages.
- Swift Testing covers unit and integration tests. It provides no UI-automation API and no performance-measurement API. Keep XCUITest tests and XCTest `measure` performance tests on XCTest.

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

- `#require` throws immediately when the condition is false, halting the test early.
- Handy for unwrapping optionals before continuing with more assertions.

```swift
@Test func verifyOptionalFunc() throws {
    let result = try #require(optionalFunc()) // unwrap or fail fast
    #expect(result > 0)
}
```

## Recording Issues

Use `Issue.record("message")` to record a failure. It does not stop the test, so add an explicit `return` when the rest of the test cannot run. Prefer `try #require` when a value must exist before the test continues.

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

- Swift Testing does not emit XCTest's `Test Case ... passed` lines. Treat `Executed 0 tests, with 0 failures` as the empty XCTest summary. It proves nothing about the Swift Testing run.
- Read the verdict from the fresh result bundle. A pass requires the expected non-zero test count there, no failure or crash there, and a zero exit status. The `✔ Test run with N tests in M suites passed` console line corroborates that count. A filtered or `-quiet` log can omit that line, so never treat its absence alone as the whole verdict.
- Give every run a fresh `-resultBundlePath <bundle>`. Scope the run with `-only-testing` when one target or test matters. Preserve the log. Read the bundle with `xcrun xcresulttool get test-results summary --path <bundle>`. Crash reasons such as `Test crashed with signal abrt` may appear only there.
- When a run reports zero tests, suspect the selection before the code. Confirm that `-only-testing` still names the current suite and test after any rename. Confirm that the target belongs to the test plan.
- Take the expected test count from the target's tests or its test plan. Never take it from the run you are judging.
- Treat `The test runner hung before establishing connection` as an environmental fault. Run `xcrun simctl shutdown all`. Then retry the run once.
- `test-without-building` runs the product and `.xctestrun` file that an earlier build produced. Rerun with `xcodebuild test` when that product is the suspect, so the build graph runs before the tests. A load error names the missing library, not the cause. When a load failure survives the rebuild, inspect the framework's embedding and runpath settings as candidates.

## Parameterized and Parallel Tests

- Put table cases in one `@Test(arguments:)`. Keep arguments immutable and `Sendable`. Give a case type a stable `CustomTestStringConvertible` description when its values do not identify failures clearly.
- Swift Testing runs tests and parameterized cases in parallel by default. Create every mutable fixture inside the test invocation, for example an in-memory database container, its context, the object under test, and its records. Share only immutable case data.
- Swift Testing does not isolate `static` properties, singletons, or other global state between tests. Never reach a mutable fixture through one.
- Use `.serialized` only when a dependency genuinely cannot be isolated. Keep production concurrency unchanged.
- Prove a flake fixed with repeated full-target runs under normal parallel execution, the expected case count, and clean fresh result bundles; one isolated pass is insufficient.
