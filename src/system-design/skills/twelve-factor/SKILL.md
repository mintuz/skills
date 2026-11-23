---
name: twelve-factor
description: "WHEN configuring, auditing, or refactoring deployable service or app operational boundaries—deploy-time configuration and secrets, backing services, process startup and graceful shutdown, structured logging, dev/prod parity, or one-off admin tasks; NOT for pure UI styling, internal logic refactoring, or domain design with no deployment or operational boundary; applies the twelve factors through an upfront platform applicability gate so server-only rules never misapply to edge functions or client apps."
---

# Twelve-Factor Operational Discipline

Apply the twelve factors to match the target runtime. Run the Platform Applicability Gate before recommending or editing any code. Never enforce server-only rules (such as port binding, OS signal handlers, or banning local persistence) on runtimes where the platform contract forbids or replaces them.

## Platform Applicability Gate

Identify the deployable runtime first and follow the column that matches it. In every audit or plan, state the applicability status (`Full`, `Adapt`, or `N/A`) and platform reason for each affected factor explicitly, and apply the concrete runtime APIs and constraints from the matching reference file rather than leaving guidance abstract.

| Factor | Backend services (containers / VMs / PaaS) | Edge / Serverless (Workers / Lambda) | Static web frontends / SPAs | Client-side iOS apps |
| --- | --- | --- | --- | --- |
| **I. Codebase** | Full | Full | Full | Full |
| **II. Dependencies** | Full | Full | Full | Full (manifests + lockfiles) |
| **III. Config** | Full (runtime env / secret injection) | Adapt (platform bindings & secrets) | Adapt (public build-time config only; zero secrets) | Adapt (non-secret build config + Keychain + backend secrets; `#if DEBUG` only at composition root) |
| **IV. Backing services** | Full | Adapt (platform resource bindings) | Adapt (remote API endpoints) | Adapt (remote APIs + explicit local stores) |
| **V. Build, release, run** | Full (one immutable build artefact) | Full (immutable deploy bundle) | Adapt (build-time public config contract) | Adapt (signed immutable app bundle; versioned releases) |
| **VI. Stateless processes** | Full (zero in-memory / local-disk shared state) | Full (zero cross-invocation memory or `/tmp` state) | N/A (stateful browser client) | N/A (stateful single-user client; **never ban local persistence**) |
| **VII. Port binding** | Full | N/A (platform owns sockets) | N/A (CDN / static host) | N/A (client UI / extensions) |
| **VIII. Concurrency** | Full (separate process types) | Adapt (isolate scaling + queues + cron) | N/A (browser runtime) | N/A (OS lifecycle + structured concurrency) |
| **IX. Disposability** | Full (`SIGTERM`/`SIGINT` drain + probes + idempotent jobs) | Adapt (fast cold start + execution limits + idempotent handlers; no `SIGTERM`) | Adapt (abort in-flight requests; handle tab close/offline) | Adapt (fast launch + crash-safe recovery journal + background-task expiration + `.task` cancellation; no `SIGTERM` or `/health`) |
| **X. Dev/prod parity** | Full | Adapt (local emulator + staging parity) | Adapt (production build & browser parity) | Adapt (physical-device Release parity; simulator is insufficient) |
| **XI. Logs** | Full (structured records to process streams + request correlation) | Adapt (structured records to platform-captured streams + request correlation) | Adapt (redacted telemetry; no secrets/PII) | Adapt (OS unified logging with explicit privacy masks; **never stdout JSON or log files**) |
| **XII. Admin processes** | Full (one-off repo scripts with same release & config) | Adapt (one-off CI/CD or admin job outside hot request path) | N/A | Adapt (versioned in-app schema migrations; no server shell) |

## Adoption Order

- **Greenfield:** Run the Platform Applicability Gate, then apply every factor marked **Full** or **Adapt** from the first deployable slice.
- **Brownfield:** Adopt changes incrementally in risk order so live services stabilise without a rewrite:
  1. **Config (Factor III)** — centralise and validate deploy-varying settings with no domain restructure.
  2. **Logs (Factor XI)** — switch to structured, correlated platform-stream logs.
  3. **Disposability (Factor IX)** — add graceful shutdown, drain timeouts, probes, and idempotent retries (or client crash-safe recovery).
  4. **Backing services (Factor IV)** — inject resource bindings at the composition root.
  5. **Stateless processes (Factor VI)** — move in-memory or local-disk runtime state to external backing services (backend and edge only).

## Factor Rules

