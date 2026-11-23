# Migrating `XCUIAutomation` UI Test Bundles on Xcode 27+

Read this reference only when a project explicitly targets Xcode 27+ and has authorised migrating an `XCUIAutomation` UI test bundle into Swift Testing. By default, Swift Testing offers no UI-automation replacement for XCUITest, and existing UI test targets stay on `XCTestCase` (`app:xcuitest`).

- Swift Testing tests in Xcode 27+ UI test bundles can call `XCUIAutomation` APIs directly.
- UI test mode executes serially on the main actor. Annotate UI test suites or test functions `@MainActor` so isolation is explicit without extra `await`s.
- Failures inside `XCUIAutomation` APIs (missing elements, undelivered events) terminate the test automatically even if the test function is not `throws`. The test runner exits and relaunches to continue the remaining tests, which reinitialises global state and any side effects.
- Replace `XCTAssert` calls with `#expect` / `try #require` without inserting new defensive existence checks unless they match existing assertion patterns.

```swift
@MainActor
struct MyUITests {
    let app = XCUIApplication()

    init() {
        app.launch()
    }

    @Test
    func `Increment button adds 1 to title`() throws {
        let incrementButton = app.buttons["Increment"].firstMatch
        let valueText = app.textFields["Value"].firstMatch
        try #require(valueText.value as? String == "0")
        incrementButton.tap()
        #expect(valueText.value as? String == "1")
    }
}
```
