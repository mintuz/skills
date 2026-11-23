# Testing Strategy, Contract Suites, and Domain Probes

Load this reference when designing the port test wall, writing stateful fakes, verifying adapter swappability, or implementing domain observability.

## The Port Test Wall

A port is real only when tests exercise both sides of it:

- Every **driving port** needs a test driver (use-case tests calling the driving port directly).
- Every **driven port** needs a hand-written stateful or recording fake for use-case tests, plus adapter verification at the real boundary.

Without test interactors on each port, the boundary is only a diagram. The test wall detects leaks immediately: business rules drifting into an adapter or technology details drifting into the core break boundary tests.

| Priority | Boundary | Interactors | What it proves | Speed |
| --- | --- | --- | --- | --- |
| **Primary** | Use case (driving port) | Test suite + stateful fakes | Feature works end to end inside the hexagon | Fast |
| **Complement** | Pure domain functions | Direct unit / property tests | Complex edge cases and domain invariants | Very fast |
| **Secondary** | Driven adapters | Shared contract suite / narrow integration tests (test DB, stub HTTP) | Adapter translates accurately and honours port semantics | Slower |
| **Verification** | Full stack | Driving adapter + real composition (E2E / UI) | Transport, wiring, and user journey work together | Slowest |

## Stateful Fakes Over Mocks

At driven ports, prefer hand-written stateful or recording fakes that implement the port contract directly (`principle-test-behavior-not-implementation`).

- **Compile-time alignment:** Because a fake implements the real port interface or protocol, signature changes break the fake at compile time.
- **Behavioural assertions:** Assert observable results and recorded state (for example, the stored entity, recorded events, or sent receipts) rather than call order or private helper invocations.
- **Encapsulated test mutability:** Fakes use internal mutable collections (maps, arrays, thread-safe actors/locks) to simulate an external store or recipient. Keep that mutability encapsulated inside the fake; stored domain values remain immutable.
- **Controllable fault injection:** Give fakes explicit test hooks or configuration flags to trigger expected port failures (optimistic conflict, declined payment, offline timeout) deterministically.
- **Zero SDK imports in use-case tests:** Use-case tests must never import vendor SDK clients or use mocking-framework spies to stub SDK calls. Replace legacy SDK mocks with port fakes whenever you touch a use-case test.

## Shared Adapter Contract Suites and Swappability

Stateful fakes can drift from real adapters if they do not obey the same contract (for example, optimistic version conflicts, duplicate-ID idempotency, or empty-result behaviour). Prevent drift with a **shared contract test suite**:

1. Write one parameterised test suite against the driven port contract (round-trip save/load, missing-ID behaviour, optimistic concurrency conflict, idempotent retry, expected error translation).
2. Run the exact same contract suite against **both** the in-memory fake and every real driven adapter (for example, SQL adapter against a fresh per-test database, HTTP adapter against a local stub server).
3. Treat every contract test failure in the fake as a bug in the fake, not an excuse to weaken the suite.

### The swappability test

Swapping any driven adapter (for example, one database engine for another, one payment provider for another, or a fake for a live adapter) must require:

- **Zero changes** to domain logic.
- **Zero changes** to use-case tests.
- Changes confined to the new adapter and the composition root.

If a swap forces edits inside the hexagon or its use-case tests, infrastructure leaked through the port.

## Four-Tier Observability and Domain Probes

Separate technical telemetry from business-significant observations using this test: **does someone outside the engineering team rely on this fact as a feature (support, billing, analytics, alerting), or is it developer scaffolding?**

### Tier 1 — Technical telemetry (adapters only)

Request/response cycles, query latency, retries, and connection failures live in driving and driven adapters (and auto-instrumentation).

- Never import a logger into domain or application code.
- If an outcome already appears in the driving port's return value (for example, `{ success: false, reason: 'budget-exceeded' }`), inspect the result in the driving adapter and log it there. Do not add a port for facts the return value already exposes.

### Tier 2 — Domain-significant observations (Domain Probe port or domain events)

When an important business fact is intermediate (which pricing rule matched, cache hit versus external fetch, retry count) or is a product/support requirement in its own right, do not pollute the return type with telemetry fields. Model the observability recipient as a driven actor behind a **Domain Probe** port:

- **Per-capability and business-named:** e.g., `CheckoutTelemetry` or `PledgeObserver` with domain methods (`discountApplied(ruleId, orderId)`, `pledgeRejected(reason, occasionId)`).
- **Severity-free and fire-and-forget:** Methods take domain values only, return nothing (`void`), and never influence control flow. The adapter decides log level, metric names, and span attributes.
- **Reuse existing domain events:** If the capability already emits domain events through an event publisher port, subscribe the observability adapter to that publisher instead of creating a second announcement channel.
- **Anti-patterns:** Never create a generic `Logger` port (`log(level, message)`), never widen use-case return types purely to carry log fields, and never allow a probe to return data that branches domain logic.

### Tier 3 — Correlation and context (adapters and decorators only)

Trace IDs, request IDs, span lifecycles, and wide-event assembly live exclusively in driving/driven adapters or port decorators. **The inside never sees a trace ID.**

- Use a decorator wrapping a driving or driven port to time and trace whole operations.
- A decorator sees only what crosses the port (inputs, outputs, duration, errors). When a wide event needs intermediate domain dimensions, deliver them via a Tier 2 Domain Probe whose adapter attaches them to the active span or request context.

### Tier 4 — Tested instrumentation

Because a Domain Probe is a driven port, give it a recording fake like any other driven port:

1. In use-case tests, pass the recording fake and assert that business-significant observations are emitted for the right inputs and outcomes.
2. In adapter tests, verify that the concrete probe adapter maps each domain call to the expected structured log fields, metrics, or span attributes.
3. Developer-only diagnostic logs do not belong in domain code and do not require probe ports.
