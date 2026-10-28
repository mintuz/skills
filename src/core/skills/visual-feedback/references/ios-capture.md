# iOS capture

Use the project's documented recipe/setup hooks through one execution owner.
When available, `xcode-dev-loop` owns build/install/launch/navigation/capture.
Request the identity and capture-state fields in workflow step 2 of the parent
skill. Inspect the returned image; do not start a parallel simulator driver.

If neither a suitable recipe nor that companion is available, use this minimal
capture fallback. Do not require an optional plugin to proceed.

1. If the project requires a specific Xcode, set `DEVELOPER_DIR` before any
   `xcodebuild` or `xcrun` command below. Keep that selection for every command;
   do not change global Xcode selection. Record the selection,
   `xcodebuild -version` and `xcrun --sdk iphonesimulator --show-sdk-version`.
   Discover the actual workspace/project, scheme and configuration with
   `xcodebuild -list`. List devices with `xcrun simctl list devices available -j`.
   Select an owned or explicitly authorised device by UDID, not an ambiguous
   name. To create an independent device, resolve a compatible available type
   and runtime from `xcrun simctl list devicetypes` and `xcrun simctl list runtimes`,
   then run `xcrun simctl create <run-unique-name> <device-type-id> <runtime-id>`.
   Use the returned UDID. Record its name, runtime and reported data path from
   the device inventory before boot.
2. Build the intended working tree for that device. The templates below use a
   project; use the resolved `-workspace` flag instead when appropriate.
   Resolve every placeholder, including a new owned DerivedData path, first:
   If the build can outlive the command deadline, use the host's background job
   facility and keep its handle. Wait for the real exit status before continuing.

   ```sh
   xcodebuild -project <project.xcodeproj> -scheme <scheme> -configuration <configuration> -destination 'platform=iOS Simulator,id=<owned-udid>' -derivedDataPath <owned-derived-data> CODE_SIGNING_ALLOWED=NO build
   xcodebuild -project <project.xcodeproj> -scheme <scheme> -configuration <configuration> -destination 'platform=iOS Simulator,id=<owned-udid>' -derivedDataPath <owned-derived-data> CODE_SIGNING_ALLOWED=NO -showBuildSettings -json
   ```

   Keep the build exit status and log. Stop on failure. From the intended app
   target's settings, join `BUILT_PRODUCTS_DIR` and `FULL_PRODUCT_NAME`; do not
   choose the UI-test runner. Read `CFBundleIdentifier` from that built app's
   `Info.plist` with `/usr/libexec/PlistBuddy -c 'Print :CFBundleIdentifier'`.
   Record source identity including dirty changes and the actual built product.
3. Before installation, confirm authority to modify this device/app. Serial
   inspection permission alone does not permit installing over a shared app.
   Boot only the resolved device:

   ```sh
   xcrun simctl bootstatus <owned-udid> -b
   ```

   On this run's owned device only, set the required text size before launch:
   `xcrun simctl ui <owned-udid> content_size <required-category>`.
   Read it back with `xcrun simctl ui <owned-udid> content_size`; inspect
   `simctl help ui` for supported categories. Do not change shared-device settings.
   Then install the resolved product over the existing app, preserving its data,
   and launch the resolved identifier. Do not uninstall the app or clear its data:

   ```sh
   xcrun simctl install <owned-udid> <resolved-built-app-path>
   xcrun simctl launch <owned-udid> <resolved-bundle-id>
   ```

4. Reach the public state with accessible interactions or an existing UI test.
   A seed/deep link may establish a precondition, not replace the reviewed action.
   Match text size, orientation, locale, appearance, focus and keyboard/permission
   state.
   Inspect the hierarchy before taps; coordinates are a last resort. Focus the
   named field with an available accessible driver or existing UI test, then
   query keyboard presence and inspect the image: focus alone does not prove
   a visible keyboard. If this requires a global Simulator hardware-keyboard
   change, or no driver can establish the condition, leave global settings
   untouched and report that capture condition blocked.
   Wait for actual readiness and confirm no system alert/banner covers the target;
   a fixed delay is not proof.
5. Use one capture mechanism for the frame. An available native capture tool is
   valid; for a persistent simulator image, resolve the retained output path:

   ```sh
   xcrun simctl io <owned-udid> screenshot <retained-evidence-path>.png
   ```

   Open and inspect the actual image at the relevant transition phase. For a
   keyboard overlap, match the same focused field and visible keyboard before and
   after the authorised change through the same owner. Follow the parent skill's
   comparison-state preconditions. If the rule requires a fresh starting state,
   first create a new owned device as in step 1. Then rebuild and install as in
   steps 2–3.

Follow the parent skill's single Isolation and evidence rule, including shared
inspection authority, serial ownership and protection of foreign unsaved state.
Clean only owned resources on success, failure and cancellation; keep evidence
outside cleanup targets. For a device this run created, recheck its exact
UDID/name/runtime/data path against the receipt in `xcrun simctl list devices -j`.
If ownership still matches, shut down that UDID if booted, then run
`xcrun simctl delete <owned-udid>` and confirm it absent from the inventory.
If identity cannot be confirmed, report the cleanup gap instead of deleting.
Never erase a shared simulator or reset another app.

Use synthetic data. Inspect/redact shareable derivatives and retain required
originals access-controlled; never publish secrets, customer data or unreviewed
bundles. Simulator captures do not prove physical hardware, Siri, remote push or
entitlements. Name each unavailable boundary and unproved cause.
