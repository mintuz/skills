---
name: swift-testing
description: WHEN writing, running, or diagnosing Swift Testing suites, including a crashing or non-reporting test target under xcodebuild; NOT XCTest; returns macro-driven test patterns and the correct way to read xcodebuild results.
---

# Swift Testing Framework: Basics

Guidance for starting with Swift Testing (Testing framework) and writing clear, macro-driven tests.

## Core Concepts

- Import `Testing` to unlock macros; tests are plain functions annotated with `@Test`.
- Name tests freely; use `@Test("Display Name")` to set the navigator title.
- `#expect` is the primary assertion; pass a boolean expression to assert truthy outcomes.
- Async/throwing tests are supported via `async`/`throws` on the test function.
- Works alongside XCTest in the same project.

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

Use `#expect(throws:)` to verify a thrown error. Inspect the error via the closure overload when you need to assert the specific case.

```swift
@Test func verifyThrowingFunction() {
    #expect(throws: MyError.self) {
        try throwingFunction()
    }

    #expect {
        try throwingFunction()
    } throws: { error in
        guard let myError = error as? MyError else { return false }
        return myError == .invalidInput
    }
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

Use `Issue.record("message")` to log and exit gracefully when continuing the test is pointless.

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

- Swift Testing does not emit XCTest's `Test Case ... passed` lines. Treat `Executed 0 tests, with 0 failures` as the empty XCTest summary; it proves nothing about the Swift Testing run. A pass requires `✔ Test run with N tests in M suites passed` with the expected non-zero count, `** TEST SUCCEEDED **`, and no failure or crash in the result bundle.
- Give every run a fresh `-resultBundlePath <bundle>`, scope it with `-only-testing` when one target or test matters, and preserve its log. Read the bundle with `xcrun xcresulttool get test-results summary --path <bundle>`; crash reasons such as `Test crashed with signal abrt` may appear only there.
- Treat `The test runner hung before establishing connection` as an environmental fault. Run `xcrun simctl shutdown all`, then retry the run once.
- Set `TEST_RUNNER_<NAME>` environment variables only for `xcodebuild test`. The `test-without-building` action ignores them silently, so a re-run can pass with a stale value.

## Parameterized and Parallel Tests

- Put table cases in one `@Test(arguments:)`. Keep arguments immutable and `Sendable`; give a case type a stable `CustomTestStringConvertible` description when its values do not identify failures clearly.
- Swift Testing runs tests and parameterized cases in parallel by default. Create every mutable fixture inside the test invocation, including a fresh in-memory `ModelContainer`, `ModelContext`, repository, and records. Share only immutable case data.
- Use `.serialized` only when a dependency genuinely cannot be isolated. Keep production concurrency unchanged.
- Prove a flake fixed with repeated full-target runs under normal parallel execution, the expected case count, and clean fresh result bundles; one isolated pass is insufficient.
