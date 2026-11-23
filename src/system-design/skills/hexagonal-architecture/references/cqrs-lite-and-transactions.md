# Backend CQRS-Lite and Atomic Transactions

Load this reference **only for backend services** when reads need to join across aggregates or writes require atomic multi-row/outbox transactions and optimistic concurrency. Do not apply server-side CQRS or outbox machinery to local-only client apps or simple single-aggregate CRUD.

## CQRS-Lite: Separating Reads from Writes

Aggregate repositories exist to protect **write consistency** around one aggregate boundary. Forcing dashboard or reporting reads through aggregate repositories causes either N+1 queries, bloated repository interfaces that break aggregate boundaries, or premature full-CQRS denormalisation.

CQRS-lite uses the same backing database with two distinct access paths:

| Operation | Pattern | Location | Purpose |
| --- | --- | --- | --- |
| State-changing write | Application-owned persistence port (one aggregate) | Port inside; repository adapter outside | Enforces aggregate invariants and atomic writes |
| Single-aggregate lookup for a command | Same persistence port | Port inside; repository adapter outside | Loads versioned aggregate state for domain rules |
| Cross-aggregate display or reporting read | Dedicated read query function/adapter | Driven adapter outside the hexagon | Joins tables freely and returns read-optimised projections |

### Keeping business meaning pure on the read side

- **Query adapters fetch raw joined rows** and live outside beside the persistence technology. They intentionally bypass write repositories.
- **Pure inside functions interpret business meaning** on those rows when a rule matters (for example, `isOverdue(dueDate, now)` or `remainingBudget(budget, spent)`). Pass `now` and any thresholds as explicit arguments (`principle-keep-the-core-pure`).
- **Driving adapters handle display-only formatting** (currency symbols, localised dates, pagination envelopes, HTTP JSON).
- Test query adapters with narrow integration tests against a real per-test database, and test pure read-interpretation functions directly with fast unit tests.

### When to move beyond CQRS-lite

Stay on CQRS-lite until you hit a concrete operational limit: separate read/write datastores, event sourcing with replayable projections, cross-service read models, or independently scaled read replicas. Most backend services never need full CQRS.

## Atomic Persistence, Outbox, and Optimistic Concurrency

Transaction mechanics belong in driven adapters; defining **what must commit atomically** belongs in application policy.

1. **Declare the atomic semantic operation on the driven port.**
   - Example: `saveWithOutbox(aggregate, events, expectedVersion) -> 'saved' | 'conflict'`.
   - The port expresses the required atomicity and concurrency contract without mentioning database transactions, sessions, or SQL locks.
2. **Implement transaction mechanics inside the driven adapter.**
   - Open the database transaction inside the adapter.
   - Update the aggregate with an optimistic version predicate (`WHERE id = ? AND version = expectedVersion`, incrementing `version`).
   - If zero rows updated, return `'conflict'` without inserting outbox rows.
   - Otherwise insert the outbox event rows in the same transaction and return `'saved'`.
3. **Handle conflict as an explicit application outcome.**
   - The use case handles `'conflict'` explicitly (for example, returning a `concurrent-change` domain/application result that the driving adapter maps to HTTP `409`).
   - The domain model remains completely unaware of database transactions and versions.

### Protecting multi-step external effects (`principle-make-operations-idempotent`)

Never combine a live external side effect (such as charging a payment provider) inside a database transaction, and never issue an unguarded external call before persisting durable local intent:

1. **Persist local pending state first** with a stable client/operation ID (rejecting reuse of that ID with different payloads).
2. **Prepare or create a durable provider reference** (using an idempotency key for short retries) and record that provider reference atomically with an optimistic version check before completing the irreversible effect.
3. **Complete or reconcile against the recorded provider reference.** On crash or concurrent conflict, reload current state and reconcile against the durable provider object instead of issuing a duplicate charge.
4. **Make outbox/queue consumers idempotent.** Enforce unique event or message IDs atomically in the projection or inbox store (`ON CONFLICT DO NOTHING` for validated immutable event logs, or payload-fingerprint verification when producer IDs could collide).
