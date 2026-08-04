---
name: graph-engineering
description: WHEN orchestrating interdependent specs, stories, or work items across agents—deciding what runs serially, what may run in parallel, and how each unit is independently verified; NOT for single-task delegation, code review, or PR delivery mechanics; returns a contract-first execution graph with a per-node verifier.
---

# Graph Engineering

A fan-out is not a graph. Launching N agents at one scope is scatter-gather; a graph exists only when some units depend on others, and then the ordering *is* the work. Build the graph: a verification contract fixed before any node runs, nodes cut at judging seams, edges that state why order matters, a schedule that defaults to serial and earns every concurrency, and one independent verifier per node.

Three rules carry the rest.

- **The contract precedes the artifact.** Define correctness before implementation, or implementation defines correctness and every later check merely confirms it.
- **Whoever built it does not judge it.** Every node is judged by a fresh context that never saw the building.
- **Concurrency is an exception with evidence.** Serial is the default because conflicting edits, duplicated work, and divergent decisions cost more than the wall-clock they save.

## Roles

| Role | Owns | Never |
|---|---|---|
| Orchestrator | contract, cut, edges, schedule, integration, re-planning | implements a node's artifact, or judges one |
| Worker | one node's artifact and its raw evidence | judges its own work, or decides ordering |
| Verifier | one node's verdict against the contract | edits the artifact, or reads the worker's reasoning |

Compose each agent from **skills, not one skill per agent**. A node's brief names one **lead skill** that governs its method, plus **supporting skills** that govern the other aspects it touches — language, domain, testing, delivery. Skills compose when they govern different aspects and conflict when they govern the same one; two skills that both claim the method are two nodes, or a choice between them. Name the composition explicitly in the brief and record it in the ledger, because the composition is part of what produced the artifact.

## 1. Fix the verification contract

Read the specs, stories, issues, and repository rules that govern the run. Record each source's locator and revision.

Derive the contract **before cutting any node**: every in-scope normative statement becomes one independently decidable assertion, stated as an observable outcome rather than an implementation. Preserve each assertion's source identifier. Record conflicting or missing authority as an open question, never as a silent assumption.

Split the contract into two lanes, because they are verified differently:

| Lane | Assertion form | Verified by |
|---|---|---|
| Static | A property of the artifact: types, structure, checks, conventions | Running the checks and reading the artifact |
| Behavioral | An outcome a user or caller observes end to end | Exercising the running system |

An assertion that no lane can verify is a contract gap, and it stays visible until closed.

**Complete when:** every governing source is recorded with its revision, every in-scope statement maps to exactly one assertion in a named lane, and every ambiguity is an open question rather than a guess.

## 2. Cut the nodes

A node exists where there is a **judging seam** — an artifact that can be verified against its own assertions without waiting for the rest of the graph — and a **bounded write scope**. Both, or it is not a node.

For each node record: identifier, the assertions it owns, its owned paths, its lead and supporting skills, its deliverable, and its non-goals. Keep tightly coupled work in one node; splitting work that cannot be judged apart buys nothing and costs a handoff.

Check coverage in both directions. Every assertion is owned by at least one node, and every node owns at least one assertion. An unowned assertion is missing work. A node owning nothing is ceremony.

A node whose scope is itself a graph — a spec containing stories — **expands into a subgraph**. Its contract is the seam: the parent owns the edges between specs, the child owns the edges between its stories, and neither reaches across.

**Complete when:** every node has a judging seam, non-overlapping owned paths, a named skill composition, and at least one assertion; and every assertion has an owner.

## 3. Draw the edges

An edge is a claim about order, and it needs a reason recorded beside it.

| Edge | Meaning | Releases when |
|---|---|---|
| `needs` | B builds on A's result and cannot start without it | A's artifact is verified **and integrated** into B's base |
| `informs` | B is better for A's findings but can proceed with them as a brief | A's output is available as input |
| `excludes` | A and B carry no data dependency but cannot run together | The other has finished |

`excludes` is what most graphs get wrong. Two nodes exclude each other when they write the same paths, when they would each decide the same open architectural question, or when they share a resource that tolerates one writer. Absence of a data dependency is not independence.

Approval, a green check, or an open pull request does not satisfy `needs`. Only integration into the base the dependent node will build on does.

An edge without recorded evidence is an assumption; mark the dependent node blocked until the edge is confirmed or dropped.

**Complete when:** every edge names its kind, its reason, and its evidence; the graph is acyclic; and no cycle was broken by deleting an edge rather than by re-cutting the nodes.

## 4. Schedule the frontier

The frontier is every node whose `needs` are integrated and which excludes no running node.

**Schedule writes serially.** Run one artifact-producing node at a time and let the next inherit an integrated, verified base. This is slower on paper and more correct in practice: parallel writers conflict, duplicate work, and settle the same open question in different directions, and reconciling that costs more than the concurrency returned.

**Parallelise reads freely.** Search, code reading, research, static analysis, and independent review have no write scope and no ordering, so run them concurrently inside a node and inside verification.

Admit concurrent writers only when all four hold, and record which node pairs qualified:

