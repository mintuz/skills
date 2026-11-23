---
name: codebase-layout
description: >
  WHEN designing, auditing, or migrating physical source trees, packages, build targets, placement rules, or import-direction enforcement;
  NOT for one module's logical types and caller contract (architect), repository-wide architecture hotspot triage (architecture-audit), or semantic ports-and-adapters rules (hexagonal-architecture);
  produces an evidence-backed layout, dependency rules, proportionate enforcement, and a staged migration plan.
---

# Codebase Layout

Design the physical source tree as an accurate map of product capability, ownership, runtime boundaries, and change cohesion. Do not start from a universal template. Choose the smallest honest structure that makes real boundaries visible and mechanically enforced.

## References

Before you propose a tree or a migration, read each reference whose condition applies:

| Reference | Read when |
| --- | --- |
| [`references/web-layouts.md`](references/web-layouts.md) | Structuring or auditing web backends, BFFs (backend-for-frontend hosts), frontends, full-stack meta-frameworks, design systems, or workspace and linter boundary rules |
| [`references/ios-layouts.md`](references/ios-layouts.md) | Structuring or auditing iOS, watchOS, or extension apps, local Swift Packages, build targets, Xcode project organisation, or Apple platform adapters |
| [`references/migration-and-enforcement.md`](references/migration-and-enforcement.md) | Moving existing code, changing directory or package depth, or designing automated import, manifest, or build-target boundary checks |

## Core Model

Order the tree from broadest meaning to narrowest detail:

1. **Product or capability** — why the code exists and who owns it.
2. **Architectural boundary** — inside versus outside, only when that boundary is real and enforced.
3. **Feature, domain concept, use case, workflow, or public interface** — what changes together or how callers enter.
4. **Implementation detail** — framework glue, persistence, SDK wrappers, and local helpers.

Treat directory names as claims. Prove every claimed boundary with packages, build targets, public visibility rules, static import checks, or architecture tests.

### Keep Axes Distinct

| Axis | Answers | Do not confuse with |
| --- | --- | --- |
| Capability | Why does this code exist and change? | A technical layer |
| Bounded context | Where do domain language and model authority change? | A single noun, database table, team name, or convenience folder |
| Hexagon | Which policy must run and test without external technology? | Every pure utility, a generic core folder, or domain modelling alone |
| Feature or use case | Which behaviour changes together? | A mandatory separate package or bounded context |
| Public interface leaf | Where does an external request or command enter? | The owner of shared workflow state or domain policy |
| Package or build target | Which boundary can build and lint tools enforce? | A business boundary by itself |
| Composition root | Where is the live object graph constructed and wired? | A mandatory folder inside libraries or every feature |

## Workflow

### 1. Preserve the Requested Scope

Before you read deeply or propose edits, classify the request as an audit, a proposal, a migration plan, or authorised file edits.

- If the user asks for an audit, proposal, or migration plan, do not move or edit files.
- Do not expand a physical layout change into a domain redesign or a behaviour rewrite without explicit authorisation.

### 2. Inspect Before Naming

Do not design from directory listings alone. Read enough real code and project configuration to ground every boundary in evidence:

- Architecture decisions, glossaries, module indexes, and repository rules.
- Public interfaces (routes, screens, commands, jobs, public exports), state and data owners, and tests.
- Build and package manifests, source imports, runtime entry points, and external SDK dependencies.
- Framework-required paths, generated code locations, workspace or target discovery globs, and existing boundary checks.
- Change history or ownership signals that show which files change together.

Record uncertainty explicitly. Treat unverified context or package splits as hypotheses until language, invariants, ownership, or dependency direction prove them.

### 3. Select the Smallest Honest Shape

Match the physical shape to observed evidence:

