---
name: debug
description: >
  WHEN diagnosing reported iOS app build failures, crashes, runtime errors, broken interactions or state, or visual defects in a simulator;
  NOT for planned feature implementation or general architecture review;
  reproduces each symptom, isolates its root cause, obtains approval for a scoped fix, and verifies it with before/after evidence
---

# Debug iOS Apps

Run a **red-to-green evidence loop**: make the reported symptom observable, use each check to narrow one hypothesis, fix the shared cause with approval, then repeat the same observation.

Use the configured XcodeBuildMCP server for builds, tests, and logs, and `ios-simulator` for simulator interaction and screenshots. Prefer a repository command or wrapper when the project already defines one.

## 1. Lock the bug contract

Record:

- observed behavior and expected behavior;
- the shortest known reproduction;
- relevant build configuration, device, OS, app state, and input data;
- every reported symptom and the evidence that would prove it fixed.

Inspect the project and available simulator state before asking for information. Ask the user only for expectations or reproduction facts that cannot be recovered locally; show the relevant screenshot, error, or observation with the question.

**Complete when:** every reported symptom has a checkable expected result, and its reproduction can run without choosing unstated inputs.

## 2. Establish the red baseline

Choose the branch that matches each symptom:

| Branch | Baseline evidence |
| --- | --- |
| Build or test failure | Exact command, failing target or test, and first causal diagnostic |
| Crash or runtime error | Minimal action sequence, runtime logs, and crash or error output |
| Interaction or state defect | Minimal action sequence plus the relevant state, event, persistence, or navigation evidence |
| Visual defect | Screenshot from a named device, orientation, appearance, content state, and view |

Run the smallest build needed to launch or reproduce. Install and launch the built app when runtime behavior is involved, drive the minimal action sequence, and preserve the baseline command, logs, and screenshot or observation. Clean build artifacts only when stale output is a live hypothesis.

**Complete when:** every symptom is reproduced with baseline evidence, or is marked blocked or non-reproducible with the exact attempts and missing condition.

## 3. Isolate the root cause

Trace backward from the baseline through the relevant call sites, state transitions, data flow, and logs. Form one falsifiable hypothesis at a time and run the smallest check that distinguishes it from the alternatives.

Prefer the fix point shared by every affected path. Account for every caller before changing a shared function, and distinguish the first causal failure from downstream noise.

**Complete when:** the identified cause explains every reproduced symptom and its affected paths, or each remaining hypothesis has a distinguishing check and an exact missing prerequisite.

## 4. Propose and approve the experiment

Present:

- the baseline evidence and root cause;
- the exact files, symbols, and behavior to change;
- why the proposed edit is the smallest root-cause fix;
- the verification that will repeat the baseline;
- material risks or behavior outside the approved scope.

For a diagnosis-only request, hand off the evidence and stop. For a fix, obtain explicit user approval for this edit scope before modifying code.

**Complete when:** the diagnosis-only handoff contains the baseline and cause or blocker, or the user approves a concrete edit and verification scope.

## 5. Make the loop green

Apply only the approved root-cause fix. Before changing SwiftUI structure or state flow, load `app:swiftui-architecture`; before adding or changing Swift tests, load `app:swift-testing`.

Repeat the baseline under the same configuration and state:

1. Build the affected target and run the smallest relevant tests.
2. Install and launch the rebuilt app for runtime branches.
3. Repeat the exact action sequence.
4. Capture the matching after logs, screenshot, or observation.
5. Compare every expected result with its baseline and check for new relevant failures.

If a symptom stays red, return to isolation with the new evidence. Ask the user to judge the result only when the expectation is subjective or unavailable locally.

**Complete when:** every reported symptom is green with before/after evidence, every relevant check passes, and each unverified result has an explicit blocker.

## Handoff

Report the reproduction, root cause, approved changes, changed files, build and test commands, before/after evidence, and remaining blockers.
