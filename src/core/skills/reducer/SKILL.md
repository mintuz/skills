---
name: reducer
description: WHEN reducing whole-system complexity—branches, state, dependencies, layers, or moving parts—in an existing system or feature; NOT for functionality cuts or unproven rewrites; derives the minimum mechanism from first principles and proves behavior and guarantees are conserved.
---

# Reducer

Conserve behavior. Minimize mechanism.

## Conservation law

- Preserve every supported behavior and non-functional guarantee in scope: outputs, side effects, errors, ordering, persistence, integrations, authorization, security, privacy, reliability, resource budgets, and compatibility.
- Derive the target from domain truths and external constraints, not the current implementation.
- Measure the whole system. Moving a branch, dependency, state transition, or failure mode across a boundary is not a reduction.
- Keep essential complexity visible. Optimize complete change, request, and failure paths for maintainers and operators.
- Prefer subtraction and collapse. Treat cyclomatic complexity and line count as signals, not objectives.

## 1. Contract

State the scope, outcome, and mode. Diagnosis produces a design without edits; implementation changes the system in reversible slices.

Inventory entry points, callers, tests, state, integrations, configuration, operations, and relevant decisions. Create a behavior ledger:

| Behavior or guarantee | Trigger | Outcome and side effects | Boundary | Oracle or gap |
|-----------------------|---------|--------------------------|----------|---------------|

Include errors, edge cases, ordering, concurrency, retries, migration, compatibility, and applicable non-functional guarantees. Diagnosis records missing oracles as proof obligations. Before product edits, implementation captures affected gaps with characterization tests or stable pre-change evidence such as fixtures, snapshots, traces, or recorded input/output pairs.

**Complete when:** every in-scope behavior and boundary has preservation evidence or an explicit proof gap, and the allowed change surface is clear.

## 2. Baseline the whole mechanism

Trace every behavior end to end:

| Mechanism | Behavior served | Owner | Complexity cost | Essential constraint | Evidence | Disposition |
|-----------|-----------------|-------|-----------------|----------------------|----------|-------------|

Count applicable dimensions with the same scope and method before and after:

- **Control:** aggregate and maximum cyclomatic complexity, conditions, error, retry, fallback, and ordering paths.
- **State and time:** states, transitions, mutable owners, caches, queues, tasks, callbacks, locks, synchronization points, lifecycle phases.
- **Structure:** modules, types, layers, hops, internal and external dependencies, cycles, adapters, representations.
- **Variability and operations:** flags, modes, configuration, extension points, deployables, jobs, migrations, monitors, failure and recovery paths.

Mark irrelevant dimensions `N/A`. Include tests and operational machinery when they impose ongoing cost; exclude generated artifacts unless their source or runtime mechanism changes. A smaller function or diff is not evidence unless the complete mechanism shrinks.

**Complete when:** every mechanism on an in-scope behavior path is accounted for and the baseline shows where complexity is created, transferred, and paid.

## 3. Derive the minimum

Ignore the current decomposition and answer from first principles:

1. Which outcomes and guarantees must exist?
2. Which domain facts and decisions are irreducible?
3. Which external boundaries are fixed, and who must own state?
4. What is the shortest coherent path from trigger to outcome?

Sketch the minimum mechanism. Name the constraint that requires each remaining part, then compare it with the baseline. Seek leverage in this order:

1. Delete unsupported paths, options, flags, configuration, fallbacks, and speculative machinery.
2. Unify duplicated policy, representation, state, and ownership.
3. Shrink decision and state spaces; prefer complete declarative rules or straight-line operations.
4. Flatten pass-through layers, translation chains, coordination, and temporal hops.
5. Replace custom machinery with a stable primitive only when total ownership and operational cost fall.

Reject changes that merely rename, split, wrap, relocate, or conceal complexity, and local simplifications that increase coupling, coordination, comprehension cost, change cost, or failure modes elsewhere.

**Complete when:** every target mechanism has a named behavioral or external reason and the expected whole-system reduction is explicit.

## 4. Select a slice

Rank candidates by `mechanism removed × confidence ÷ blast radius`; use the smaller blast radius to break ties. Choose the smallest reversible slice that removes one complete mechanism. Record:

- the mechanism and affected behaviors;
- their passing oracles and affected callers, data, integrations, and operations;
- the expected before/after delta;
- migration, rollback, and verification needs.

Apply the gap rule: diagnosis may carry proof gaps; implementation remains diagnosis until every behavior and guarantee the slice can affect has a passing preservation oracle. Keep a compatibility shim only for a live boundary, with an owner and removal condition.

Diagnosis now reports the proposal. Implementation continues to Step 5.

**Complete when:** the slice is reversible, satisfies the gap rule, has executable proof obligations, and removes rather than redistributes mechanism.

## 5. Reduce and prove

For each authorized implementation slice:

1. Record the exact pre-slice state and confirm every affected oracle passes.
2. Make the smallest coherent change.
3. Preserve behavior-facing tests; change only assertions tied to discarded implementation structure, without weakening behavioral coverage.
4. Run focused checks immediately, then the broader relevant suite.
5. Re-read the complete path, then remove superseded code, adapters, flags, states, dependencies, configuration, and tests or documentation for removed internals.
6. Apply the **behavior gate**: re-run affected oracles and the relevant full test, type, build, lint, integration, and operational checks; compare outcomes, side effects, errors, ordering, boundaries, and constraints; exercise boundary conditions implied by every removed decision or state.
7. Apply the **mechanism gate**: recount the baseline dimensions, map every new mechanism to the old one it replaces, and inspect callers and downstream owners for exported decisions, state, coordination, change cost, or failure handling.

If evidence fails or another affected behavior appears, stop. Derive its oracle only from the recorded pre-slice state or independent pre-change evidence; restore only this slice's edits when necessary. Never characterize modified behavior as the baseline.

A slice passes only when both gates pass and total in-scope mechanism falls. Treat a net-neutral or displaced result as unfinished. Repeat only after the current slice passes.

**Complete when:** all behavior-ledger entries are preserved, the old mechanism is gone, the before/after ledger proves a net reduction, and every temporary bridge has an owner and removal condition.

## Report

For implementation, lead with the conserved behavior and removed mechanism:

| Dimension | Before | After | Evidence |
|-----------|--------|-------|----------|

List verification results and essential complexity retained. Report proof gaps, compatibility shims, and follow-up slices with owners and closure or removal conditions. For diagnosis, report ranked slices, expected before/target deltas, proof obligations, and blockers; claim neither realized reduction nor equivalence.