1. Owned paths are disjoint, including generated files, lockfiles, and migrations.
2. No shared open decision — neither node will settle a question the other also settles.
3. Each is independently verifiable against its own assertions.
4. Each is isolated at the workspace level, so an unverified artifact cannot leak into a sibling's base.

Otherwise the wall-clock gain is borrowed against the integration bill.

**Complete when:** the frontier is derived from integration state rather than intent, every concurrent pair satisfies all four conditions with the check recorded, and every blocked node names the exact gate holding it.

## 5. Dispatch with isolation

Give each worker a brief and nothing else. Session history carries the orchestrator's assumptions into the node, and every node then inherits the same blind spot. Brief contents and templates are in [`references/briefs.md`](references/briefs.md).

Maintain one **shared state artifact** every agent reads: the contract, the ledger, the decisions already settled, and the constraints that apply to everyone. Broadcast changes there rather than re-briefing each node, so late nodes and early nodes work from the same facts.

Assign the seat to the model, not the model to the run. Planning rewards careful reasoning; implementation rewards fluency and speed; verification rewards precise instruction-following, and gains independence when it does not share a provider — and therefore a bias — with the worker it judges. Record each seat assignment; it is a variable in the result.

**Complete when:** every dispatched node has an acknowledged brief, owned paths, and an isolated workspace; the shared state is current; and every seat assignment is recorded.

## 6. Verify each node independently

Every node gets its own verifier in a **fresh context**, given only the assertions it owns, the real artifact, and the raw evidence. Withhold the worker's narration, rationale, summaries, and any claim of quality — a verifier that reads the argument for the work inherits it.

Verify both lanes. Static assertions are checked by running the checks and reading the artifact; parallel reviewers inside this lane are cheap and independent. Behavioral assertions are checked by **exercising the running system** — start it, drive it, observe the outcome. Passing tests written alongside the implementation are the weakest evidence in the graph, because they were shaped by the code rather than by the contract.

Each verifier returns one verdict per assertion:

| Verdict | Meaning | Next |
|---|---|---|
| `pass` | Evidence shows the assertion holds | Eligible for integration |
| `fail` | Evidence shows it does not hold | Return the single largest gap to the worker |
| `unjudgeable` | The evidence path did not permit a decision | Repair the evidence path, not the artifact |

On `fail`, hand the gap back to the worker that holds the context, then judge the repair with a **new** verifier. Re-judging with the previous one re-runs a context that has already committed to a conclusion. Never integrate on `unjudgeable`; a claim that could not be checked is not a claim that held.

**Complete when:** every assertion the node owns has a verdict backed by evidence in its lane, no verdict came from the context that produced the artifact, and no `fail` or `unjudgeable` was resolved by narrowing the assertion.

## 7. Integrate at checkpoints

A node closes by writing a **structured handoff**, not by reporting completion: what it delivered, what it left undone, every command run with its exit code, issues discovered, decisions it settled that the graph must adopt, and where it departed from its brief. The handoff schema is in [`references/briefs.md`](references/briefs.md).

Treat an unaddressed handoff issue as a blocking gate. Progress past an unread handoff is how a graph drifts while every node reports success.

Group nodes into checkpoints and re-plan at each boundary rather than continuously. At a checkpoint: integrate what passed, fold settled decisions into the shared state, scope follow-up nodes for what failed or was discovered, and recompute the frontier from the new integration state. Expect the first pass at a checkpoint to fail; follow-up work is the normal output of verification, not an exception to it.

Perform integration and any outward-facing action only within the authority already granted, and re-derive the frontier after each one.

**Complete when:** every integrated node passed its verifier and its handoff was read and cleared, every discovered issue became a scoped node or a recorded acceptance, and the frontier was recomputed from observed state.

## 8. Report the ledger

Lead with the contract's coverage — assertions passed, failed, unjudgeable, and unowned — then the graph:

| Node | Assertions | Skills | Edges | Schedule | Verdict | Evidence | Handoff |
|---|---|---|---|---|---|---|---|

Follow with: nodes run concurrently and which of the four conditions justified each, seat assignments, follow-up nodes created at each checkpoint, contract gaps still open, and the smallest next action for every blocker.

Report failures, skipped nodes, and dropped scope explicitly. A graph that quietly shed a node reads as coverage it never delivered.

**Complete when:** every assertion appears exactly once with a verdict or a named gap, every citation resolves, the ledger matches observed state rather than intent, and no action exceeded the granted authority.

## Boundaries

| Reach for | When |
|---|---|
| `story-pr-orchestrator` | The nodes are stories delivered as pull requests — it owns worktree, branch, PR, and merge mechanics; this skill owns the contract, the edges, and verification |
| `acceptance-review` | Deciding whether a finished artifact satisfies an authoritative contract, one subject at a time |
| `gauntlet-loop` | Improving one ambitious artifact against a concrete bar, with no dependency structure to schedule |
| `pseudocode` | Cutting nodes for a code change — render the shape first so owned paths and boundaries are read from the source, not guessed |
| Neither | One agent in one context does the work. A graph of one node is ceremony, and a graph cannot rescue a goal you have not fixed |
