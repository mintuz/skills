---
name: swift-testing
description: WHEN writing, running, or diagnosing Swift Testing suites, including migrating XCTest tests to them and a crashing or non-reporting test target under xcodebuild; NOT for authoring XCTest or XCUITest tests; returns macro-driven test patterns, the XCTest boundary, and the correct way to read xcodebuild results.
---

# Swift Testing

Author, modernise, and diagnose Swift Testing suites (`import Testing`), and migrate eligible `XCTestCase` suites cleanly.

## Core Concepts and XCTest Boundary

- Import `Testing` to unlock macros; tests are plain functions annotated with `@Test`.
- Name tests freely without XCTest's `test` prefix: keep simple names `lowerCamelCase` (`@Test func ignition()`) and use raw identifiers in sentence case for multi-word behavioural descriptions (``@Test func `Engine does not stall`()``), or `@Test("Display Name")` for a custom navigator title.
- `#expect` is the primary assertion; pass it a boolean expression.
- Assert one behaviour per test function; split a test that checks unrelated behaviours.
- Mark the test function `async` / `throws` when needed.
- Swift Testing and XCTest run side by side in the same test target and even in the same file; a project that keeps XCTest targets or classes is a supported end state.
- When a migration would be too large to review or bisect, convert an XCTest target in stages: give the staged order, migrate one class or small batch per stage, and keep the target green between stages (`principle-sequence-verifiable-units`).
- **What stays on XCTest:** Swift Testing offers no UI-automation replacement for XCUITest (`XCUIApplication`) and no performance-measurement replacement for XCTest's `measure { ... }` baseline API. Keep `measure { ... }` performance tests on XCTest (other methods in the same `XCTestCase` can still migrate) and keep `XCUIApplication` UI test targets on XCTest (`app:xcuitest`). (Only when a user explicitly asks to migrate an `XCUIAutomation` bundle on Xcode 27+, read `references/xcuiautomation-migration.md`.)
- **Public API only:** Never introduce underscore-prefixed symbols such as `#_sourceLocation`; use the full `SourceLocation(fileID:filePath:line:column:)` initialiser (leave pre-existing `#_sourceLocation` usages untouched during modernisation).

## Assertions, Errors, and Issues

### Expecting or Forbidding Throws

- `#expect(throws:)` replaces `XCTAssertThrowsError`; `#expect(throws: Never.self)` (or `try #require(throws: Never.self)` when halting on failure) replaces `XCTAssertNoThrow`.
- Whenever the error type is `Equatable` and the expected error case is known, always pin the specific error value (for example `#expect(throws: FormatError.negativeAmount)`) rather than the broader error type (`FormatError.self`) or `(any Error).self`.
- Pass an error type (`MyError.self`) only when any case of that type is valid. Both `#expect(throws:)` (returns `Error?`) and `try #require(throws:)` (returns unwrapped `Error`, Xcode 16.3+) return the thrown error when you must assert on its properties. Never use the deprecated `throws:` matcher-closure overload.

```swift
@Test func `Rejects negative amount`() throws {
    #expect(throws: FormatError.negativeAmount) {
        try formatter.validate(-1)
    }

    #expect(throws: Never.self) {
        try formatter.prepare()
    }

    let error = try #require(throws: MyError.self) {
        try throwingFunction()
    }
    #expect(error.code == 42)
}
```

### `#require`, `#expect`, and `Issue.record`

- `try #require(...)` halts the test immediately on `false` or `nil`; use it to unwrap optionals instead of force-unwrapping (`!`), and whenever subsequent lines cannot run meaningfully after failure.
- Prefer converting `guard ... else { Issue.record(...); return }` into `try #require(...)` and `if !condition { Issue.record(...) }` into `#expect(condition)` where not disruptive; drop redundant messages when the expression is self-explanatory.
- Keep `Issue.record("message")` only when recording a non-fatal failure explicitly (add `return` when execution cannot continue).

## Migrating `XCTestCase` to Swift Testing

Survey candidate files in one pass before editing; settle naming and `struct` vs `final class` choices up front, then migrate one `XCTestCase` class at a time.

### Behavioural Differences and Traps

- **`Foundation` is not re-exported:** `XCTest` re-exports `Foundation`, but `Testing` does not. When removing `import XCTest`, add `import Foundation` whenever the file uses `URL`, `Data`, `Date`, `Locale`, `CharacterSet`, `ProcessInfo`, or other Foundation types.
- **`continueAfterFailure = false`:** When set inside a test method, convert every subsequent assertion in that method to `try #require(...)` and mark the test `throws`. When set in `setUp()` / `setUpWithError()`, it applies to **all assertions in every test method** of that class (plus setup/teardown): convert all of them to `try #require(...)`. Never downgrade an existing `try #require` to `#expect`.
- **Suite type, `setUp`, and `tearDown`:**
  - Prefer `struct` for suites. Swift Testing creates a fresh instance before each test, so replace `setUp()` / `setUpWithError()` stored properties with inline initialisers or `init()` (which may be `async` and `throws`; throwing in `init` fails the test). Mark methods mutating `struct` properties `mutating`.
  - When `tearDown()` cleanup is required, use `final class` or `actor` with `deinit` (not a `struct`).