| Observed signal | Primary shape |
| --- | --- |
| Tiny library or early prototype | Flat or nearly flat module |
| Ordinary service or app without ports and adapters | Feature-first or use-case-first |
| Bounded contexts without ports and adapters | Context-first with explicit public contracts |
| Explicitly opted-in ports-and-adapters system | Capability first, then visible inside/outside, then featureful interior |
| Public-interface-heavy host (for example HTTP API, BFF, or CLI) | Public interface tree (endpoints or commands) plus sibling workflows and composition |
| Framework-constrained host | Thin required framework entry points delegating to feature modules |
| Small UI client | Framework-native screen or route tree with shallow colocation |
| Feature-rich UI client | Screen or route composition plus product-feature modules and named foundations |
| Multi-runtime or full-stack app | Explicit runtime separation (for example client versus server) enforced in the build graph |
| Multi-app or multi-platform workspace | Product or capability grouping plus enforceable leaf packages or build targets |
| Operational or automation tool | Workflow-first or command-first |
| Established coherent structure | Preserve it unless the requested scope and measured pain justify migration |

Combine shapes where needed. A workspace or multi-target package is an enforcement overlay. An edge host can invoke hexagonal modules without becoming a hexagon itself.

### 4. Test Whether a Visible Hexagonal Tree Is Earned

Introduce a visible inside/outside hexagonal tree only when the project explicitly opts into ports and adapters and every condition below holds:

1. Meaningful application policy must run and test without live external systems.
2. At least one purposeful boundary exists with a driving or driven external actor.
3. Port contracts speak application language rather than mirroring a third-party SDK or database API.
4. Test interactors exist for each port, or a concrete plan adds them.
5. Automated import, manifest, or build-target rules can enforce inside versus outside.

Do not build ceremonial hexagonal trees for simple CRUD services, thin provider wrappers, operational scripts, or vocabulary-only type libraries. Hand semantic port, Domain Probe, read-model, and fake-swappability rules to `hexagonal-architecture` instead of duplicating them here.

### 5. Produce the Output Contract

Every layout proposal or audit must deliver all seven parts:

1. **Selected shape and evidence** — state the chosen shape and the observed repository facts that justify it.
2. **Annotated ASCII tree** — distinguish grouping directories, enforceable packages or build targets, and executable hosts. Show only evidence-backed target paths: every new directory displayed must own at least one named file, package, target, or concrete responsibility. Never draw empty speculative folders; describe future expansion points in prose. Use ellipses only for unchanged existing subtrees or an explicitly repeated established pattern.
3. **Placement rules** — state concrete rules telling a contributor where the next new file belongs.
4. **Allowed and forbidden dependency directions** — list permitted and prohibited edges across roles, runtimes, UI/platform layers, state owners, and test modules.
5. **Proportionate automated enforcement** — specify the minimum mechanical checks that prove the claimed boundaries at this project's scale.
6. **Staged migration plan** — whenever an existing tree must change, sequence behaviour protection (handing off characterisation tests to `refactoring` and hidden-dependency breaking to `test-seams`), tooling discovery verification, and dependency inversion separately from mechanical file moves (see `references/migration-and-enforcement.md`).
7. **Omitted structures and assumptions** — name assumptions, deferred decisions, and structures intentionally left out (such as speculative packages or un-earned hexagonal layers).

## Cohesion, Composition Roots, and Sharing

- **Colocate co-changing code.** Keep implementation, focused tests, fixtures, and local schemas beside their owning feature or module.
- **Keep composition roots in executable hosts only.** Wire concrete implementations, configuration, resource ownership, and lifecycle near the executable entry point. Use a dedicated composition directory only when inline startup wiring becomes unclear. Never place empty composition folders inside libraries or every feature.
- **Hide internals behind small public APIs.** Prevent sibling features and sibling adapters from importing each other's private files.
- **Promote shared code by real need and explicit ownership.** Extract a shared module only when at least two current owners require it under a stable, purpose-specific name (for example `monetary-values` or `order-event-contracts`). Never create unowned `shared`, `common`, `utils`, `helpers`, or `services` dumping grounds.
- **Split directories for navigation; split packages or build targets for enforcement.** Create a new directory when cohesion and navigation improve. Create a new package or build target when a dependency direction, runtime isolation, ownership, or release boundary requires mechanical enforcement.
- **Declare state and UI ownership explicitly.** Place UI and workflow state at its narrowest real owner. When a project uses statecharts or shared UI stores, declare which physical layer owns machines, actors, or stores and enforce that rule with the same boundary checks as any other import rule.

