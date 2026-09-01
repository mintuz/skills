---
name: debug
description: >
  WHEN an iOS app fails in the simulator — a build failure, a crash, a wrong
  screenshot, or wrong behaviour — and either the user reports it or you observe
  it yourself; NOT for Xcode project setup or test-only work; runs an
  evidence-to-root-cause loop and proves the terminal state.
---

# Debug — iOS App Debugging Loop

Respect the requested scope. A diagnosis remains read-only. A request to fix the
issue already authorizes ordinary code and test edits; ask again only when the
evidence requires a materially different, destructive, or externally visible
action.

## Root-cause loop

1. **Bound and reproduce** — Name the failing surface, expected state, exact
   sequence, and requested terminal outcome. Reproduce before choosing a cause;
   capture the relevant build or runtime logs and a screenshot only when the
   failure is visual. Preserve user data and treat clean builds, reinstalls, or
   resets as controlled experiments, never as proof or a shortcut.

   **Complete when:** the failure is repeatable with evidence, or the missing
   runtime proof is explicit.

2. **Prove the runtime identity** — For launch or visual discrepancies, verify
   the selected scheme and configuration, built product, bundle identifier,
   installed app, launched process, and named UI surface before blaming source.
   Map the expected surface to the exact source view and styling rule.

   **Complete when:** the observed runtime is tied to the source under review, or
   a stale/wrong runtime is proven.

3. **Trace the owner** — Follow the real entry point through state, lifecycle,
   storage, and dependencies to the narrowest shared cause. Search every caller
   of the shared function before changing it. Keep observations, hypotheses, and
   inferences distinct; test competing hypotheses against the captured evidence.

   **Complete when:** one cause explains the evidence and every affected caller
   and lifecycle state is accounted for.

4. **Fix once** — If implementation is authorized, make the smallest change at
   the shared owner. Leave one focused regression check for non-trivial logic;
   the check must fail on the reproduced defect and cover data preservation when
   persistence is involved. State whether the proved fix remains inside the
   supplied authorization; pause before any materially different or destructive
   action. For diagnosis-only work, report the cause and stop.

   **Complete when:** the authorized change and its regression check express the
   proved cause without widening scope.

5. **Prove the terminal state** — Rebuild and rerun the exact failing sequence.
   Run the focused check, inspect fresh logs, compare the same visual surface when
   relevant, and exercise the lifecycle boundary such as backgrounding or
   relaunch. Report observed proof separately from any remaining gap.

   **Complete when:** the original failure no longer reproduces, relevant logs are
   clean, persisted state survives the tested lifecycle, and any unproved live
   state is labelled as a gap rather than a pass.