- **Isolation and parallelism:** XCTest runs synchronous tests on `@MainActor` sequentially within a class; Swift Testing runs tests concurrently on the Swift Concurrency cooperative pool. Add `@MainActor` only where a test explicitly relied on main-actor isolation — never defensively. Add `@Suite(.serialized)` only when mutable state genuinely cannot be isolated.
- **No accuracy overload:** Swift Testing has no `XCTAssertEqual(_:_:accuracy:)` overload (note this explicitly when migrating accuracy assertions). Compare with an explicit floating-point tolerance (`abs(actual - expected) <= tolerance`), or `isApproximatelyEqual` if `swift-numerics` is already a dependency.

### API Mapping Reference

| XCTest | Swift Testing | Notes |
| --- | --- | --- |
| `XCTAssertThrowsError` | `#expect(throws:)` / `try #require(throws:)` | Pin exact `Equatable` case when known |
| `XCTAssertNoThrow` | `#expect(throws: Never.self)` / `try #require(throws: Never.self)` | Preserves failure-halting with `#require` |
| `XCTestExpectation` + `fulfill()` + `await fulfillment(of:)` | `await confirmation("...") { confirm in ... }` | For `assertForOverFulfill = false` with `expectedFulfillmentCount = N`, pass `expectedCount: N...` |
| `try XCTSkipIf(cond)` | `@Test(.disabled(if: cond))` | Use `@available(...)` on the test function for OS/platform checks instead of `.enabled(if:)` |
| `try XCTSkipUnless(cond)` | `@Test(.enabled(if: cond))` | — |
| Mid-test `throw XCTSkip("reason")` | `try Test.cancel("reason")` | Stops the running test as cancelled |
| `XCTExpectFailure("...") { ... }` | `withKnownIssue("...") { ... }` | `.nonStrict()` / `strict: false` → `isIntermittent: true`; conditional/matching → `when:` / `matching:` |
| `XCTAttachment` + `self.add(...)` | `Attachment.record(value)` | `Attachable` is automatic for `Codable` and `NSSecureCoding` with `import Foundation` |

## Parameterised, Parallel, and Modernised Suites

- Collapse tests that loop over inputs or repeat identical logic across functions into `@Test(arguments:)` with immutable, `Sendable` arguments. Give every parameterised case struct a distinct name/identifier and `CustomTestStringConvertible` (`var testDescription: String`) so each failing case is independently identifiable.
- Tests and parameterised cases run in parallel by default. Create every mutable fixture (in-memory database container, context, object under test, seeded records) inside each test invocation; share only immutable case data (`principle-separate-before-serializing-shared-state`).
- Swift Testing does not isolate `static` properties, singletons, or global state between tests; never reach a mutable fixture through one.
- Audit existing suites so `@MainActor` and `.serialized` remain only where required, and promote unnecessary `Issue.record` guards into `#expect`/`try #require`.
- Never alter production concurrency merely to work around test shared state. Prove a flake fixed with repeated full-target runs under normal parallel execution, the expected case count, and fresh result bundles; one isolated pass is insufficient (`principle-scale-verification`).

## Reading Results Under `xcodebuild`

`app:xcode-dev-loop` owns running `xcodebuild` and interpreting results; keep these rules whenever you diagnose a Swift Testing run:

- `Executed 0 tests, with 0 failures` is the empty XCTest summary; it proves nothing about Swift Testing tests.
- Give every run a fresh `-resultBundlePath <bundle>` and read the verdict with `xcrun xcresulttool get test-results summary --path <bundle>`: a pass requires the expected non-zero test count, no failure or crash, and a zero exit status (`principle-prove-it-works`).
- Take the expected test count from the target's tests or test plan, never from the run being judged.
- A run that executed zero tests is never a pass, whatever its exit status (`principle-gaps-are-not-passes`). Check the selection first: confirm `-only-testing` matches any renamed suite/test and that the target is in the test plan.
- When `test-without-building` fails to load the test bundle, no test ran and disabling a test (`.disabled()`) cannot make a bundle that never loads succeed. Rerun with `xcodebuild test` and a fresh result bundle so the build graph runs first; a load error names the missing library, not the root cause.
- When the test runner hangs before establishing connection, shut down only a run-owned pinned simulator (`xcrun simctl shutdown <udid>`), then retry once with a fresh result-bundle path (`principle-clean-up-what-you-started`).
