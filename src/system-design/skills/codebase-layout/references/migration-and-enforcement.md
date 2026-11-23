# Migration and Enforcement

Read this reference before moving existing code, changing directory or package depth, or designing automated import, manifest, or build-target boundary checks. A tree migration is an architectural change whenever it alters dependency direction, package or target discovery, public APIs, or inside/outside claims.

## Contents

1. Five-tier enforcement ladder
2. Role-based dependency matrix
3. Synthetic deepest-path discovery check
4. Ten-step staged migration sequence
5. Per-slice validation gates

## 1. Five-Tier Enforcement Ladder

Use the lightest mechanical check that proves the boundary your tree claims:

| Tier | Project scale | Minimum useful enforcement (web and iOS) |
| --- | --- | --- |
| 1 | Small flat package or library | Explicit public surface (`package.json` `exports` or Swift `public`), colocated tests, code review |
| 2 | Feature-first app | Public feature entry points and restricted cross-feature imports (ESLint/TS rules or separate SPM targets with `internal` hiding) |
| 3 | Single-package or single-module hexagon | Path-based restricted imports plus architecture tests (on Swift/iOS, single-target folders share `internal` visibility, so promote to Tier 4 SPM targets for mechanical enforcement) |
| 4 | Multi-package or multi-target boundary | Separate manifests (`package.json` or `Package.swift` targets), project references, explicit exports/access levels, manifest and import direction validation |
| 5 | Large or deep workspace | Recursive package/target discovery and boundary rules generated from path roles or a small declarative role registry |

Do not treat a third-party library denylist as architecture. A denylist catches known package names; role-based dependency direction catches the category of violation. Validate both manifests (dependencies declared) and source imports (relative escapes and framework imports).

## 2. Role-Based Dependency Matrix

Assign every enforceable module, package, or build target a clear role (`inside-domain`, `inside-application`, `driving-adapter`, `driven-adapter`, `ui-feature`, `design-system`, `test-interactor`, `executable-host`, `operational-workflow`). If paths alone are ambiguous, keep one small declarative role registry and verify that registry roles match physical locations.

| Source role | May import | Must not import |
| --- | --- | --- |
| Domain policy | Same/allowed inner domain modules and provider-free libraries | Application orchestration, adapters, UI, testing, composition, frameworks, providers |
| Application / core policy | Domain, allowed inner modules, owned ports | Concrete adapters, UI frameworks, testing, composition, framework entry points, raw environment/hardware |
| Driving adapter / UI feature / intents | Inside public API, transport or UI framework support, design system | Inside private internals, concrete driven-adapter internals, business policy in sibling routes |
| Driven / platform adapter | Driven port and inside public value types, concrete provider/OS SDK | Inside internals unrelated to its port, sibling adapter internals |
| App-local workflow | Its public dependencies and provider-free app modules | Entry-point transport details and concrete providers (unless explicitly an adapter) |
| Testing / test-support | Inside public APIs and test tools | Production composition roots as a shortcut to hidden internals |
| Executable composition root | All production roles required by that platform/host | Reusable domain policy; test-support modules |

Enforce these cross-cutting invariants at every tier above Tier 1:

- Production runtime source and runtime manifests must never import testing or test-support modules. Colocated test files and test targets may depend on reusable test-support modules through explicit test-only dependencies.
- Production entry points must never import development-only routes or scripted graphs (except explicit debug-only graph selection at the composition root).
- Cross-context imports must pass through explicit public contracts, domain events, or anti-corruption layers.
- Provider or OS SDK types must never appear in inside public APIs.
- Sibling features and sibling adapters must never import each other's private subpaths.

## 3. Synthetic Deepest-Path Discovery Check

Never assume build, test, or lint tools discover packages or targets at a deeper directory nesting. Before moving real code to deeper paths or adding new nested targets, inspect every discovery surface:

- Workspace globs and package-manager resolution (for example `pnpm-workspace.yaml`, `workspaces` fields, or local Swift package paths in `.xcodeproj` / `Package.swift`).
- Custom architecture or boundary scripts and their directory recursion depth.
- Compiler project references, path aliases, and Swift package target paths.
- Linter and architecture-test file globs.
- Build, unit/integration test, Xcode schemes and test plans, coverage, documentation, and release scripts.
- Container/CI build contexts and file-copy manifests.

Prove discovery with a synthetic fixture placed at the deepest proposed target path before moving production modules. Verify that the fixture proves all five cases:

1. Valid inside and adapter modules at maximum depth build and pass tests.
2. A forbidden inward-to-outward import fails the boundary check.
3. A forbidden production-to-testing import fails the boundary check.
4. Public export names, visibility levels, and path aliases resolve cleanly.
5. Workspace, build, lint, and test tooling discover and include the synthetic target automatically.

Testing only against the existing shallow tree proves nothing about recursive discovery.

## 4. Ten-Step Staged Migration Sequence

Never combine behaviour changes, god-file decomposition, dependency inversion, and mass file moves in one big-bang change. Separate semantic work from mechanical movement:

1. **Record the decision.** Document the selected shapes, role vocabulary, placement rules, exceptions, and omitted structures in the project's decision record.
2. **Map current behaviour.** Inventory public APIs, callers, runtime entry points, provider leaks, and co-changing files.
3. **Protect behaviour first.** Add characterisation or use-case tests before touching fragile code. Hand off safe characterisation tests to `refactoring`; if hidden dependencies block testing, hand off minimal seam extraction to `test-seams` first.
4. **Prepare enforcement and discovery.** Update workspace/target discovery to be recursive and pass the intended boundary rules against both the current tree and the synthetic deepest-path fixture.
5. **Decompose god files under stable exports.** Split multi-responsibility files by cohesive behaviour without changing caller contracts (hand off safe structural cleanup to `refactoring` and `tdd`).
6. **Invert leaked dependencies.** Replace direct provider/SDK calls and inline construction with application-owned contracts and edge translation. Treat this as behavioural architecture work, not a file rename.
7. **Reparent modules, packages, or targets.** Move one capability or role at a time while preserving package/module names, public exports, and caller imports where possible.
8. **Restructure executable hosts.** Separate thin entry-point leaves, shared workflows, and composition roots without altering external routes, protocols, or user-visible behaviour.
9. **Remove legacy paths.** Delete compatibility re-exports and empty directories only after the final consumer migrates.
10. **Update the map.** Refresh package/target indexes, architecture decision records, glossaries, onboarding docs, and architecture diagrams (hand off diagram updates to `mermaid-generator`).

**Hard rule:** Never label provider-dependent code as inside (`hexagon/`, `Domain`, or `Core`) before Step 6 (dependency inversion) makes that claim true. Keep mass file moves out of unrelated feature work.

## 5. Per-Slice Validation Gates

After every migration slice, run and verify:

- Formatting, linting, typechecking or Swift compilation, and required test suites.
- Package manifests, lockfiles, and Xcode project/scheme/test-plan membership.
- Public exports and downstream consumer compilation.
- Import and manifest boundary checks (confirming forbidden edges still fail).
- Production versus development/test dependency graphs (and client versus server bundle graphs on web).
- Runtime startup, shutdown, route discovery, or app/extension launch.
- Updated links in documentation and module indexes.

Use a generated dependency graph or boundary report to confirm direction; a clean directory tree is not proof of dependency direction. For proposal-only requests, list these validation gates without editing or moving files.
