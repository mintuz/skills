# TypeScript and Node.js Twelve-Factor Patterns

Use these patterns when implementing or refactoring a long-running TypeScript/Node.js backend service under `../SKILL.md`. Adapt names and libraries to project conventions while preserving every semantic guarantee.

## Config: Startup Schema Validation (Factor III)

Parse environment variables once in a pure, testable factory. Replace `NODE_ENV` checks with explicit behavioural settings (`SECURE_COOKIES`, `DB_POOL_MAX`). Let the process entry point log the validation error and exit non-zero.

```typescript
import { z } from 'zod';

const BooleanFlag = z.enum(['true', 'false']).transform((v) => v === 'true');

const ConfigSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  DATABASE_URL: z.string().url(),
  DB_POOL_MAX: z.coerce.number().int().min(1).max(200).default(10),
  REDIS_URL: z.string().url(),
  API_URL: z.string().url(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  SECURE_COOKIES: BooleanFlag.default('true'),
  API_KEY: z.string().min(1),
  SENTRY_DSN: z.string().url().optional(),
  ALLOWED_ORIGINS: z
    .string()
    .default('')
    .transform((s) => (s === '' ? [] : s.split(',').map((origin) => origin.trim()))),
});

export type Config = z.infer<typeof ConfigSchema>;

export const createConfig = (
  env: Record<string, string | undefined> = process.env,
): Config => ConfigSchema.parse(env);
```

## Config: Options-Object Injection (Factor III)

Inject only the settings a module needs. Never read `process.env` inside domain services or handlers.

```typescript
const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});
type User = z.infer<typeof UserSchema>;

export const createUserService = ({
  config,
}: {
  config: Pick<Config, 'API_URL'>;
}) => ({
  async getUser(id: string): Promise<User> {
    const response = await fetch(`${config.API_URL}/users/${id}`);
    if (!response.ok) throw new Error(`Failed to fetch user: ${response.status}`);
    const data: unknown = await response.json();
    return UserSchema.parse(data);
  },
});
```

## Config: Operator Template (`.env.example`) (Factor III)

Update `.env.example` in the same change as `ConfigSchema`. Use placeholder values only; never commit `.env` or real credentials.

```dotenv
PORT=3000
DATABASE_URL=postgres://localhost:5432/myapp
DB_POOL_MAX=10
REDIS_URL=redis://localhost:6379
API_URL=http://localhost:8080
LOG_LEVEL=info
SECURE_COOKIES=false
API_KEY=replace-with-api-key
SENTRY_DSN=
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

Finish every config refactor by grepping the source tree for `process.env` (and `NODE_ENV`) and confirming hits exist only in the config module and process entry points.

## Dependencies: Startup Check for External Binaries (Factor II)

Declare all JavaScript dependencies in `package.json` with a committed lockfile (`pnpm-lock.yaml` / `package-lock.json`). Verify required host binaries at startup rather than failing mid-request.

```typescript
import which from 'which';

export const checkSystemDependencies = (required: readonly string[]): void => {
  const missing = required.filter((cmd) => !which.sync(cmd, { nothrow: true }));
  if (missing.length > 0) {
    throw new Error(`Missing required system dependencies: ${missing.join(', ')}`);
  }
};
```

## Backing Services: Attached Resource Factory and Shutdown Coordinator (Factor IV)

Wire backing services at the composition root from injected configuration and expose one `shutdown()` coordinator.

```typescript
export const createApp = ({
  config,
}: {
  config: Pick<Config, 'DATABASE_URL' | 'DB_POOL_MAX' | 'REDIS_URL'>;
}) => {
  const db = createDbPool({
    connectionString: config.DATABASE_URL,
    max: config.DB_POOL_MAX,
  });
  const cache = createRedisClient({ url: config.REDIS_URL });

  return {
    db,
    cache,
    async shutdown(): Promise<void> {
      await Promise.all([db.end(), cache.quit()]);
    },
  } as const;
};
```

## Stateless Processes: External Session Store (Factor VI)

Store sessions in a backing service rather than process memory or local temporary files, and validate stored payloads on read.

```typescript
export const createSessionStore = <T>({
  redis,
  schema,
}: {
  redis: RedisClient;
  schema: z.ZodType<T>;
}) => ({
  async get(sessionId: string): Promise<T | undefined> {
    const raw = await redis.get(`session:${sessionId}`);
    return raw ? schema.parse(JSON.parse(raw)) : undefined;
  },
  async set({
    sessionId,
    data,
    ttlSeconds,
  }: {
    sessionId: string;
    data: T;
    ttlSeconds: number;
  }): Promise<void> {
    await redis.setex(`session:${sessionId}`, ttlSeconds, JSON.stringify(data));
  },
});
```

## Concurrency: Separate Entry Points per Process Type (Factor VIII)

Give each independently scaled workload its own entry point and declare process types in the platform manifest (for example `Procfile` or container definitions).

```typescript
// src/web.ts — HTTP traffic
const config = createConfig();
const logger = createLogger({ level: config.LOG_LEVEL });
const app = createApp({ config });
await startServer({ app, config, logger });

