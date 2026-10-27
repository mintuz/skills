# Recognise the Alert Before Handling It

Prefer the project's already approved system-prompt handler for its supported
OS versions and locales. Permission alert wording and button structure vary;
there is no universal camera permission button string. Inspect the actual
hierarchy and use the approved expected title/action for that environment.

## App-owned alerts

A validation or confirmation alert in the app can normally be queried with
`app.alerts`. Select the intended alert, wait for it, select the named button,
wait until it is actionable and tap it. Then assert both the alert's dismissal
and the required resulting app state with bounded expectations. Do not treat a
successful tap as proof that the user's intended action completed.

## System interruptions

The following is an example XCTestCase instance method using real XCTest APIs.
It is an alert matcher, not a complete permission test or a replacement for a
project's approved handler. The caller supplies the inspected expected alert
title and exact action label for its pinned OS/locale; they are not invented
cross-platform constants.

```swift
import Foundation
import XCTest

// Inside the project's XCTestCase subclass:
@MainActor
private func installExpectedPermissionMonitor(
    alertTitle: String,
    actionLabel: String,
    didHandleExpectedAction: @escaping () -> Void
) -> NSObjectProtocol {
    addUIInterruptionMonitor(withDescription: "Expected permission alert") { alert in
        let isExpected = alert.label == alertTitle
            || alert.staticTexts[alertTitle].exists
        guard isExpected else { return false }

        let actions = alert.buttons.matching(
            NSPredicate(format: "label == %@", actionLabel)
        )
        guard actions.count == 1 else { return false }
        let action = actions.element(boundBy: 0)
        guard action.isHittable && action.isEnabled else { return false }
        action.tap()
        didHandleExpectedAction()
        return true
    }
}
```

The single-element check prevents an arbitrary first-button tap. Returning
`false` leaves an unexpected alert unclaimed by this monitor, but XCTest's
implicit interruption handling may still dismiss it. `true` means this handler
tapped the recognised expected action, not that the whole test has passed.
If the project needs more identifying structure than the title, extend its
existing matcher to that observed structure rather than matching every alert.

Use the monitor in this order:

1. Prepare an owned simulator/fixture with known undetermined permission.
   Record the device/runtime, locale and fixture identity. Store reset alone
   does not establish OS permission state.
2. Register the monitor before tapping the app's Scan receipt control. Keep its
   returned token and remove it with `removeUIInterruptionMonitor(_:)` in a
   `defer` or the established teardown mechanism. Start a local handler flag at
   `false` and pass a callback that sets it to `true` only after the expected tap.
3. Trigger the prompt through the public Scan receipt action. An interruption
   monitor is not an alert listener that runs merely because time passed: use
   the suite's known safe next app interaction to encounter the interruption
   and invoke it. Do not blindly tap a potentially destructive app control.
4. Assert that the handler flag became `true`, then wait with a finite timeout
   for `scanner.ready` and assert it. Verify the actual permission/app outcome
   and that the prompt has gone when required. An absent prompt or a changed
   state alone does not prove this handler ran: implicit handling may dismiss an
   unclaimed alert. Fail on unrelated prompts or a flag that remains `false`.
5. Run a separate already-denied fixture case. Tap Scan receipt, wait for and
   assert `camera.explanation` and the named Open Settings action; exercise and
   check Settings navigation if the requirement includes it. Do not reuse the
   allow case's order-dependent permission state.

An owned undetermined → deny case may also be needed by the contract. Prepare
that state independently; do not change the allow handler into an accept-anything
handler. Use direct SpringBoard/system queries only where the project's approved
convention supports them, still matching the specific alert and intended action
with bounded waits. Never use `buttons.element(boundBy: 0)` without the preceding
unique intended-action query.

Keep result bundles and diagnostic screenshots for failed handling as well as
success. Do not add a catch-all dismissal, fixed sleep or retry to hide an
unexpected alert. When the simulator cannot capture a real camera image, this
proves permission/scanner UI only; hardware capture stays unverified until a
supported physical-device case exercises it.

Use synthetic data and disposable accounts. Inspect and redact shareable
derivatives; keep necessary originals access-controlled under the project's
retention policy. Never publish credentials, customer data or whole unreviewed
result bundles.
