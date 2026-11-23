# Greenfield Sequence and Incremental Adoption

Load this reference when starting an opted-in hexagonal project from scratch or migrating an existing codebase incrementally.

## Greenfield Sequence (The Four Wirings)

Do not scaffold empty layers, ports, or adapters for hypothetical features. Start with one real slice and progress through four wirings alongside `tdd`.

### Step 0: Create the first honest boundary

Use `codebase-layout` to choose the physical shape for the first capability: one visible inside area, one outside area for driving and driven adapters, outside test interactors, and a composition root at the executable host.

### Step 1: Driving side — the application returns a constant

1. Declare the first driving port contract only.
2. **RED:** Write an inner-loop unit test calling the driving port and expecting a simple constant. Confirm it fails.
3. **GREEN:** Implement the smallest use case behind the driving port returning that constant (the fake-it step).

If the project uses an outer acceptance-test loop, confirm the walking-skeleton acceptance test fails *before* Step 1 and never weaken or delete that outer test. Only the inner Step 1 placeholder unit test is triangulated away in Step 2.

### Step 2: Driven side — a fake returns a value (`test-to-test`)

1. Declare the first driven port contract inside beside the use case.
2. Implement an outside in-memory fake returning a **different** value from Step 1.
3. **RED:** Update the test to pass the fake into the use case and assert the fake's value. Confirm it fails against the hardcoded constant.
4. **GREEN:** Update the use case to accept the driven port as a constructor or factory parameter and call it.

The hexagonal architecture is now complete: one driving port, one driven port, a configurator (the test), and an application with zero source dependencies on outside code. Everything after Step 2 is feature growth.

### Step 3: Add a real driving adapter (`real-to-test`)

Connect the first real driving adapter (HTTP route, UI screen, CLI command, queue consumer, or system intent) while keeping the fake driven port. Wire the fake in the executable host's composition root. Two driving interactors (the test suite and the real adapter) now exercise the same driving port.

### Step 4: Add a real driven adapter (`test-to-real` and `real-to-real`)

Implement the real driven adapter (database, HTTP client, device API) behind the driven port and verify it with narrow integration or contract tests (`references/testing-and-probes.md`). Keep use-case tests running against the fake. Wire the real driving adapter to the real driven adapter in the production composition root.

| Wiring | Driving interactor | Driven interactor | Stage |
| --- | --- | --- | --- |
| `test-to-test` | Test suite | In-memory fake | Step 2 — boundary proven |
| `real-to-test` | Real driving adapter | In-memory fake | Step 3 — driving edge wired |
| `test-to-real` | Test suite / contract suite | Real adapter (test DB / stub HTTP) | Step 4 — driven adapter verified |
| `real-to-real` | Real driving adapter | Real adapter | Production composition root |

After Step 2, Steps 3 and 4 may land in either order.

### Walking Skeleton

Connect the real technologies (Steps 3 and 4) for a tiny, end-to-end transaction *before* building complex business logic. This exposes integration, deployment, and packaging risks early while standing up the test pipeline. Then grow domain rules, ports, and adapters incrementally.

## Incremental Adoption (Strangler Fig)

Do not rewrite an entire legacy codebase or create a repository-wide empty skeleton up front. Extract one boundary at a time while keeping behaviour green.

If legacy code relies on hidden globals or hard-coded dependencies and lacks tests, hand off to `test-seams` first to put characterisation tests in place before extracting durable ports.

### Six-step extraction loop

1. **Pick one high-value slice** where business rules are tangled with I/O (such as a handler or controller querying storage, branching on business rules, and formatting a response).
2. **Extract pure domain functions** for the business decisions (inputs and clock values in, explicit domain result out). Add direct unit tests.
3. **Declare the application-owned driven port** in business language for the persistence or external call the slice requires, including expected conflict or uniqueness outcomes.
4. **Wrap the existing infrastructure call in a thin driven adapter** that implements the driven port and translates technology types and errors at the boundary.
5. **Create the driving port and use case** that loads through the driven port, invokes the pure domain function, and saves or delegates side effects. Replace existing SDK mocks with stateful fakes in use-case tests.
6. **Thin out the driving adapter** so it only authenticates, parses untrusted input, calls the driving port, and translates the result. Move concrete wiring to the composition root (or keep wiring visually separated if it is a tiny unshared executable entrypoint).

### Migration priority matrix

| Codebase signal | Priority | Action |
| --- | --- | --- |
| Business rules embedded in route handlers, views, or jobs | High | Extract pure domain functions first |
| Direct database or vendor SDK calls duplicated across features | High | Extract driven ports and thin adapters |
| Untestable features requiring a live database or network | High | Extract driven ports and replace mocks with stateful fakes |
| Simple pass-through CRUD with no business rules | Low | Leave untouched; hexagonal ceremony adds cost without value |
| Stable legacy modules that rarely change | Low | Defer until a feature or defect requires touching them |

### What to avoid during adoption

- Do not migrate every feature at once; verify each extracted slice with fake-backed use-case tests before starting the next.
- Do not add ports for trivial static configuration lookups or pure internal helpers.
- Do not create generic base repository abstractions (`BaseRepository<T>`); keep each port focused on one aggregate or capability.
- **Proof check:** After extracting a slice, you must be able to test the full use case with fakes and zero real I/O. If you cannot, an outside dependency is still tangled inside.