// src/worker.ts — asynchronous queue jobs
const config = createConfig();
const logger = createLogger({ level: config.LOG_LEVEL });
const queue = createQueueConsumer({ url: config.REDIS_URL, logger });
await queue.process('email', sendEmail);
await queue.process('report', generateReport);
```

```text
web: node dist/web.js
worker: node dist/worker.js
```

## Disposability: Health and Readiness Probes (Factor IX)

Separate liveness (`/health`: process is alive) from readiness (`/ready`: process can serve traffic using its critical backing services).

```typescript
export const createHealthRoutes = ({ db }: { db: DbPool }) => ({
  '/health': async () => ({ status: 'ok' as const }),
  '/ready': async () => {
    await db.query('SELECT 1');
    return { status: 'ready' as const };
  },
});
```

## Disposability: Idempotent Graceful Shutdown (Factor IX)

Handle `SIGTERM` and `SIGINT` once, drain in-flight requests, close every backing resource through one coordinator, enforce a forced-exit timeout, and exit non-zero on failure.

```typescript
const SHUTDOWN_TIMEOUT_MS = 30_000;

export const startServer = async ({
  app,
  config,
  logger,
}: {
  app: App;
  config: Pick<Config, 'PORT'>;
  logger: Logger;
}) => {
  const server = app.listen(config.PORT, () => {
    logger.info('Server started', { operation: 'server.start', port: config.PORT });
  });
  let shutdownPromise: Promise<void> | undefined;

  const shutdown = (signal: 'SIGTERM' | 'SIGINT'): Promise<void> => {
    if (shutdownPromise) return shutdownPromise;
    shutdownPromise = (async () => {
      const forceExit = setTimeout(() => process.exit(1), SHUTDOWN_TIMEOUT_MS);
      forceExit.unref();

      try {
        await new Promise<void>((resolve, reject) =>
          server.close((err) => (err ? reject(err) : resolve())),
        );
        await app.shutdown();
        clearTimeout(forceExit);
        process.exitCode = 0;
      } catch (err: unknown) {
        const diagnostic = JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'error',
          message: 'Shutdown failed',
          signal,
          error_type: err instanceof Error ? err.name : 'UnknownError',
        });
        await new Promise<void>((resolve) => {
          process.stderr.write(`${diagnostic}\n`, () => resolve());
        });
        clearTimeout(forceExit);
        process.exitCode = 1;
      }
    })();
    return shutdownPromise;
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  return { server, shutdown };
};
```

## Logs: Structured Process-Stream Logger with Per-Request Child Binding (Factor XI)

Use any conforming logger (such as `pino`, `winston` with console transport only, or OpenTelemetry). Keep the severity threshold injected from config (with a sensible default), write strictly to process streams (`stdout`/`stderr`), allowlist logged fields, and bind a per-request child logger at every handler entry.

```typescript
import { randomUUID } from 'node:crypto';

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 } as const;
export type LogLevel = keyof typeof LOG_LEVELS;

export type LogFields = Readonly<
  Partial<{
    request_id: string;
    trace_id: string;
    operation: string;
    outcome: string;
    duration_ms: number;
    port: number;
    error_type: string;
  }>
>;

export type Logger = Readonly<{
  debug: (message: string, fields?: LogFields) => void;
  info: (message: string, fields?: LogFields) => void;
  warn: (message: string, fields?: LogFields) => void;
  error: (message: string, fields?: LogFields) => void;
  child: (bindings: LogFields) => Logger;
}>;

export const createLogger = ({
  level = 'info',
  bindings = {},
}: {
  level?: LogLevel;
  bindings?: LogFields;
} = {}): Logger => {
  const shouldLog = (candidate: LogLevel) =>
    LOG_LEVELS[candidate] >= LOG_LEVELS[level];

  const write = (
    recordLevel: LogLevel,
    message: string,
    fields: LogFields = {},
  ): void => {
    if (!shouldLog(recordLevel)) return;
    const line = JSON.stringify({
      timestamp: new Date().toISOString(),
      level: recordLevel,
      message,
      ...bindings,
      ...fields,
    });
    const stream = recordLevel === 'error' ? process.stderr : process.stdout;
    stream.write(`${line}\n`);
  };

  return {
    debug: (message, fields) => write('debug', message, fields),
    info: (message, fields) => write('info', message, fields),
    warn: (message, fields) => write('warn', message, fields),
    error: (message, fields) => write('error', message, fields),
    child: (extraBindings) =>
      createLogger({ level, bindings: { ...bindings, ...extraBindings } }),
  };
};

// Bind at the entry to every HTTP or queue handler before migrating call sites.
export const createRequestLogger = ({
  logger,
  headers,
}: {
  logger: Logger;
  headers: Readonly<Record<string, string | string[] | undefined>>;
}): Logger => {
  const inbound = headers['x-request-id'];
  const requestId =
    typeof inbound === 'string' && inbound.trim().length > 0
      ? inbound.trim()
      : randomUUID();
  const traceHeader = headers['traceparent'];
  const traceId =
    typeof traceHeader === 'string' && traceHeader.trim().length > 0
      ? traceHeader.trim()
      : undefined;

  return logger.child({
    request_id: requestId,
    ...(traceId ? { trace_id: traceId } : {}),
  });
};
```

Extend `LogFields` only through a reviewed allowlist. Never log raw error messages or stacks containing user input, request bodies, authorisation headers, tokens, or personal data.

## Admin Processes: One-Off Migration Script (Factor XII)

Keep admin scripts in the repository (for example `scripts/migrate.ts`), reuse `createConfig()`, and close pools cleanly in `finally`.

```typescript
const config = createConfig();
const db = createDbPool({ connectionString: config.DATABASE_URL });
try {
  await runMigrations(db);
} finally {
  await db.end();
}
```
