---
name: swift-testing
description: >
  WHEN writing or migrating Swift unit and integration tests with Swift Testing, including async code, errors, parameterization, suites, or XCTest coexistence; NOT for XCTest UI or performance tests; writes the smallest sensitive test and verifies it under the resolved toolchain.
---

# Swift Testing

Use Swift Testing for unit and integration tests. Keep UI tests, performance tests, and untouched XCTest tests in XCTest. Both frameworks may share a test target; keep each test entirely within one framework.

## 1. Read the local contract

Inspect the resolved Swift toolchain, test target, test command, system under test, and closest tests. Follow the repository's suite organization, naming, fixtures, isolation, and dependency boundaries where they remain correct.

Choose the branch:

- **Behavior change or defect fix:** write a test that fails for the missing behavior before changing production code.
- **Coverage, characterization, or test maintenance:** establish the current passing baseline; preserve the observed behavior.
- **XCTest migration:** preserve every assertion, setup dependency, actor boundary, and tested case before removing the migrated XCTest test.

**Complete when:** the exact observable behavior, test location, framework boundary, and runnable command are identified, and every requested case belongs to one branch.

## 2. Write the smallest sensitive test

Arrange only the state that affects the behavior, perform one action, and assert its observable result. Reuse production entry points and existing test helpers. Parameterize when the same body covers multiple meaningful inputs; keep distinct behaviors in distinct tests.

For a behavior change or defect fix, run the narrowest test before the production change and capture the expected failure. Completion requires the intended assertion to fail for the intended reason; correct a test that passes or fails incidentally. For the other branches, capture the passing baseline.

**Complete when:** each requested behavior maps to an assertion that fails for the intended defect or passes against the preserved baseline, with the command and result recorded.

## 3. Make the suite green

Apply the smallest production or test change, then run the narrowest affected test and the containing test target. Keep fixtures independent because Swift Testing runs tests in parallel by default; use `.serialized` only when serial access is part of an unavoidable shared-resource contract.

Treat compiler diagnostics as toolchain evidence. Use APIs available to the repository's resolved Swift version rather than assuming the latest SDK.

**Complete when:** every new or changed case and the containing target pass under the resolved toolchain, or the exact command and external blocker are reported without claiming a pass.

## 4. Hand off evidence

Report changed files, the behavior covered, baseline or red result, green commands and results, and any case blocked from execution.

**Complete when:** every requested behavior has a test outcome or an explicit blocker.

## Swift Testing patterns

Import `Testing` only in test targets. Test functions may be free functions or members of a suite type; use the repository's existing organization.

```swift
import Testing

@Test("Addition returns the sum")
func addition() {
    #expect(add(1, 2) == 3)
}
```

Use `#expect` for checks that may fail while the test continues. Use `try #require` when later checks need a value or precondition; the containing test must be `throws`.

```swift
@Test
func loadsSavedValue() throws {
    let value = try #require(loadValue())
    #expect(value.isSaved)
}
```

Test thrown errors by value or type. The typed overload returns the matching error for further checks.

```swift
@Test
func rejectsInvalidInput() {
    let error = #expect(throws: ValidationError.self) {
        try validate("")
    }
    #expect(error == .emptyInput)
}
```

Mark the test `async` or `throws` when the code requires it. Await structured-concurrency APIs directly; use `confirmation` for callback or event behavior that must occur before its closure returns.

```swift
@Test(arguments: [0, 1, 42])
func roundTrips(_ value: Int) throws {
    #expect(try decode(encode(value)) == value)
}
```

Use `Issue.record("…")` for an unconditional failure when Swift syntax prevents an expectation. Use `withKnownIssue` only for a documented failure whose test should continue to run.

## XCTest migration

Translate semantics, not syntax:

| XCTest | Swift Testing |
| --- | --- |
| `XCTAssertEqual(a, b)` | `#expect(a == b)` |
| `XCTAssertThrowsError(try f())` | `#expect(throws: (any Error).self) { try f() }` |
| `try XCTUnwrap(value)` | `try #require(value)` |
| `XCTFail("message")` | `Issue.record("message")` |
| `XCTestExpectation` | Swift concurrency, or `confirmation` for callbacks |
| `XCTExpectFailure` | `withKnownIssue` |

For lifecycle hooks, asynchronous expectations, known failures, or mixed-framework targets, read Apple's current [migration guide](https://developer.apple.com/documentation/testing/migratingfromxctest) before editing. Leave XCTest UI and performance tests in XCTest.
