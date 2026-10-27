---
name: visual-feedback
description: WHEN assessing a reported visual issue or iterating on agreed visual changes in a web or iOS app; NOT for unattended visual-regression suites or requirement acceptance; reproduces actual states and compares evidence before and after authorised changes.
---

# Visual feedback

Capture screenshots and collaborate with users on visual refinements. Treat specific feedback and explicit implementation approval in the current request as already supplied. Whenever you block on a missing fact or decline a request, state the reason so the user can act on it.

Use the project's verification recipe and available host capabilities first. Missing Playwright MCP alone is not a blocker. See [web capture](references/web-capture.md) or [iOS capture](references/ios-capture.md) for platform mechanics; optional companion skills are not prerequisites.

## Scope

An interactive loop with a person, for a reported defect or for visual iteration you drive yourself: capture the current state, agree the change with the user, confirm the result with that same user (`principle-experience-first`).

Unattended automated test suites are out of scope. Decline ownership of their tool selection, baseline updates and diff thresholds; route browser suites to `browser-testing` and iOS UI automation to `xcuitest` or the project's existing runner. Do not design part of that suite as an aside. Offer a concrete interactive alternative: reproduce the reported screen and interaction state with the user, capture it, agree the intended appearance, then compare an equivalent after-image for an authorised change. DOM-only tests cannot prove rendered appearance. Requirement satisfaction belongs to `acceptance-review`; general iOS crash/build/state diagnosis belongs to `debug`.

## Workflow

1. **Discover the reproduction facts** — Inspect supplied reports, recordings,
   environment attachments, project recipes and available runtime information first.
   Establish the route/URL or screen, viewport/device, browser/OS, build, appearance,
   data, interaction state and expected versus observed result. Carry forward known
   facts. Ask only for unavailable facts, including a screenshot or reproduction
   steps when no other source supplies them. Never guess the reported state:
   evidence from guessed conditions can neither confirm nor rule out the defect.
   A missing intended appearance need not block authorised read-only reproduction.
   Explain why any remaining unknown condition prevents a meaningful comparison.

2. **Establish identity and capture the state** — Reuse the project's launch/navigation/capture commands, or an available host-native interaction capability, before installing anything or requesting a user capture. Record the actual mechanism. Match the reported environment and state; a mismatch is a proof gap. For iOS, resolve scheme, configuration, built product, bundle identifier and simulator UDID/device, then build the intended working tree, install and launch that product. Record relevant uncommitted-source identity. Reproduce the named screen, appearance, focused field and keyboard/permission state; an old screenshot or SwiftUI preview is not a current before-image. For web widths below 500px with Chrome headless, use device emulation or an iframe harness and confirm the actual layout viewport, not just PNG dimensions. Retain a screenshot plus accessibility/focus or equivalent state evidence.

3. **Check that the capture can show the defect** — A capture counts as evidence only when the target can appear in it. Capture the phase the report names: for a settled-state defect, wait until the animation or transition finishes; for a defect during movement, capture at the reported point in the transition; when the phase is unknown, capture both during and after the transition. Capture before any auto-dismiss removes the target. Open the saved image and inspect its recorded route, fixture/interaction state and capture conditions before judging; a successful capture command or file path is not image inspection. Confirm that those conditions match the report and that the target is present in the image at non-zero size. When the target cannot appear (a hidden tab, a collapsed container, a zero-sized element, an unmounted component), put the page into a state that shows it and capture again. Discard a capture that fails these checks: it proves nothing (`principle-prove-it-works`).

4. **Gather specific feedback** — If the user has not already specified the intended result, ask: "Looking at this screenshot, what specifically would you like changed?"

5. **Separate competing causes** — When the symptom has more than one plausible cause, list the candidates and state why an image alone cannot separate them. Gather discriminating evidence: browser console/network/computed styles, or the actual Apple layout, keyboard/safe-area, state and runtime logs. Confirm the cause before proposing a repair; keep observations separate from hypotheses. Reuse `debug` for broader iOS diagnosis.

6. **Propose changes with specifics**:
   - Bad: "I'll fix the spacing"
   - Good: "I'll increase the gap between cards from 16px to 24px and add 32px padding to the container"

7. **Confirm before implementing** — When the current request does not already authorize implementation, use the user-question tool to get explicit approval (`principle-stay-in-scope`).

8. **Verify with comparison** — Recreate the same screen/route, device/viewport, browser/OS, appearance, data, focus and interaction state after the authorised change. Rebuild and reinstall the intended Apple product when applicable. Capture again, retain equivalent state evidence and apply step 3. Check relevant interaction behaviour as well as appearance. Present the before/after comparison and ask whether it matches the intended result; repeat only within the agreed scope. Keep unavailable proof explicit.

## Isolation and evidence

Prefer an independently isolated instance, browser context/device and fixture
under one run ID. Different tabs do not isolate shared mutable application state.
Never drive an instance concurrently or disturb foreign unsaved state. If isolation
is impossible, explicitly authorised, serial, non-destructive inspection of a
shared instance is allowed under one lifecycle owner. Otherwise preserve it and
report blocked. Never stop, reset or clear a user-owned instance.

Keep before/after evidence outside cleanup targets with build, fixture and
capture conditions. On success, failure or cancellation, clean only resources
and scratch still owned by this run; recheck identity beyond PID before termination.
Preserve user state and confirm evidence survives cleanup. Never install an
optional tool, erase a shared simulator or repair credentials implicitly.

Use synthetic data and disposable accounts for captures. Inspect and redact
shareable derivatives; keep necessary originals access-controlled under the
project's retention policy. Never publish credentials, customer data or whole
unreviewed evidence bundles.

Use `web-design`, `css` or `tailwind` for web implementation guidance and
`swiftui-architecture` for SwiftUI changes when available. The project recipe
must supply concrete commands even when these companion skills are absent.

For a capture plan, report these separate checkpoints:

- **State and capture:** the concrete screen/interaction state, comparison action
  and first available suitable route, not a wait for a preferred tool.
- **Diagnosis:** observed facts, competing causes and missing discriminating
  runtime evidence. An unproved cause is a proof gap, even if capture/isolation work.
- **Ownership:** establish independent state. If that fails, coordinate one serial
  driver for an authorised test instance before any drive; separate tabs are not
  isolation. Serialisation grants no access to the user's unrelated instance.
  If no authorised safe instance exists, report that specific blocker.
- **Lifecycle:** cleanup on success, failure and cancellation, evidence survival and
  every unproved isolation/cleanup condition. Do not leave these paths implied.
