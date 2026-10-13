---
name: blast-radius
description: WHEN investigating what a change could break beyond its diff; NOT for a requirement verdict; maps material risks and decisive checks
---

# Blast radius

Trace the smallest set of assumptions that covers every material failure path. A single reassuring fact is enough only when it actually clears them all.

1. Read the change and current implementation; establish the changed contract and relevant source/version. Follow direct callers, then indirect consumers: serialized or persisted data, other languages/processes, extensions, integrations, flags, lifecycle and task ordering. Check the shipped library version and local patches where semantics matter.
2. For each reachable material risk, record the boundary, failure sequence, consequence and source locator. Use evidenced reachability and impact rather than invented probabilities. Keep confirmed risks, cleared paths and unresolved assumptions separate; a failed search is a bounded finding, not universal absence.
3. Choose the cheapest decisive check for each independent assumption. Reuse a focused existing test when it exercises the real code. Check whether its fixture, timing, version and boundary coverage leave material assumptions untouched; add a narrow reproduction only for the gap. Execute available checks within the authorized scope; unavailable execution leaves the corresponding assumption unproven.
4. Report the change, risk-to-check map, results and remaining proof gaps. Label static reasoning, unit, simulator, physical-device, browser and deployed evidence separately, with revision/environment identity. Name untested target environments explicitly: simulator-only mobile evidence leaves physical-device extension/lifecycle behavior unverified. A passing UI path does not prove persistence migration, wire compatibility or another process's lifecycle.

Keep the inquiry about regression risk. Requirement satisfaction belongs to `acceptance-review`; explanation and rationale belong to `how` and `why`. Independent review may help a wide change when authorized, but no particular reviewer, model, source host or new test framework is required.
