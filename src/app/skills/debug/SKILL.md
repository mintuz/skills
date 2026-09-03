---
name: debug
description: >
  WHEN an iOS app fails in the simulator — a build failure, a crash, a wrong
  screenshot, or wrong behaviour — and either the user reports it or you observe
  it yourself; NOT for Xcode project setup, or for a test that fails while the
  app itself builds and runs (use app:swift-testing); runs an
  evidence-to-root-cause loop and proves the terminal state.
---

# Debug — iOS App Debugging Loop

## Authorisation rule

Edit code only when an instruction asks for a fix. An explicit fix request, or a
standing instruction that the fix serves (for example "get the app building"),
authorises ordinary code and test edits; do not ask for that approval again. A
symptom report, or a failure you observed yourself with no such instruction,
authorises diagnosis only: report the cause, state the exact change you would
make, and ask before you edit. When a fix is authorised, stop and ask again only
when the proved fix needs a materially different, destructive, or externally
visible action, such as deleting stored data or resetting a shared store.

## Root-cause loop

1. **Bound and reproduce** — Name the failing surface, expected state, exact
   sequence, and requested terminal outcome. Reproduce before choosing a cause.
   Capture the evidence that matches the failing surface: the build log for a
   build failure, runtime logs for a crash or wrong behaviour, and a screenshot
   only when the failure is visual. Do not launch the app or capture runtime
   evidence for a failure that occurs before the app builds. Preserve user data
   and treat clean builds, reinstalls, or resets as controlled experiments, never
   as proof or a shortcut.

   **Complete when:** the failure is repeatable with evidence, or the missing
   runtime proof is explicit.

2. **Prove the runtime identity** — When the failure occurs in a launched app,
   verify the selected scheme and configuration, built product, bundle
   identifier, installed app, launched process, and named UI surface before
   blaming source. Map the expected surface to the exact source view and
   styling rule. Skip this step for a build failure.

   **Complete when:** the observed runtime is tied to the source under review, or
   a stale/wrong runtime is proven.

3. **Trace the owner** — Follow the real entry point through state, lifecycle,
   storage, and dependencies to the narrowest shared cause. Search every caller
   of the shared function before changing it. Keep observations, hypotheses, and
   inferences distinct; test competing hypotheses against the captured evidence.

   **Complete when:** one cause explains the evidence and every affected caller
   and lifecycle state is accounted for.

4. **Fix once** — State the change with specifics: the file, the declaration,
   and the values or calls that change. For diagnosis-only work, report the
   cause and the proposed change, then stop. For an authorised fix, make the
   smallest change at the shared owner. Do not rename, move, or restructure code
   when a local change at that owner resolves the proved cause. Leave one
   focused regression check for non-trivial logic; the check must fail on the
   reproduced defect and cover data preservation when persistence is involved.
   State whether the proved fix remains inside the supplied authorisation; stop
   before any materially different or destructive action.

   **Complete when:** for diagnosis-only work, the cause and the proposed change
   are reported; for an authorised fix, the change and its regression check
   express the proved cause without widening scope.

5. **Prove the terminal state** — Rebuild and rerun the exact failing sequence.
   Run the focused check, inspect fresh logs, compare the same visual surface when
   relevant, and exercise the lifecycle boundary such as backgrounding or
   relaunch. Report observed proof separately from any remaining gap. Do not
   report a planned step as an observed result.

   **Complete when:** the original failure no longer reproduces, relevant logs are
   clean, persisted state survives the tested lifecycle, and any unproved live
   state is labelled as a gap rather than a pass.

## Related Skills

- **`app:xcode-dev-loop`** — the build, test, install, launch, and screenshot
  mechanics that steps 1, 2, and 5 run.
- **`app:swift-testing`** — how to write and run the regression check in step 4.
- **`app:swiftui-architecture`** — SwiftUI state and data-flow patterns for the
  code under repair.
