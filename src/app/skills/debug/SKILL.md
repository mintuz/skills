---
name: debug
description: >
  WHEN an iOS app fails in the simulator — a build failure, a crash, a wrong
  screenshot, or wrong behaviour — and either the user reports it or you observe
  it yourself; NOT for Xcode project setup, or for a test that fails while the
  app itself builds and runs (route by the actual test framework); runs an
  evidence-to-root-cause loop and proves the terminal state.
---

# Debug — iOS App Debugging Loop

## Authorisation rule

Edit code only when an instruction asks for a fix. An explicit fix request, or a
standing instruction that the fix serves (for example "get the app building"),
authorises ordinary code and test edits; do not ask for that approval again. A
symptom report, or a failure you observed yourself with no such instruction,
authorises diagnosis only: report the cause, state the exact change you would
make, and ask before you edit (`principle-investigate-read-only`). When a fix is
authorised, stop and ask again only when the proved fix needs a materially
different, destructive, or externally visible action, such as deleting stored
data or resetting a shared store (`principle-stay-in-scope`).

## Test-only failures and regression authorship

If the application builds and runs and only a test fails, do not start an app
crash/build investigation or manufacture runtime proof. Identify the suite first:

- Swift Testing `@Test` / `#expect`: use `swift-testing`.
- XCTest UI automation with `XCUIApplication`: use `xcuitest`.
- Existing non-UI XCTest unit/integration or `measure` performance tests: preserve
  XCTest and use the suite's established conventions with `tdd` for an authorised
  behaviour repair. Dedicated reusable non-UI XCTest authoring guidance remains
  a gap; neither the Swift Testing nor UI-automation skill silently owns it.

Do not force a framework migration to repair a test. Use `xcode-dev-loop` to
execute and read the suite's real results. Use `benchmark-checklist` to judge a
measurement claim, not as a substitute for its XCTest assertions or runtime.

In the handoff, explicitly name the non-UI XCTest specialist-guidance gap when
using that fallback; do not imply that selecting a runner supplies an authoring
guide. Retain exact expected case identities and the required before/after proof.

## Root-cause loop

1. **Bound and reproduce** — Name the failing surface, expected state, exact
   sequence, and requested terminal outcome. Reproduce before choosing a cause
   (`principle-capture-the-baseline`).
   Capture the evidence that matches the failing surface: the build log for a
   build failure, runtime logs for a crash or wrong behaviour, and a screenshot
   only when the failure is visual. Do not launch the app or capture runtime
   evidence for a failure that occurs before the app builds. Preserve user data
   and treat clean builds, reinstalls, or resets as controlled experiments, never
   as proof or a shortcut.
   When checking a suspected stale/wrong runtime, inspect build and runtime logs;
   a rebuild or reinstall is a named diagnostic experiment, not an assumed fix.

   **Complete when:** the failure is repeatable with evidence, or the missing
   runtime proof is explicit.

2. **Prove the runtime identity** — When the failure occurs in a launched app,
   verify the selected scheme and configuration, built product, bundle
   identifier, installed app, launched process, and named UI surface before
   blaming source (`principle-prove-it-works`). Map the expected surface to the exact source view and
   styling rule. Skip this step for a build failure.

   **Complete when:** the observed runtime is tied to the source under review, or
   a stale/wrong runtime is proven.

3. **Trace the owner** — Follow the real entry point through state, lifecycle,
   storage, and dependencies to the narrowest shared cause. Search every caller
   of the shared function before changing it. Keep observations, hypotheses, and
   inferences distinct; test competing hypotheses against the captured evidence
   (`principle-label-the-evidence`).
   For a type/name collision, resolve and check every affected use site before
   editing, not only functions or the first ambiguous file.

   **Complete when:** one cause explains the evidence and every affected caller
   and lifecycle state is accounted for.

4. **Fix once** — State the change with specifics: file, declaration, and the
   values or calls that change. For diagnosis-only work, report the cause and
   proposed change, then stop. For an authorised fix, make the smallest change
   at the shared owner; do not rename, move, or restructure code when a local
   change there resolves the proved cause (`principle-fix-root-causes`). For
   non-trivial logic, leave one focused regression check that fails on the
   reproduced defect and covers data preservation when persistence is involved
   (`principle-test-behavior-not-implementation`). State whether the proved fix stays
   inside the supplied authorisation; stop before any materially different or
   destructive action.

   **Complete when:** for diagnosis-only work, the cause and the proposed change
   are reported; for an authorised fix, the change and its regression check
   express the proved cause without widening scope.

5. **Prove the terminal state** — Rebuild and rerun the exact failing sequence.
   Run the focused check, inspect fresh logs, compare the same visual surface when
   relevant, and exercise the lifecycle boundary such as backgrounding or
   relaunch. Report observed proof separately from any remaining gap. Do not
   report a planned step as an observed result (`principle-gaps-are-not-passes`).

   **Complete when:** the original failure no longer reproduces, relevant logs are
   clean, persisted state survives the tested lifecycle, and any unproved live
   state is labelled as a gap rather than a pass.

   Keep verification within the named failing boundary and affected changed
   contracts. Inspect related callers to locate a cause, but do not add a new
   live check of an already-working unrelated Siri/system path automatically.

For a plan-only handoff, label reproduction/build/replay as proposed until their
outputs exist. State the exact evidence that would close the named failing
boundary; do not turn a user's reported symptom into an agent-observed reproduction.

## Related Skills

- **`app:xcode-dev-loop`** — the build, test, install, launch, and screenshot
  mechanics that steps 1, 2, and 5 run.
- **`app:swift-testing`** — Swift Testing regression checks; use `app:xcuitest`
  for UI automation and preserve existing non-UI XCTest conventions as above.
- **`app:swiftui-architecture`** — SwiftUI state and data-flow patterns for the
  code under repair.
