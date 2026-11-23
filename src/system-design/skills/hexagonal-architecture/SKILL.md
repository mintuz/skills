---
name: hexagonal-architecture
description: >
  WHEN a repository or user explicitly opts into hexagonal (ports and adapters) architecture via README, AGENTS.md, CLAUDE.md, ADR, or explicit adoption request — apply to every code change in that opted-in repo alongside tdd; NOT for repositories that have not opted in, generic test-seam or isolation requests, or physical folder layout alone; enforces inside/outside zones, application-owned ports, thin adapters, composition roots, and stateful-fake testing.
---

# Hexagonal Architecture (Ports and Adapters)

## Opt-In Gate

Before applying any pattern in this skill, verify that the repository or user has explicitly opted into hexagonal architecture:

- Valid opt-in evidence: a `README`, `AGENTS.md`, `CLAUDE.md`, Architectural Decision Record (ADR), or explicit user request stating that the project uses or adopts hexagonal (ports and adapters) architecture.
- If no opt-in exists, **stop**. Do not impose ports-and-adapters structure, driving/driven port hierarchies, or composition-root rewrites on a generic isolation, adapter, or test-seam request. Hand off to `test-seams` for breaking a hidden dependency or to `architect` for general module boundaries.
- Once a repository has opted in, apply this skill to **every** code change in it — new features, bug fixes, SDK swaps, and small rule edits — alongside `tdd`, never instead of it.

## Before You Write Code

Follow these mandatory safeguards on every change in an opted-in codebase.

### A vendor SDK is never a port

Any client, request model, or data-transfer object (DTO) exported by a third-party package or the repository's SDK folder is outside the hexagon. Every file that imports it — including type-only imports — is outside the hexagon.

- A dependency object whose fields are SDK client types is not a set of ports, even when tests supply fakes.
- Structural compatibility between an SDK client and your required interface never justifies skipping an adapter.
- Declare your own domain types inside and translate between SDK shapes and domain types inside a driven adapter (`principle-hide-representations`).

### Adding a feature (ordered procedure)

1. Put business rules (time windows, eligibility checks, filters, message text, truncation, authorisation rules) in a pure inside function that receives domain values, clock values, and identifiers as inputs (`principle-keep-the-core-pure`). Adapters receive finished values and translate them to technology shapes.
2. Declare ports inside, beside their innermost consumer:
   - Driving ports name the actor capability (`For<Verb>ing<Noun>`, such as `ForPlacingOrders` or `ForSendingReceipts`).
   - Driven ports name the business role (`OrderRepository`, `PaymentGateway`, `ReceiptSender`) or keep the repository's existing `For...` convention if it already uses one.
   - Port signatures use domain types only; never expose wire, storage, framework, or SDK types.
3. Write one thin driven adapter per driven port to translate between port types and external technology. Write a thin driving adapter (route, UI view, CLI command, queue handler, or system intent) that parses untrusted input (`principle-parse-at-the-boundary`), invokes the driving port, and translates the result.
4. Wire concrete clients, adapters, and use cases in the composition root only. Keep the composition root's public caller signature unchanged: it still receives external clients or configuration from its caller and constructs adapters internally.
5. Test the use case through its driving port using hand-written stateful or recording fakes of the driven ports (`principle-test-behavior-not-implementation`). Test each adapter separately at its real technology boundary.

### Changing a use case that still imports an SDK directly

When you touch an inside file that still imports a vendor package or the repository's SDK folder, porting **all** of its SDK dependencies is part of the change, not scope creep.

1. Keep existing tests green and extract every SDK dependency of the touched file behind driven ports as a behaviour-preserving refactor step *before* writing the failing test for the new behaviour. Extracting only the single dependency named in the request leaves the next change coupled to the remaining SDKs.
2. Declare an explicit driving port contract if the use case has none (a bare exported function is not a driving port).
3. Put the new business rule inside. If the request says "just add it where the SDK call is", keep the rule inside and explain why in one sentence.
4. Before finishing, inspect the use case's imports. If any import still references a vendor package, SDK folder, or SDK type, extract it before claiming done.

### File placement when restructuring is not requested

Preserve the repository's existing layout for inside code when physical restructuring is out of scope. Adapters and fakes are first-party code: place them beside the feature they serve or in an `adapters/` or `testing/` location, never inside a folder that holds third-party SDK clients.

### Fakes over mocks at use-case boundaries

Use-case tests must contain no mocking-framework helpers (no spy, stub, or module-mock calls) and no imports from vendor SDK folders. Build a hand-written stateful or recording fake for each driven port and assert observable outcomes and recorded state. When you touch an existing use-case test that mocks SDK clients, replace those mocks with fakes of the declared ports rather than extending them.

## Core Architecture Rules