### I. Codebase
Track one deployable unit in revision control and produce many deploys from it. A monorepo is valid when each deployable service owns its entry point, deploy pipeline, and backing-service connections. Share code through owned packages or modules, never by copy-paste.

### II. Dependencies
Declare every dependency explicitly in the project manifest and commit the lockfile. Isolate dependencies from global host packages. Treat external command-line tools invoked as subprocesses as explicit runtime dependencies: document them, constrain versions where practical, and verify availability at build or startup.

### III. Config
Store deploy-varying configuration outside the build artefact via the runtime's supported injection mechanism. Never hardcode credentials or environment-specific endpoints. Never ship third-party API secrets inside client web bundles or mobile application packages.

Enforce every rule below when creating or updating configuration:

1. **Validate at startup.** Parse configuration once at boot against a schema. Fail fast with a non-zero exit and a clear error when required settings are missing or invalid.
2. **Inject as explicit options.** Pass validated configuration slices from the composition root into modules. Never read raw environment or platform configuration deep inside handlers or domain code.
3. **Centralise every read in the same change.** When you introduce or edit a config module, move **every** raw configuration read across the application into it in that same change—including settings the user request did not mention (such as log levels, output paths, or feature toggles). Search the source tree before finishing to confirm only the config module and process entry points touch raw configuration.
4. **Delete environment-name branches.** Remove every branch that switches behaviour on an environment name (such as `production` vs `development`) in the files you touch. Name what the branch decided, promote it to an explicit validated setting (such as secure-cookie mode or connection-pool size), and delete the branch. Two deploys given identical settings must behave identically. Fix surviving branches instead of merely noting them in a summary.
5. **Ship the operator config template in the same change.** Update the operator-facing configuration template alongside the schema—an example environment file where environment variables are the interface, or the platform's manifest/secret declaration otherwise. Include one line per required setting with placeholder values only, never real credentials, and never commit live secret files.

### IV. Backing Services
Treat every database, cache, queue, mail provider, object store, or external API as an attached resource supplied at composition time via injected configuration (URL, platform binding, socket path, handle, or structured credentials). Domain code must not distinguish local from third-party services; swapping equivalent providers changes injected configuration (and an adapter only when the wire protocol differs).

### V. Build, Release, Run
Separate build, release, and run stages strictly. Promote one immutable build artefact across environments and inject configuration at release or run time. Never patch a running release in place; ship a new build. Where a platform mandates compile-time public configuration (static frontends, signed mobile bundles), keep that contract explicit and keep all secrets off the client.

### VI. Stateless Processes
On backend and edge runtimes, execute stateless, share-nothing processes. Move persistent or cross-request data (sessions, uploads, counters, distributed schedule locks) into backing services. Do not store sessions in process memory, write shared state to local temporary directories, or run uncoordinated in-process timers across replicas.

**Client boundary:** Do not apply this factor to remove local databases, app container files, or OS credential storage on client-side iOS apps or offline-capable web clients. Load `references/client-web-and-ios.md` before changing client persistence.

### VII. Port Binding
Export long-running backend services by binding directly to an injected port inside the application process. Do not add port binding to edge/serverless functions, static frontends, or client apps.

### VIII. Concurrency
Scale backend workloads horizontally by separating distinct responsibilities into independent process types (such as web, worker, and scheduler) declared in the platform's process manifest. Offload durable or long-running background work to a queue and worker; keep short request-owned work inline when latency and retry requirements permit. On edge/serverless runtimes, rely on platform isolate concurrency, queues, and scheduled triggers.

### IX. Disposability
Start quickly without deferring unsafe configuration or dependency failures into the first live request. Make background jobs, queue consumers, and event handlers idempotent and re-entrant so interrupted work retries safely.

- **Backend services:** Handle `SIGTERM` and `SIGINT` idempotently. Stop accepting new traffic, drain in-flight requests, close every backing-service pool and consumer through one shutdown coordinator, enforce a forced-exit drain timeout, and exit non-zero if shutdown fails. Implement the liveness and readiness probes expected by the orchestrator.
- **Edge/serverless and client apps:** Apply the runtime's native lifecycle contract from the matching reference file; do not add POSIX signal handlers or HTTP health endpoints where the platform does not use them.

### X. Dev/Prod Parity
Keep development, staging, and production aligned on every characteristic that affects runtime behaviour. Where a local substitute is intentional, verify it against the same behavioural contract as production. Run parity checks on the real target environment where emulators or simulators diverge (especially physical-device Release builds on iOS).

