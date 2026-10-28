---
name: visual-feedback
description: WHEN assessing a reported visual issue or iterating on agreed visual changes in a web or iOS app; NOT for unattended visual-regression suites or requirement acceptance; reproduces actual states and compares evidence before and after authorised changes.
---

# Visual feedback

Capture screenshots and collaborate with users on visual refinements. Treat specific feedback and explicit implementation approval in the current request as already supplied. Whenever you block on a missing fact or decline a request, state the reason so the user can act on it.

Use the project's verification recipe and available host capabilities first. Missing Playwright MCP alone is not a blocker. See [web capture](references/web-capture.md) or [iOS capture](references/ios-capture.md) for platform mechanics; optional companion skills are not prerequisites.

## Scope

An interactive loop with a person, for a reported defect or for visual iteration you drive yourself: capture the current state, agree the change with the user, confirm the result with that same user (`principle-experience-first`).

Unattended automated test suites are out of scope. Decline ownership of their tool selection, baseline updates and diff thresholds; route browser suites to `browser-testing` and iOS UI automation to `xcuitest` or the project's existing runner. Do not design part of that suite as an aside. Offer a concrete interactive alternative: reproduce the reported screen and interaction state with the user, capture it, agree the intended appearance, then compare an equivalent after-image for an authorised change. DOM-only tests cannot prove rendered appearance. Requirement satisfaction belongs to `acceptance-review`; broader iOS build/runtime identity, state, storage, lifecycle or crash diagnosis belongs to `debug`.

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
   Choose the next planning step from the supplied facts:

   | Known facts | Next step |
   |---|---|
   | Neither screen/route nor concrete visual symptom | Ask for the missing reproduction facts and explain why a guessed capture cannot confirm or rule out the undefined report. Defer steps 2–8 and the checkpoint report below. |
   | Screen/route only | Ask what is observed versus expected before giving hypotheses. If capture conditions are known, an authorised read-only image may help the user identify the symptom; it is not proof of a diagnosed defect. |
   | Concrete visual symptom only | Give bounded candidate causes and distinguishing evidence, and ask for the screen/route. Do not invent a target or capture at a guessed location. |
   | Both screen/route and concrete symptom | Continue with those facts; ask only for missing conditions. |

   Missing conditions block only captures that available evidence or capture
   methods cannot establish or cover. If the transition phase is unknown, use
   both moving and settled captures as in step 3. A concrete symptom permits
   a bounded hypothesis/evidence plan and its cause/approval gates even when
   some capture conditions remain unknown.

2. **Request the state and capture** — Have one execution owner use the project's
   documented capture recipe/setup hooks where a suitable recipe exists.
   Otherwise use the first available host-native route in the platform reference;
   do not wait for a preferred tool. For iOS, `xcode-dev-loop` owns the mechanics
   when available and uses that same project recipe; otherwise use
   [iOS capture](references/ios-capture.md). Give the owner the screen,
   environment, fixture, focused field and keyboard/permission state. Require
   an actual image and accessibility/focus or equivalent state evidence. For iOS,
   return Xcode/SDK identity, scheme, configuration, built product, bundle identifier,
   simulator UDID/runtime and source identity including dirty changes. Reuse matching
   evidence instead of starting a parallel build/install/launch driver. Apply
   the Isolation and evidence rule below. Before any drive, state the isolation
   evidence and the rule's permitted fallback or stop if setup fails. Record the
   capture mechanism and reject stale images, previews and state/identity mismatches. For Chrome headless below
   500px, use device emulation or an iframe harness and confirm layout viewport
   width, not PNG dimensions.

