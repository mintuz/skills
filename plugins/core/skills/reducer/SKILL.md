---
name: reducer
description: WHEN reducing whole-system complexity across control flow, state, dependencies, layers, or operations in an existing feature; NOT for local post-green refactoring, functionality cuts, acceptance verdicts, or speculative rewrites; removes complete mechanisms from first principles and proves behavior and non-functional guarantees are conserved.
---

# Reducer

Conserve the contract. Collapse the mechanism.

## Branch and boundaries

Choose one branch:

- **Diagnosis:** analyze and propose without product edits; complete Steps 1–4, then report expected reductions and proof gaps.
- **Implementation:** change the system in reversible slices; complete every step.

Route a read-only fulfillment verdict to `acceptance-review`, post-green local structure cleanup to `refactoring`, and intentional behavior changes to feature work.

Both branches obey the conservation law:

- Preserve every supported behavior and non-functional guarantee in scope: outputs, side effects, errors, ordering, persistence, integrations, authorization, security, privacy, reliability, resource budgets, and compatibility.
- Derive the target from domain truths and external constraints.
- Count the complete change, request, and failure paths across the whole system. A branch, dependency, state transition, or failure mode moved across a boundary remains mechanism.
- Keep irreducible domain and operational complexity visible. Cyclomatic complexity and line count are evidence, not objectives.

## 1. Map the conservation contract

Resolve the scope, requested outcome, and chosen branch. Inventory every in-scope entry point, caller, test, state owner, integration, configuration surface, operation, and relevant decision. Create a behavior ledger:

| Behavior or guarantee | Trigger | Outcome and side effects | Boundary | Oracle or gap |
|-----------------------|---------|--------------------------|----------|---------------|

Include errors, edge cases, ordering, concurrency, retries, migration, compatibility, and applicable non-functional guarantees.

- In diagnosis, record missing oracles as proof obligations.
- In implementation, close every gap the first slice can affect before product edits, using characterization tests or stable pre-change evidence such as fixtures, snapshots, traces, or recorded input/output pairs.

**Complete when:** every in-scope behavior and boundary appears once with preservation evidence or an explicit proof gap, the branch is chosen, and the allowed change surface is explicit.

## 2. Baseline the whole mechanism

Trace each ledger row end to end and account for every mechanism it crosses:

| Mechanism | Behavior served | Owner | Complexity cost | Essential constraint | Evidence | Disposition |
|-----------|-----------------|-------|-----------------|----------------------|----------|-------------|

Count each applicable dimension with one scope and method that can be repeated after the change:

- **Control:** aggregate and maximum cyclomatic complexity; conditions; error, retry, fallback, and ordering paths.
- **State and time:** states, transitions, mutable owners, caches, queues, tasks, callbacks, locks, synchronization points, lifecycle phases.
- **Structure:** modules, types, layers, hops, internal and external dependencies, cycles, adapters, representations.
- **Variability and operations:** flags, modes, configuration, extension points, deployables, jobs, migrations, monitors, failure and recovery paths.

Mark irrelevant dimensions `N/A`. Include tests and operational machinery when they impose ongoing cost. Include generated artifacts only when their source or runtime mechanism changes.

**Complete when:** every mechanism on every in-scope path is accounted for, each applicable dimension has a reproducible baseline, and transferred complexity is charged to its new owner.

## 3. Derive the minimum

Set aside the current decomposition and answer from first principles:

1. Which outcomes and guarantees must exist?
2. Which domain facts and decisions are irreducible?
3. Which external boundaries are fixed, and who must own state?
4. What is the shortest coherent path from trigger to outcome?

Sketch the minimum mechanism and name the domain fact or external constraint that requires each part. Compare it with the baseline and collapse in this order:

1. Delete unsupported paths, options, flags, configuration, fallbacks, and speculative machinery.
2. Unify duplicated policy, representation, state, and ownership.
3. Shrink decision and state spaces; prefer complete declarative rules or straight-line operations.
4. Flatten pass-through layers, translation chains, coordination, and temporal hops.
5. Replace custom machinery with a stable primitive only when total ownership and operational cost fall.

Charge each candidate for whole-system coupling, coordination, comprehension, change cost, and failure handling. Count renamed, split, wrapped, relocated, or concealed machinery as retained.

**Complete when:** every part of the target has a named constraint, every candidate maps a complete removed mechanism to its replacement or deletion, and the expected whole-system delta is explicit.

## 4. Select a slice

Rank candidates by `mechanism removed × confidence ÷ blast radius`, breaking ties with the smaller blast radius. Select the smallest reversible slice that removes one complete mechanism. Record:

- the mechanism and affected behaviors;
- their passing oracles and affected callers, data, integrations, and operations;
- the expected before/after delta;
- migration, rollback, and verification needs.

Apply the gap rule: diagnosis may carry proof gaps; implementation stays in diagnosis until every behavior and guarantee the slice can affect has a passing preservation oracle. A compatibility shim serves a named live boundary and has an owner and removal condition.

- Diagnosis stops here and reports the ranked proposal.
- Implementation continues only when the selected slice satisfies the gap rule.

**Complete when:** every candidate is ranked, the selected slice is reversible, its proof obligations are executable, and its expected ledger removes rather than transfers mechanism.

## 5. Reduce and prove

For the authorized implementation slice:

1. Record the exact pre-slice evidence and confirm every affected oracle passes.
2. Make the smallest coherent change.
3. Preserve behavior-facing tests; change only assertions tied to discarded implementation structure, without weakening behavioral coverage.
4. Run focused checks immediately, then the broader relevant suite.
5. Re-read every affected path, then remove superseded code, adapters, flags, states, dependencies, configuration, and tests or documentation for removed internals.
6. Apply the **behavior gate**: re-run affected oracles and the relevant full test, type, build, lint, integration, and operational checks; compare outcomes, side effects, errors, ordering, boundaries, and constraints; exercise boundary conditions implied by every removed decision or state.
7. Apply the **mechanism gate**: recount the baseline dimensions, map every new mechanism to the old one it replaces, and inspect callers and downstream owners for exported decisions, state, coordination, change cost, or failure handling.

When evidence fails or another affected behavior appears, return the slice to diagnosis. Derive a new oracle only from recorded pre-slice or independent pre-change evidence, and restore this slice when conservation cannot be proved.

The slice passes only when both gates pass and total in-scope mechanism falls. Begin another slice only after this one passes.

**Complete when:** every affected behavior-ledger row is conserved, the old mechanism is absent, the repeated baseline proves a net whole-system reduction, and every temporary bridge has an owner and removal condition.

## 6. Report

For diagnosis, report the ranked slices, expected before/target deltas, proof obligations, and blockers. Label every reduction and equivalence claim as expected.

For implementation, lead with the conserved contract and removed mechanism:

| Dimension | Before | After | Evidence |
|-----------|--------|-------|----------|

List verification results and the constraint behind each retained mechanism. Report proof gaps, compatibility shims, and follow-up slices with owners and closure or removal conditions.

**Complete when:** every ledger row and baseline dimension is represented, realized and expected claims are distinct, every cited check has a result, and every open item has a closure condition.
