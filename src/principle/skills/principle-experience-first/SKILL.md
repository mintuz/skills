---
name: principle-experience-first
description: "WHEN user journeys or feature scope compete with implementation convenience; NOT for inventing product changes during mechanical maintenance; grounds tradeoffs in the observed experience."
---

# Experience first

Optimize the central task for the people who use and maintain the result.

1. Observe the existing journey before proposing changes. Run the available product and inspect relevant states; when access is unavailable, name the gap and label assumptions.
2. Identify the core loop and the requested states: loading, empty, success, error, retry and interruption as applicable. Preserve supported behavior and the authorized scope.
3. Justify each control or option by a user need. Prefer a smaller polished experience over extra rough features; attend to feedback, transitions, alignment, accessibility and recovery.
4. Prototype uncertain interactions cheaply, anchored to the actual baseline. Compare the proposal with the requested states before committing implementation effort.

Library callers and future maintainers are users too: assess both caller usability and the cost of maintaining, diagnosing and evolving the contract. Prefer a clear contract without hiding cancellation, errors or other supported guarantees for implementation convenience.

Done: explain the tradeoff from the user's perspective, show the relevant states, and distinguish a design proposal from implementation and observed runtime proof.
