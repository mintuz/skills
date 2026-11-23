# Edge and Serverless Twelve-Factor Adaptations

Use this reference when targeting edge isolates or serverless functions (such as Cloudflare Workers, AWS Lambda, or Vercel/Netlify Edge Functions) under `../SKILL.md`.

## Factors That Are N/A in Server Form

Do not carry long-running container boilerplate into serverless runtimes:

- **Port Binding (Factor VII) — N/A:** The platform owns socket binding, TLS termination, and request dispatch to your handler export. Never call an HTTP server listen method or bind to a `PORT`.
- **OS-Signal Graceful Shutdown (server-form Factor IX) — N/A:** The platform owns the isolate lifecycle and does not guarantee a `SIGTERM`/`SIGINT` drain window before eviction. Never rely on POSIX signal hooks to flush buffered state or drain connections; adapt Factor IX to fast cold starts, bounded execution, and idempotent handlers.
- **Hand-Managed `Procfile` Workers (server-form Factor VIII) — N/A (Adapt to platform scaling):** Do not run long-lived polling loops inside serverless handlers. State explicitly that Factor VIII adapts to **platform-managed isolate scaling**, durable queues, and scheduled cron triggers.

## Config and Backing Services: Platform Bindings and Secrets (Factors III & IV)

Treat platform environment bindings, secret stores, KV namespaces, object buckets, queues, and managed database pools as injected attached resources:

1. **Validate bindings once at the entry boundary.** Parse the platform `env` object through a schema (checking required URLs, secrets, and resource bindings) before running handler logic. Pass only the typed slice each domain function needs.
2. **Delete environment-name branches.** Use explicit per-environment binding values and feature flags instead of branching on a stage name.
3. **Update the platform manifest in the same change.** Document every required non-secret binding and secret name in the platform manifest (for example `wrangler.toml`, `serverless.yml`, or IaC template) and an operator template with placeholders only. Store real secret values exclusively in the platform's secret manager.

```typescript
import { z } from 'zod';

const WorkerConfigSchema = z.object({
  WEBHOOK_SIGNING_SECRET: z.string().min(1),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  MAX_BATCH_SIZE: z.coerce.number().int().min(1).max(100).default(25),
});

export interface WorkerEnv {
  readonly WEBHOOK_SIGNING_SECRET?: string;
  readonly LOG_LEVEL?: string;
  readonly MAX_BATCH_SIZE?: string;
  readonly EVENTS_QUEUE: Queue<WebhookJob>;
}

export const parseWorkerConfig = (env: WorkerEnv) =>
  WorkerConfigSchema.parse({
    WEBHOOK_SIGNING_SECRET: env.WEBHOOK_SIGNING_SECRET,
    LOG_LEVEL: env.LOG_LEVEL,
    MAX_BATCH_SIZE: env.MAX_BATCH_SIZE,
  });
```

## Stateless Processes: Zero Cross-Invocation State (Factor VI)

Never batch events in module-level memory or local `/tmp` storage across invocations. An isolate can be recycled immediately after a response or scaled to dozens of concurrent instances.

- Write durable state directly to an attached backing service (database, KV, object store) or enqueue a job onto a managed queue binding before acknowledging the request.
- Use module-level caching only for immutable, regenerable data (such as compiled schemas or public JWKS keys with bounded TTL).

## Disposability: Cold Starts, Bounded Execution, and Idempotency (Factor IX)

Adapt disposability to short-lived isolates:

- **Keep cold starts fast.** Minimise bundle size and top-level imports. Avoid heavy synchronous computation at module evaluation time while still validating required configuration before handling requests.
- **Stay inside platform execution limits.** Respect CPU and wall-clock ceilings. Enqueue slow or multi-step work onto a managed queue instead of holding an HTTP invocation open. Use `ctx.waitUntil(...)` only for bounded, non-critical background flushing (such as telemetry), never for durable business writes.
- **Make every handler idempotent and re-entrant.** Managed queues and webhooks deliver at least once, and a function can terminate mid-execution. Key every durable write and outbound side effect on a stable event or message ID so retries converge safely (hand over to `principle-make-operations-idempotent`).

## Concurrency: Platform Scaling, Queues, and Cron Triggers (Factor VIII)

Divide work by platform trigger type rather than OS process types:

- **HTTP handler:** Authenticate, validate payload, perform quick reads/writes or enqueue work, and return promptly.
- **Queue consumer:** Process asynchronous jobs in bounded batches with explicit retries and a dead-letter queue (DLQ).
- **Scheduled / cron trigger:** Run periodic maintenance through the platform's scheduler rather than in-process timers.

## Logs: Platform-Captured Correlated Streams (Factor XI)

Write structured JSON records directly to the platform's captured console/stream output (never local files):

- Include an ISO 8601 timestamp, ranked severity compared against an injected threshold, and allowlisted structured fields (never secrets, raw webhook bodies, or unneeded PII).
- Extract the inbound correlation identifier (`traceparent`, `x-request-id`, or platform ray/invocation ID) or generate a UUID per invocation, and bind a child logger at handler entry so every record in that invocation is queryable together.

```typescript
export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const config = parseWorkerConfig(env);
    const requestId =
      request.headers.get('x-request-id') ??
      request.headers.get('cf-ray') ??
      crypto.randomUUID();
    const log = createLogger({ level: config.LOG_LEVEL }).child({
      request_id: requestId,
    });

    log.info('Webhook received', { operation: 'webhook.ingest' });
    // Validate signature, parse payload, enqueue durable job, return 202.
    return new Response(null, { status: 202 });
  },
};
```

## Dev/Prod Parity and Admin Processes (Factors X & XII)

- **Parity:** Local emulators simplify iteration but diverge from production on cold starts, CPU limits, networking, and real bindings. Verify deployment behaviour in a staging environment backed by the real platform services before promoting.
- **Admin tasks:** Run database migrations and backfills as one-off CI/CD or dedicated admin jobs using the same schema package and validated configuration—never run schema migrations inside hot request handlers.