## Anti-Patterns

Reject these physical structures:

- Cosmetic `hexagon` or `core` directories that still import provider SDKs or allow outward imports without enforcement.
- Global technical layer buckets (`controllers`, `services`, `models`, `repositories`, `components`, `hooks`, `viewmodels`, `stores`) spanning unrelated capabilities.
- A separate package, build target, bounded context, or hexagon per noun or tiny interface.
- Reusable test fakes or test interactors placed inside production inside boundaries.
- Production runtime code importing test or development-only modules.
- Business policy, concrete collaborator construction, or shared mutable runtime state hidden inside thin entry-point leaves.
- Public interface leaves (HTTP routes, CLI commands) buried inside internal capability folders instead of the public interface tree.
- Unowned `shared`, `common`, `utils`, `helpers`, or `managers` catch-all directories.
- Empty directories added for visual symmetry or future speculation.
- Deep directory trees that build, workspace, test, coverage, or lint discovery cannot see.
- Big-bang migrations that mix behaviour changes, dependency inversion, and mass file moves in one change.
- Client or UI graphs that can import server-only secrets, privileged SDKs, or direct database handles.
- Catch-all re-export files that defeat tree-shaking, erase lazy-loading boundaries, or pull forbidden runtime code into client builds.

## Handovers

Keep physical layout, placement rules, target/package boundaries, import enforcement, and tree migration planning in `codebase-layout`. Name each owning companion skill explicitly when routing adjacent concerns; when handing off complexity reduction to `reducer`, state explicitly that a physical folder move alone is not complexity reduction:

| Need | Hand off to |
| --- | --- |
| Logical module boundaries, module depth, caller-first types and function signatures | `architect` |
| Semantic ports-and-adapters design (inside/outside zones, driving/driven ports, Domain Probes, CQRS-lite, stateful fakes and swappability) | `hexagonal-architecture` |
| Read-only repository-wide architectural hotspot discovery and investment ranking | `architecture-audit` |
| Safe behaviour-preserving file moves, decomposition, and characterisation tests | `refactoring` |
| Breaking hidden dependencies in untestable legacy code before writing tests | `test-seams` |
| Proving whole-system complexity reduction (a folder move alone is not complexity reduction) | `reducer` |
| UI state ownership and view data flow without ViewModels on Apple platforms | `swiftui-architecture` |
| App Intents design and entity/dependency patterns on Apple platforms | `app-intent-driven-development` |
| Statechart and actor modelling inside the layer this skill declares as owner | `xstate` |
| Architecture and dependency diagram syntax and evidence rules | `mermaid-generator` |

## Completion Check

Before you finish, verify every gate:

- Does the proposal preserve the requested scope without unrequested edits or moves?
- Can a newcomer identify the product capabilities before the framework?
- Does every new directory shown own at least one named file, package, target, or concrete responsibility?
- Are small and non-hexagonal projects spared un-earned layers and packages?
- If a visible hexagonal boundary is proposed, are all five earning criteria met and mechanically enforceable?
- Do placement rules state where the next new file belongs and what it may import?
- Does the enforcement plan prove boundaries through manifests, visibility rules, build targets, or automated import checks rather than folder names alone?
- When changing an existing tree, does the migration plan separate behaviour protection, discovery checks, and dependency inversion from mechanical moves?
- Are adjacent concerns explicitly handed off to the right companion skills?
