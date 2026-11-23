---
name: test-seams
description: "WHEN existing or legacy code cannot be tested because hidden dependencies (globals, clocks, environment reads, singletons, direct collaborator construction, or live external systems) block isolation; NOT for greenfield TDD (tdd), repository-wide architecture audits (architecture-audit), refactoring already-tested code (refactoring), permanent ports-and-adapters design (hexagonal-architecture), or general test authoring; introduces minimum seams, explicit enabling points, and hand-written fakes without breaking callers."
---

# Test Seams

Introduce the smallest explicit substitution point needed to put untestable existing code under test without changing existing production callers.

## Core Definitions

- **Seam:** a place where you can alter program behaviour without editing source code at that place (Michael Feathers).
- **Enabling point:** the place where you select which behaviour runs. Source code at the seam stays identical in production and test; only the enabling point differs. Without an enabling point, no seam exists.
- **Separation:** running code in isolation without executing real external collaborators.
- **Sensing:** observing the arguments, calls, or state transitions the code produces without inspecting private internals.

When placing legacy code under test, establish **separation** first so tests run deterministically, then add **sensing** where observable behaviour requires it.

## Seam Granularity

**Rule:** if a test can call the code directly without setup or teardown, it needs no seam.

Create a seam only when a dependency:
- crosses a process or system boundary (network, storage, database, clock, randomness, environment, hardware, or another bounded context),
- is slow, non-deterministic, or produces external side effects, or
- holds shared mutable state such as a process-wide singleton.

Refuse to add seams for pure, fast, deterministic same-module helpers or standard-library operations. Test pure code directly through its public signature with plain inputs and observable outputs.

## Procedure: Putting Existing Code Under Test

Complete all four steps before expanding a test suite:

1. **Audit every hidden dependency.** List every collaborator the unit reaches for implicitly: direct construction, clocks, randomness, environment or configuration reads, singletons, ambient globals, and direct I/O calls. List all of them, not only the first one that fails.
2. **Inject each dependency with a production default.** Move every listed hidden dependency to an explicit parameter, factory argument, or initialiser with a production default that reproduces current behaviour exactly. Keep the construction, singleton access, or environment read inside the default so existing production call sites remain unchanged. When finished, the unit body reads no global state and constructs no hidden collaborator.
3. **Test with hand-written fakes.** Supply hand-written, isolated per-test fakes at the enabling point: deterministic closures, fixed values, or small stateful fakes implementing only the seam's narrow contract. Never pass the real production collaborator through the seam—even when it appears cheap, local, or in-memory—because the test stays coupled to that collaborator's internals and shape changes. If a test still needs runtime import mocking, environment stubbing, or fake global timers to run, a dependency is still hidden; return to step 2 instead of adding global test hooks.
4. **Remove superseded mocks and report the seam.** Delete any runtime module mocks, global stubs, or fake-timer hooks that existing tests carried for the dependency you broke. Leaving both hides regressions behind the old mock. In your completion summary, state:
   - each seam type introduced,
   - each exact enabling point (file and line of the parameter default, fallback, factory call, or initialiser), and
   - confirmation that existing production call sites remain unchanged.

## Seam Preference Order

Start with the most explicit, type-safe option the target language supports:

1. **Parameter with production default** — pass a callable, value, or collaborator with a default that reproduces current production behaviour. Default choice.
2. **Factory or closure configuration** — bind multiple dependencies once and return a configured unit when a function or service needs several collaborators.
3. **Narrow contract or protocol** — define a small interface, protocol, or record containing only the operations this unit uses, injected through a parameter or initialiser.
4. **Boundary interceptor** — intercept requests at an explicit transport or environment boundary when verifying wire formatting, headers, or status handling at the edge.
5. **Subclass and override** — extract a problematic call into an overridable method and override it in a test subclass **only** in legacy class-based code where the language allows inheritance. Do not attempt this on value types, enums, actors, or non-inheritable classes.
6. **Runtime module mocking (temporary scaffolding only)** — available **only** in dynamic runtimes that support import replacement, and only when you cannot change a signature yet. Never copy an existing module mock as house style, never treat it as permanent architecture, and migrate to options 1–3 once characterisation tests pass.

## Temporary Scaffolding vs Durable Contract

A test seam is not automatically a public module interface, a permanent port, or a lasting abstraction.

- Introduce the narrowest safe substitution point first so existing behaviour can be characterised.
- Options 1–3 graduate into a durable contract only when the module's lasting design earns them; otherwise keep them private or remove them after characterisation.
- Options 5–6 are temporary scaffolding.
- Do not expand a local test seam into a subsystem-wide ports-and-adapters architecture, adapter layer, or composition root inside this skill.

## Common Mistakes

| Mistake | Fix |
| --- | --- |
| Passing the real collaborator through the new seam | Pass a hand-written fake that implements only the seam's narrow contract. |
| Stopping after the first hidden dependency and patching the rest with global test hooks | Audit every hidden dependency in step 1 and move all of them to explicit enabling points. |
| Adding seams around pure, deterministic same-module helpers | Apply the seam granularity rule and test the unit directly. |
| Keeping old module mocks after introducing an explicit seam | Delete the superseded mocks immediately so the seam owns test isolation. |
| Breaking many unrelated units in one edit | Break one unit's dependencies, verify its tests pass, then move to the next unit. |
| Leaking implementation details or wide external types across a seam | Narrow the seam contract to plain domain inputs and outputs describing *what* the unit needs, not *how* the collaborator works. |

## References

Load the matching reference before writing language-specific seams or tests:

| Reference | Load when... |
| --- | --- |
| [references/typescript-seams.md](references/typescript-seams.md) | Working in TypeScript, JavaScript, Node.js, or React codebases (default parameters, higher-order factories, narrow types, global wrappers, sensing closures, async/stream seams, React props/Context and MSW, legacy class seams, and temporary module-mock scaffolding). |
| [references/swift-seams.md](references/swift-seams.md) | Working in Swift or iOS codebases under Swift 6 strict concurrency (`@Sendable` closure defaults, narrow `Sendable` protocols or witness structs, wrapping Apple singletons, SwiftUI `@Environment` seams without ViewModels, custom `URLProtocol` HTTP boundary seams, isolated `actor`/`Mutex` stateful fakes in Swift Testing, and Swift static-compilation limits). |

## Handovers

Stop when hidden dependencies are broken, tests run in isolation through the new enabling points, and superseded mocks are removed. Hand follow-on work to the owning skill:

- **`refactoring`** — characterisation-test-backed structural cleanup and behaviour-preserving refactoring once seams make the code testable.
- **`tdd`** — greenfield Red-Green-Refactor development for new behaviour without legacy hidden dependencies.
- **`hexagonal-architecture`** — promoting a temporary test seam into a permanent driven port with adapters, inside/outside boundaries, and a composition root.
- **`architect`** — designing a module's durable caller-facing contract and boundaries when not adopting full ports and adapters.
- **`swift-testing`** — authoring full Swift Testing suites (parameterised tests, tags, isolated fixtures) on Apple platforms.
- **`react-testing`** — authoring React Testing Library component and hook tests.
- **`frontend-testing`** — authoring non-React DOM UI tests with DOM Testing Library.
