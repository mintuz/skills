# Settings Persistence Through Real UI Actions

This is an illustrative XCTest UI-target example, not an implemented test in
an inspected application. Its example app contract is:

- `UITEST_STORE_ID` selects a unique test-build store.
- `UITEST_RESET=1` clears only that store at app startup; absence preserves it.
- Every launch starts with Settings closed and the initial preference is Light.
- Buttons expose `settings.open` and `appearance.dark` identifiers.
- Static text `appearance.selection` exposes the selected value as its label.

These keys and identifiers belong to the example app, not XCTest. Use an actual
project's documented equivalents; do not add undocumented keys and assume they
work. No app/backend changes are implied by this example.

```swift
import Foundation
import XCTest

final class AppearanceUITests: XCTestCase {
    @MainActor
    func testDarkAppearancePersistsAfterRelaunch() {
        continueAfterFailure = false
        let app = XCUIApplication()
        let storeID = "appearance-\(UUID().uuidString)"
        app.launchEnvironment["UITEST_STORE_ID"] = storeID
        app.launchEnvironment["UITEST_RESET"] = "1"
        app.launch()
        defer { app.terminate() }

        openSettings(in: app)
        let selection = app.staticTexts["appearance.selection"]
        assertLabel("Light", on: selection)

        let dark = app.buttons["appearance.dark"]
        assertActionable(dark)
        dark.tap()
        assertLabel("Dark", on: selection)

        // Preserve this same store: reset happens on the first launch only.
        app.terminate()
        app.launchEnvironment.removeValue(forKey: "UITEST_RESET")
        app.launch()

        openSettings(in: app)
        assertLabel("Dark", on: app.staticTexts["appearance.selection"])

        let screenshot = XCTAttachment(screenshot: app.screenshot())
        screenshot.name = "Dark appearance after relaunch"
        screenshot.lifetime = .keepAlways
        add(screenshot) // Diagnostic attachment, not a pixel comparison.
    }

    @MainActor
    private func openSettings(
        in app: XCUIApplication,
        file: StaticString = #filePath,
        line: UInt = #line
    ) {
        let open = app.buttons["settings.open"]
        assertActionable(open, file: file, line: line)
        open.tap()
    }

    @MainActor
    private func assertActionable(
        _ element: XCUIElement,
        file: StaticString = #filePath,
        line: UInt = #line
    ) {
        XCTAssertTrue(
            element.waitForExistence(timeout: 5),
            "Expected control to exist",
            file: file, line: line
        )
        let ready = XCTNSPredicateExpectation(
            predicate: NSPredicate(
                format: "exists == true AND hittable == true AND enabled == true"
            ),
            object: element
        )
        XCTAssertEqual(
            XCTWaiter.wait(for: [ready], timeout: 5), .completed,
            "Expected control to be hittable and enabled",
            file: file, line: line
        )
    }

    @MainActor
    private func assertLabel(
        _ expected: String,
        on element: XCUIElement,
        file: StaticString = #filePath,
        line: UInt = #line
    ) {
        XCTAssertTrue(
            element.waitForExistence(timeout: 5),
            "Expected selection text to exist",
            file: file, line: line
        )
        let updated = XCTNSPredicateExpectation(
            predicate: NSPredicate(format: "label == %@", expected),
            object: element
        )
        XCTAssertEqual(
            XCTWaiter.wait(for: [updated], timeout: 5), .completed,
            "Expected selection label: \(expected)",
            file: file, line: line
        )
        XCTAssertEqual(element.label, expected, file: file, line: line)
    }
}
```

The helpers are local teaching examples; reuse the suite's supported helpers
instead of creating a second wait abstraction. The five-second bounds are
example limits, not a reason to increase a timeout until a broken test passes.
Use the project's isolation/concurrency conventions for the installed Swift SDK.

The default-Light assertion makes an always-Dark or incorrect initial fixture
visible. The post-tap assertion checks the public state change; the post-relaunch
assertion would fail if the app only changed in-memory state. It still does not
prove every appearance mode, system theme integration or a screenshot baseline.

The example terminates its app but does not invent a store-deletion API. Before
using it in a project, bind the unique namespace to that project's real fixture
ownership/cleanup mechanism and register its existing teardown on success/error.
Keep the store until the persistence assertion and required diagnostics finish;
retain evidence outside its cleanup scope. Do not reset a shared simulator or
claim that process termination deletes a store, keychain entry or backend data.

Use synthetic data and disposable accounts in retained screenshots and bundles.
Inspect and redact shareable derivatives, including `.keepAlways` attachments;
keep necessary originals access-controlled under the project's retention policy.
Never publish credentials, customer data or whole unreviewed bundles.

Run the actual case through `xcode-dev-loop` or the project's existing command
only when authorised. The source above has no execution evidence. A fresh
result must identify this case, its build/runtime and fixture; a successful build
or screenshot attachment alone does not prove it ran.
