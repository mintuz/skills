# Contract and dependency checks

Read this reference in Phase B when a sketch crosses a module, process, storage or third-party boundary. A short type signature is not a small interface.

## 1. Non-type contract burden

Before you lock a sketch, list every obligation a caller must satisfy outside the type signature:

- **Call ordering:** required setup, session start or multi-step sequence the caller must remember.
- **Lifecycle:** resource acquisition, disposal, subscription cleanup or task cancellation.
- **Dependency construction:** configuration, clients, transactions or clocks the caller must assemble and supply.
- **Errors, retries, partial failure and cancellation:** which failures are transient, whether retries are safe (`principle-make-operations-idempotent`), and what partial state remains if an operation fails or cancels halfway.
- **Latency, throughput, consistency and transactions:** whether reads see recent writes, whether work spans a transaction boundary, and what timeout or cost callers absorb.

Pull these obligations behind the module contract whenever callers would otherwise repeat them. Keep failure modes, side effects and runtime costs explicit so callers handle them honestly.

## 2. Eight-axis dependency and test-fidelity check

For each collaborator that crosses the module boundary, record all eight axes before you choose a seam or test plan:

| Axis | Question | Design impact |
| --- | --- | --- |
| Runtime locality | In-process or out-of-process? | Sets latency, serialisation, cancellation and partial-failure rules. |
| Ownership | Owned, jointly owned or third-party? | Sets who can change the contract and how fast. |
| Trust | Same or different trust and authorisation boundary? | Sets validation and identity checks (`principle-parse-at-the-boundary`). |
| Transactions | Same transaction and consistency boundary? | Determines atomicity versus compensation or idempotent recovery. |
| Volatility | Stable or volatile mechanism? | Shows whether isolating provider details improves locality. |
| Statefulness | Stateful or resource-owning? | Sets lifecycle, concurrency, shutdown and composition rules. |
| Substitute availability | What faithful test substitute exists? | Determines what fast tests can cover. |
| Fidelity gap | What can the substitute **not** prove? | Names the contract, integration, sandbox or device tests still required. |

Always state the fidelity gap. An in-memory store does not prove database constraints or transaction isolation. A local stub does not prove third-party quotas, timeouts, token expiry or physical-device behaviour.

## 3. Seam strategies by dependency class

1. **In-process behaviour:** Keep cohesive policy behind the module contract. Add an internal seam only when behaviour varies in production or an untestable collaborator forces one.
2. **Local resource under application control:** Prefer a real local implementation or high-fidelity stand-in. Inject stable resources (database handle, store, clock) at construction, not on every call. Cover storage or engine rules with integration tests.
3. **Owned remote capability:** Express the boundary in domain terms. Keep transport, serialisation, auth, retries and telemetry in an adapter. Use a deterministic stateful fake for domain tests and a contract test against the real adapter.
4. **Third-party capability:** Wrap the provider in a narrow anti-corruption adapter so vendor types and error codes stay private (`principle-hide-representations`). Test domain policy with deterministic fakes; close the fidelity gap with sandbox, recorded-contract or integration tests.
5. **Nondeterministic capability (time, randomness, IDs, scheduling):** Inject only where control changes observable behaviour. Bind once at composition so callers do not pass test hooks on every call.

## 4. Examples

### Web (TypeScript)

An order-billing module calls a third-party payment SDK, writes to Postgres and stamps timestamps:

- **Non-type contract:** `charge(order)` owns idempotency keys, transient retry backoff and partial-failure reconciliation so checkout and renewal callers do not coordinate multi-step SDK calls.
- **Seams:** wrap the payment SDK in an anti-corruption adapter returning a domain union (`Paid | Declined | RetryLater`); inject the Postgres pool and `now: () => Date` at module construction.
- **Fidelity gap:** an in-memory payment fake proves domain state transitions; it does **not** prove webhook signature verification, provider idempotency windows, rate limits or SQL unique-constraint races. Close those with provider sandbox or contract tests and a real-Postgres integration test.

### iOS (Swift 6)

An offline-first `NoteSyncService` uploads queued notes to a third-party cloud storage SDK, persists state in SwiftData and stamps upload times:

- **Non-type contract:** `sync(noteID: UUID) async -> SyncOutcome` hides session setup, bounded retries and cancellation cleanup (resetting `.uploading` state and cleaning orphan remote drafts on task cancellation) instead of requiring callers to call `prepareSession()` first.
- **Seams:**
  - *Local persistence (owned, in-process, stateful):* single SwiftData `@ModelActor` store passing `Sendable` IDs and values across actors; fast tests use an in-memory `ModelContainer`.
  - *Cloud storage SDK (third-party, out-of-process, volatile, separate trust boundary):* narrow `Sendable` protocol taking and returning plain `Sendable` domain structs (never raw `URLResponse` or vendor SDK types); fast tests use an `actor`-backed stateful fake with fault injection or `URLProtocol` on a custom `URLSessionConfiguration`.
  - *Clock (nondeterministic):* composition-time default `now: @Sendable @escaping () -> Date = { Date.now }`.
- **Fidelity gap:** the `actor` fake and in-memory `ModelContainer` prove retry policy and cancellation transitions; they do **not** prove third-party auth expiry, upload quotas, `SchemaMigrationPlan` upgrades or background-task expiration on a physical device. Close those with adapter contract tests, migration tests and device verification.