### Inside and outside zones

Hexagonal architecture defines two zones only: **inside** and **outside**. Dependencies point strictly inward.

```text
         Driving (left)                     Driven (right)
   +-----------------------+          +-----------------------+
   | HTTP / UI / CLI /     |          | Persistence / APIs /  |
   | Queue / System Intent |---+  +---| Messaging / Hardware  |
   +-----------------------+   |  |   +-----------------------+
            calls into --->  +------+  <--- implements
                             |INSIDE|
                             |Domain|
                             |& App |
                             +------+
```

| Role | Zone | Responsibility |
| --- | --- | --- |
| Domain policy | Inside | Pure business rules, domain types, state transitions; zero framework, clock, ID-generator, UI, or I/O dependencies |
| Application policy | Inside | Use-case orchestration implementing driving ports and calling driven ports; zero concrete I/O |
| Port contracts | Inside | Provided (driving) and required (driven) contracts owned by their innermost consumer |
| Driving adapters | Outside | Parse untrusted input, authenticate, invoke driving ports, translate results |
| Driven adapters | Outside | Implement driven ports and translate between domain types and external technology |
| Test interactors | Outside | Test drivers calling driving ports and stateful fakes implementing driven ports |
| Composition root | Executable host | Constructs concrete adapters and wires them into use cases |

Vocabulary:

