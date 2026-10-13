---
name: create-verification-skill
description: WHEN creating or refreshing a project verification recipe; NOT for a one-off test run; saves and cold-replays a real user journey
---

# Create a verification skill

Create one shared `verify-<project>` recipe another agent can execute cold. Authoring success and reproducibility are separate gates.

1. **Discover the target.** Read project instructions to find the canonical skill source and registration, supported platforms, startup/readiness, identity checks, fixtures, authentication and existing interaction harness. Use that source and the host's available tools; maintain one recipe rather than divergent harness copies. Select one current critical user journey. When refreshing, inventory and preserve every supported journey; repair stale commands, locators and prerequisites without silently reducing coverage.
2. **Establish identity and isolation.** Record revision/build, environment and fixture. Identify owned instances and scratch state; avoid driving a shared user instance. For mobile targets, resolve scheme, bundle, runtime/device, signing and relevant entitlements. Use existing platform recipes when available: `xcode-dev-loop` for Apple build/install/run identity, `swift-testing` for test authoring, and `eyes` for web visual capture. A missing tool or launch prerequisite leaves a narrow diagnosis and draft, not permission to repair unrelated product or environment problems.
3. **Save an executable recipe.** Use real project commands and stable selectors, with runnable helper invocations if needed. Include:
   - **Launch:** documented prerequisites, isolated fixture setup, usable readiness and target identity.
   - **Doctor:** read-only checks of build, ownership, readiness and authentication when a run looks wrong.
   - **Drive:** the actual public user journey, its preconditions, actions and expected result. An internal setter cannot replace the claimed boundary. Name device-only or external boundaries such as Siri, widgets, notifications, health data and purchases.
   - **Evidence:** action, resulting state and material side effects, with identity and durable paths outside disposable scratch state. Observe what dry-run/test modes skip; their names do not prove safety. Use mocks only at an established isolated boundary and qualify the resulting proof.
   - **Cleanup:** on success and failure, release only resources created by this run. Verify current resource ownership before termination; a reused PID or process name is insufficient. Preserve and confirm proof artifacts after cleanup.
4. **Execute, then cold-replay.** Run launch → doctor → journey → evidence → cleanup. Save corrections. Reset only owned fixtures, then replay the saved recipe from a fresh agent context using only its documented prerequisites. The authoring run cannot substitute for this replay. Resolve missing setup in the recipe and replay again; failed or unavailable replay leaves reproducibility unproven.
5. **Hand over the proof.** Link the saved recipe and retained evidence, report both execution and cold-replay outcomes, and identify uncovered journeys and unavailable boundaries. Keep build, unit, simulator, physical-device, browser and deployed evidence distinct. A stand-in leaves target-specific setup unverified. Verify representative replay separately in each claimed harness before claiming cross-harness portability.