### XI. Logs
Treat logs as an event stream owned by the execution platform. Never write log files, configure file rotation, or attach file transports inside application code.

For backend and edge services, a logging change is incomplete until all three requirements hold, regardless of how narrow the original request was:

1. **Structured and externally levelled.** Emit machine-parseable records (JSON by default) containing an ISO 8601 timestamp, ranked severity, and an allowlisted set of structured fields (never raw credentials, headers, request bodies, or unneeded personal data). Inject the severity threshold from configuration or a factory option with a sensible default—never hardcode it inside the logger.
2. **Process streams only.** Write exclusively to platform-captured process streams (`stdout` for standard records; `stderr` for error diagnostics where captured) and remove all file transports.
3. **Request correlation on every handler.** Attach a request or trace identifier to every log record emitted while serving a request. Extract the identifier from the inbound trace or request-ID header when present, or generate one per request when absent. Bind a per-request child logger at handler entry before migrating call sites, and verify every handler emits the identifier before reporting done.

For internet-facing servers, ensure the server or edge layer also records RFC 6302 (BCP 162) transport fields (source and destination addresses and ports, UTC timestamps, transport protocol). For client-side iOS apps, use OS unified logging with explicit privacy annotations instead of `stdout` JSON.

### XII. Admin Processes
Keep one-off administrative tasks (migrations, backfills, repair scripts) inside the repository and execute them against the same release artefact, dependencies, and validated configuration as the application. On client apps with local databases, ship versioned in-app migrations instead of expecting a server shell.

## Verification Checklist

Verify every applicable item before reporting done:

- [ ] Platform Applicability Gate applied; server-only factors marked N/A where they do not fit.
- [ ] Config parsed and validated at startup with schema tests covering missing/invalid values and defaults.
- [ ] Source search confirms raw config reads exist only in the config module and process entry points, with zero surviving environment-name branches in touched files.
- [ ] Operator config template updated in the same change with placeholders only and zero real secrets.
- [ ] Backing services injected at composition time; equivalent providers swappable without domain edits.
- [ ] Backend/edge runtimes keep zero cross-request state in memory or local temporary disk; client apps preserve explicit local persistence hygiene.
- [ ] Lifecycle matches runtime (backend: idempotent `SIGTERM`/`SIGINT` drain, resource cleanup test, drain timeout, `/health` + `/ready`; edge: fast cold start + idempotent handlers; iOS: crash-safe recovery + background-task expiration + `.task` cancellation).
- [ ] Logs match runtime (backend/edge: structured records on process streams only, injected threshold, zero file transports, per-request correlation ID bound at every handler; iOS: unified logger with explicit privacy annotations).
- [ ] Parity and admin migrations match the deployment contract.

## Handovers

Invoke these companion skills when work crosses their boundary:

| Need | Skill |
| --- | --- |
| Isolate backing services behind driven ports and swappable adapters | `hexagonal-architecture` |
| Drive config validation, graceful shutdown, correlation logging, and wiring with behavioural tests | `tdd` |
| Parse and validate external config, stored schemas, and network payloads at trust boundaries | `principle-parse-at-the-boundary` |
| Keep credentials and unneeded personal data out of templates, logs, crash reports, and client bundles | `principle-keep-secrets-out` |
| Make retried jobs, event handlers, migrations, and crash recovery converge safely | `principle-make-operations-idempotent` |

## References

Read only the reference file whose runtime matches the task:

| Reference | Load when... |
| --- | --- |
| `references/typescript-node.md` | Implementing or refactoring any factor in a TypeScript/Node.js backend service (Zod startup config, options injection, `.env.example`, system dependency checks, backing-service factory + `shutdown()`, Redis session store, web/worker entry points, `/health` + `/ready`, `SIGTERM`/`SIGINT` drain, structured JSON logger with per-request child logger binding, one-off migration script). |
| `references/edge-and-serverless.md` | Targeting Cloudflare Workers, AWS Lambda, Vercel/Netlify Edge Functions, or similar serverless runtimes (platform bindings/secrets, fast cold starts, idempotent handlers, queue/cron concurrency, platform-captured correlated logs, and why port binding and `SIGTERM` drain are N/A). |
| `references/client-web-and-ios.md` | Auditing or configuring static web SPAs or Swift 6 iOS apps (public build config vs Keychain/backend secrets, `#if DEBUG` composition-root boundary, explicit local persistence and file protection, versioned in-app migrations, crash-safe iOS disposability and background tasks, `OSLog` privacy annotations, and physical-device Release parity). |