- **Driving (primary) actors** initiate actions on the application through **driving ports** (the application's provided interface).
- **Driven (secondary) actors** are called by the application through **driven ports** (the application's required interface).
- **Interactors** are actors or adapters touching a port directly. Tests are interactors that meet ports directly without extra adapters.

### Port ownership and naming

- **Ownership:** Place each port with its innermost consumer. Application policy owns driving ports and almost all driven ports (repositories, gateways, notifiers). Domain owns a port only when the domain model itself consumes that conversation. Never conflate *inside-owned* with *domain-owned*.
- **Role interfaces:** Include only the operations the use case needs, not every method an adapter offers. Create a port only when a real external boundary exists (storage, network, hardware, third-party SDK, or multiple implementations); do not wrap pure internal concepts in ports.
- **Naming:**
  - Use business language, never vendor or protocol names (`PaymentGateway`, not `StripeClient` or `HttpPaymentPort`). If swapping a vendor forces a port rename, infrastructure leaked into the name.
  - Omit `I` prefixes, `Interface` suffixes, `Port` suffixes, `UseCase`/`Handler` suffixes, and `Impl` suffixes.
  - Name concrete adapters after their technology or strategy (for example, database engine, vendor name, or fake).

### Adapter boundaries and error translation

- Driven adapters translate expected external outcomes (such as uniqueness violations or optimistic version conflicts) into explicit domain or application result types.
- Unexpected infrastructure failures (network drop, disk full, timeout) propagate to the top-level error handler. Domain code never catches infrastructure errors because it does not know infrastructure exists.
- Protect retried commands and external side effects with durable identity, optimistic concurrency, or reconciliation contracts at the application/adapter boundary (`principle-make-operations-idempotent`).

### Composition root (configurator)

- Inject driven ports explicitly via constructor or factory parameters; use cases never instantiate concrete adapters or read global service locators.
- Wire concrete adapters only at the executable composition root.
- An executable deployment entrypoint (such as a single serverless handler) may compose a trivial, unshared graph inline if wiring stays visually separate from input parsing. Once a host shares an object graph, configuration, or lifecycle across entrypoints, move wiring to a dedicated composition root and inject prepared driving ports into ordinary adapters.
- In tests, the test case itself plays both configurator and driving interactor.

## Cross-Cutting Concerns Placement

| Concern | Owner | Rule |
| --- | --- | --- |
| Authentication (who are you?) | Driving adapter | Verify credentials or session at the edge; pass a provider-free authenticated principal inward |
| Authorisation (are you allowed?) | Domain / application | Evaluate permissions as business rules on domain data and the authenticated principal |
| Untrusted input schema parsing | Driving adapter | Parse transport syntax and boundary schemas at the edge (`principle-parse-at-the-boundary`) |
| Business invariant validation | Domain | Validate business rules on typed domain values and return explicit domain results |
| Technical telemetry and correlation | Adapters / decorators | Log request cycles, timings, and trace IDs outside; domain never imports a logger or sees a trace ID |
| Domain-significant observations | Driven Domain Probe port or domain events | Announce business-significant facts through a severity-free, fire-and-forget driven port (or existing domain event publisher); test with recording fakes |
| Transactions | Application port + driven adapter | Application declares what must persist atomically; driven adapter owns transaction mechanics; domain stays unaware |
| Error formatting | Driving adapter | Map domain result reasons to protocol status codes or UI feedback |

## Anti-Patterns

- **Inside importing infrastructure:** Any domain, application, or port file importing a database library, UI framework, vendor SDK, or SDK DTO (including type-only imports).
- **Business logic in adapters:** Eligibility checks, thresholds, or state transitions placed in route handlers, views, intents, or repositories.
- **Bypassing ports:** Driving adapters calling persistence or vendor SDKs directly for state changes (backend cross-aggregate read queries under CQRS-lite are the sole intentional exception).
- **Port proliferation or domain-concept ports:** Creating ports for trivial helpers or internal domain concepts that have no external actor.
- **Nested hexagons:** Splitting the interior into inner ports-and-adapters layers duplicates test walls that decay; structure the interior with plain modules or bounded contexts instead.
- **Technology-shaped or pattern-shaped names:** Ports exposing query strings, transport headers, vendor terms, or `I...`/`...Port`/`...UseCase`/`...Impl` names.
- **Generic logger ports or telemetry-bloated results:** Passing a `log(level, message)` port inward or widening domain return types only to smuggle telemetry data out.

## Local Principles

Apply these local principles rather than repeating their theory here:

- `principle-keep-the-core-pure` — keep business decisions in pure functions behind thin shells.
- `principle-hide-representations` — keep vendor, wire, storage, and framework shapes outside port boundaries.
- `principle-parse-at-the-boundary` — validate untrusted external input at driving and driven edges.
- `principle-test-behavior-not-implementation` — assert observable behaviour and state through ports, not mock call choreography.
- `principle-make-operations-idempotent` — design retried writes and external effects to converge safely.

## Handovers

Name every applicable companion skill explicitly in your design, plan, or handover, and route neighbouring concerns to their owning skill:

- `codebase-layout` — designing or changing the physical directory, workspace, package, or target layout and enforcing import direction automatically.
- `test-seams` — breaking hidden dependencies in non-opted-in repositories or untestable legacy code to get characterisation tests running before deciding whether to extract durable ports.
- `tdd` — running the Red-Green-Refactor cycle (load alongside `hexagonal-architecture`, never instead of it).
- `swiftui-architecture` — SwiftUI view state ownership, `@Observable` services via `.environment`, and zero-ViewModel rules on iOS.
- `app-intent-driven-development` — `AppIntent` driving adapters, `AppEntity` parameters, and `@AppDependency` wiring on iOS.
- `swift-testing` — authoring Swift Testing suites (`@Test`, `#expect`, `#require`, isolated fixtures).
- `react-testing` — authoring React Testing Library tests for web frontend driving adapters.

## References

Load only the reference matching your current task:

| Reference | Load when... |
| --- | --- |
| `references/greenfield-and-adoption.md` | Starting a hexagonal project from scratch (4-wiring sequence, Walking Skeleton) or adopting hexagonal architecture incrementally (Strangler Fig steps and priority matrix) |
| `references/testing-and-probes.md` | Designing the port test wall, stateful fakes vs mocks, shared adapter contract suites, swappability validation, or 4-tier Domain Probe observability |
| `references/cqrs-lite-and-transactions.md` | Building a **backend service** where reads join across aggregates (CQRS-lite) or writes require atomic multi-row/outbox transactions and optimistic concurrency |
| `references/typescript-backend.md` | Implementing or reviewing a TypeScript/Node backend feature with driving/driven ports, boundary schema parsing, driven adapters, composition root, and stateful fakes |
| `references/typescript-frontend.md` | Implementing or reviewing a React/web frontend feature with UI/router driving adapters, API/storage driven ports, root composition, and stateful fakes |
| `references/swift-ios.md` | Implementing or reviewing a Swift 6 / SwiftUI / App Intents iOS feature with local Swift Package targets, pure domain vs pragmatic SwiftData core, earned `Sendable` ports, `AppGraph`, and Swift Testing fakes |

## Completion Checklist

- [ ] Repository or user opt-in verified before applying hexagonal patterns.
- [ ] Zero imports from vendor packages, SDK folders, frameworks, or persistence libraries in domain, application, or port files (including type-only imports).
- [ ] Every external boundary crossed by a touched use case has an application-owned port in business language and a thin adapter outside.
- [ ] Pure domain functions take time, identifiers, and external facts as values and return domain results for business outcomes.
- [ ] Concrete wiring lives only in the composition root (or an unshared trivial executable entrypoint), with its caller signature preserved.
- [ ] Every driving port has a test driver and every driven port has a hand-written stateful or recording fake — zero mocking-framework SDK mocks in use-case tests.
- [ ] Swapping any driven adapter requires zero changes to domain logic or use-case tests.
- [ ] Cross-cutting infrastructure (auth, technical telemetry, transactions, error formatting) lives outside; domain observations use a Domain Probe port or domain events.
