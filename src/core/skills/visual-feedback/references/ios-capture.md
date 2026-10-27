# iOS capture

Use the project's saved build/install/launch/navigation recipe. When installed,
`xcode-dev-loop` owns those mechanics. Otherwise discover the Xcode project or
workspace, scheme/configuration, build path, bundle identifier and runtime/device
with the project's commands and `xcodebuild -list` / `xcrun simctl list devices
available -j`. Pin one simulator UDID, not an ambiguous device name.

Build the intended working tree, including relevant uncommitted layout changes.
Install and launch that exact product on the selected owned simulator/device.
Record its identity; a stale installed app, yesterday's screenshot and a SwiftUI
preview are not proof of the current running product.

Use a supported accessibility-driven interaction tool or existing UI test to reach
the public screen/state. A seed or deep link may establish a precondition, not
replace the interaction whose appearance is under review. Match appearance,
content size, orientation, locale, focused field and keyboard/permission state as
required by the report. Read the accessibility hierarchy before a tap; coordinates
are a last resort, not a replacement for target identity.

For persistent simulator captures, use the following template only after resolving
the selected owned device and output path:

```sh
xcrun simctl io <owned-udid> screenshot <retained-evidence-path>.png
```

An available simulator capture tool is also valid. Pick one mechanism for the
frame; don't capture twice merely to use both tools. Number comparable frames.
After boot, wait for actual readiness and confirm no system alert/banner covers
the view. A fixed sleep does not prove that state.

Capture the target visibly at the relevant transition phase, with accessibility
or equivalent state evidence. For a keyboard overlap, compare the same focused
field and visible keyboard before/after rebuilding and reinstalling. Keep cause
hypotheses separate until actual layout/state/log evidence distinguishes them.

Never erase a shared simulator, reset another app's data or borrow a user device
session implicitly. Clean only owned app/fixture resources and retain proof.
Simulator captures do not prove device-only hardware, Siri, delivery of remote
notifications or entitlements. Name unavailable boundaries precisely.

Use synthetic data and disposable accounts. Inspect and redact shareable capture
derivatives; keep necessary originals access-controlled under the project's
retention policy. Never publish credentials, customer data or whole unreviewed
bundles. Shared-instance inspection requires explicit authority and a serial,
non-destructive driver under one lifecycle owner; preserve foreign unsaved state
and never stop, reset or clear a user-owned instance.