3. **Check that the capture can show the target** — Ask the same execution owner
   for the phase named in the report: settled after a transition, or during
   movement. If the supplied evidence does not identify the affected phase,
   request both moving and settled captures in the first pass, before dismissal.
   Do not wait for the reporter to choose a phase that these captures can resolve.
   Open the saved image and inspect its recorded route, fixture/interaction state
   and capture conditions. A command or path is not image inspection. Confirm
   that the conditions match and the target is visible at non-zero size. If it
   is hidden, collapsed, zero-sized or unmounted, ask that owner to establish the
   visible state and capture again. Reject an unsuitable capture as a proof gap.

4. **Gather specific feedback** — If the user has not already specified the intended result, ask: "Looking at this screenshot, what specifically would you like changed?"

5. **Diagnose only the visual boundary** — For a reported defect with competing
   rendering causes, confirm focus/exposure/state, trace the target to its owning
   view/layout rule, and distinguish candidates with browser console/network/
   computed styles or Apple layout, keyboard, safe-area and runtime logs.
   State why an image alone cannot separate them. Confirm the cause with
   discriminating evidence before proposing the smallest scoped repair.
   An unresolved cause blocks that proposal; report the gap instead.
   Keep facts separate from hypotheses.
   An agreed appearance change needs no invented defect investigation.
   Hand broader iOS build/runtime identity, state, storage, lifecycle or crash
   faults to `debug` when available, otherwise to the project's named diagnostic
   owner; if neither is available, report the separate gap. Hand broader web
   faults to the project's diagnostic owner, or report the separate gap.
   Supply the failing sequence, evidence and exact authorised scope. Layout-only
   edit authority permits diagnosis of a broader fault, not its repair. Keep that
   fault unresolved until its own proof exists; a visual change cannot close it.

6. **Propose changes with specifics**:
   - Bad: "I'll fix the spacing"
   - Good: "I'll increase the gap between cards from 16px to 24px and add 32px padding to the container"

7. **Confirm before implementing** — When the current request does not already authorize implementation, use the user-question tool to get explicit approval (`principle-stay-in-scope`).

8. **Verify with comparison** — Ask the same execution owner for the after-state
   at the same screen/route, device model/viewport, browser/OS, Apple Xcode/SDK,
   appearance, data, focus and interaction conditions. Treat a changed toolchain
   as a distinct comparison condition, not matching evidence. Tie the after-image
   to the runtime/build that actually contains the agreed change; if deployment
   or identity is unproved, report the after-comparison gap without blocking safe
   before-state capture. After Apple source changes, have that owner rebuild.
   If the before-state depends on existing data, install the rebuilt product over
   the app that holds that data, and keep the data. If it starts from a fresh
   install or empty store, request a new run-owned device or equivalently fresh
   isolated fixture; record its
   identity and restore the same before-state preconditions. Never uninstall or
   clear a user-owned app or its data. Inspect the actual new image using step 3
   and compare behaviour as well as appearance. Present
   before/after evidence for the user's review; repeat only within the agreed
   scope. Keep unavailable proof and separate diagnostic failures explicit.

## Isolation and evidence

Prefer an independent instance, browser context/device and fixture under one run
ID. Separate tabs do not isolate shared state. If independent isolation is
unavailable, inspect a named shared instance only with explicit authority for
serial, non-destructive inspection, one lifecycle owner before any drive, and
no disturbance to foreign unsaved state. Never drive it concurrently, mutate
unauthorised data, stop/reset/clear a user-owned instance or treat code-edit
permission as shared-instance access. If those conditions cannot be established,
preserve the instance and report blocked. This is the shared-instance rule;
apply it at every capture, handoff and cleanup boundary.

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

Report these checkpoints; label planned actions as unexecuted:

- **State/capture:** concrete state, comparison and first suitable capture route.
- **Diagnosis:** observations, competing causes and missing discriminating evidence.
  An unproved cause remains a proof gap even when capture succeeds.
- **Ownership:** independent isolation status, or the explicitly authorised serial
  inspection/blocked status under the shared-instance rule above.
- **Lifecycle:** owned cleanup on success, failure and cancellation, retained
  evidence outside cleanup targets, and every unproved isolation/cleanup condition.
