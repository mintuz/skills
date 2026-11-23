# Xcode 27 Device Interaction MCP Reference

Read this reference when driving a device or simulator with Xcode's `DeviceInteraction*` MCP tools (`DeviceInteractionStartWorkspaceSession`, `DeviceInteractionStartSession`, `DeviceInteractionInstallAndRun`, `DeviceEventSynthesize`, `DeviceInteractionEndSession`).

## Session Lifecycle

```text
DeviceInteractionStartWorkspaceSession (workspace-backed; start early)
  → DeviceInteractionInstallAndRun (builds, installs, launches; supports $(inherited) args/env)
    → DeviceEventSynthesize (observe hierarchy/screenshot and run interactionCommand)
  → DeviceInteractionEndSession (always close when done)
```

- Pass `commandLineArguments: ["$(inherited)", "--reset-state"]` and `environmentVariables: {"$(inherited)": "", "DEBUG_MODE": "1"}` to `DeviceInteractionInstallAndRun` instead of editing the scheme.
- When delegating device verification to a subagent, pass the open session identifier for exclusive use by that subagent.

## Reading Hierarchy Output

Each hierarchy line includes frame bounds and a calculated `hitPoint`:

```text
UIButton "Login" {{110, 205}, {30, 20}}, hitPoint: {125.0, 215.0}
UIButton "Banner" {{140, 205}, {20, 20}}, hitPoint: {150.0, 215.0}, activationBundleId: com.other.app
```

- Always tap `hitPoint` coordinates first; use screenshot-estimated coordinates only after confirming a `hitPoint` tap had no effect or when an element is marked `isRemoteLeafPlaceholder`.
- When an element includes `activationBundleId: <bundle-id>`, pass `activationBundleId` to `DeviceEventSynthesize` (optionally with an empty `interactionCommand`) before interacting with it. App activation is expensive, so pass it only when required.
- Inspect the full-size screenshot if thumbnail resolution is insufficient.

## `interactionCommand` Syntax

| Command | Description |
| --- | --- |
| `t <x> <y> [duration]` | Tap at coordinates with optional hold duration |
| `d <x> <y>` | Double tap |
| `t <x1> <y1> f <x2> <y2> [duration]` | Swipe from `(x1, y1)` to `(x2, y2)` |
| `drag <x1> <y1> <x2> <y2> [holdDuration] [moveDuration]` | Press-and-hold then drag (reordering lists, drag-and-drop) |
| `mt [x1 y1, ...] dur [x1 y1, ...] dur ...` | Multi-touch keyframes; end a finger with an empty comma slot (`[, x y]`) or fewer entries |
| `b h/p/u/d [duration]` | Hardware button: `h` Home, `p` Power, `u` VolUp, `d` VolDown |
| `b c/s/a [duration]` | **watchOS:** `c` Digital Crown press, `s` side button, `a` Action button |
| `sender keyboard kbd <text>` | Type verbatim text (**must be the last command**); use `\u{000A}` (Return) and `\u{0009}` (Tab) |
| `w <duration>` | Wait for a duration |
| `orientation faceDown/faceUp/landscapeLeft/landscapeRight/portrait/portraitUpsideDown` | Set iOS device orientation |
| `hinge <degrees>` | **Foldable devices:** set hinge angle (`0` closed, `180` open) |
| `c <rotations>` | **watchOS:** rotate Digital Crown (`1.0` = one full revolution) |
| `r up/down/left/right/select/menu/playpause/home` | **tvOS:** Siri Remote directional/action buttons |

### tvOS (Focus-Based Navigation)

tvOS has no touchscreen. Read the hierarchy to find the `Focused` element and element order, chain directional presses in a single command (for example `r right r right r select`), and capture once afterwards rather than capturing after every step.
