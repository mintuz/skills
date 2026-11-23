# TypeScript and JavaScript Seams

Language-specific seam patterns for TypeScript, JavaScript, Node.js, and React. Read the core workflow and seam granularity rules in `../SKILL.md` first.

## 1. Default Parameter Seams

Pass each hidden dependency as a parameter with a production default so existing call sites stay unchanged. The parameter is the seam; the call-site argument list (and default expression) is the enabling point.

```typescript
// BEFORE — hidden external dependency, no enabling point
export function scheduleDelivery(delivery: Delivery): DeliveryPlan {
  const transitDays = fetchTransitDays(delivery.region);
  return { ...delivery, totalDays: delivery.preparationDays + transitDays };
}

// AFTER — default parameter seam preserves all callers
export type TransitDaysResolver = (region: string) => number;

export function scheduleDelivery(
  delivery: Delivery,
  resolveTransitDays: TransitDaysResolver = fetchTransitDays,
): DeliveryPlan {
  const transitDays = resolveTransitDays(delivery.region);
  return { ...delivery, totalDays: delivery.preparationDays + transitDays };
}

// Test (separation)
const plan = scheduleDelivery({ ...testDelivery, preparationDays: 3 }, () => 2);
expect(plan.totalDays).toBe(5);
```

## 2. Higher-Order Function Factories

When a unit requires several collaborators, bind them once in a factory that returns a configured function. Export a default-wired production instance to keep existing callers unchanged.

```typescript
export type ShipmentDeps = {
  readonly lookupWeightGrams: (sku: string) => number;
  readonly getPackagingWeightGrams: () => number;
};

export const createShipmentCalculator = (deps: ShipmentDeps) =>
  (lineItems: ReadonlyArray<LineItem>): number => {
    const contents = lineItems.reduce(
      (sum, item) => sum + deps.lookupWeightGrams(item.sku),
      0,
    );
    return contents + deps.getPackagingWeightGrams();
  };

// Production default — existing callers keep calling calculateShipment(items)
export const calculateShipment = createShipmentCalculator({
  lookupWeightGrams: (sku) => catalogApi.getWeightGrams(sku),
  getPackagingWeightGrams: () => packagingCatalog.getStandardWeightGrams(),
});

// Test — isolated per-test wiring with hand-written fakes
const calc = createShipmentCalculator({
  lookupWeightGrams: () => 100,
  getPackagingWeightGrams: () => 20,
});
expect(calc([testItem])).toBe(120);
```

## 3. Narrow Interfaces (Contract Extraction)

When legacy code constructs or imports a wide SDK client, extract a narrow `readonly` contract containing only the operations this unit uses. Keep the production adapter thin inside the default.

```typescript
// BEFORE — coupled directly to a wide storage SDK
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export async function uploadReport(report: Report): Promise<string> {
  const client = new S3Client({ region: 'us-east-1' });
  await client.send(new PutObjectCommand({
    Bucket: 'reports',
    Key: report.id,
    Body: report.content,
  }));
  return `s3://reports/${report.id}`;
}

// AFTER — narrow seam contract with thin production default
export type ReportStorage = {
  readonly upload: (key: string, content: string) => Promise<string>;
};

const defaultS3Storage: ReportStorage = {
  upload: async (key, content) => {
    const client = new S3Client({ region: 'us-east-1' });
    await client.send(new PutObjectCommand({
      Bucket: 'reports',
      Key: key,
      Body: content,
    }));
    return `s3://reports/${key}`;
  },
};

export async function uploadReport(
  report: Report,
  storage: ReportStorage = defaultS3Storage,
): Promise<string> {
  return storage.upload(report.id, report.content);
}
```

## 4. Wrapping Globals, Clocks, and Configuration

A `process.env`, `Date.now()`, `Math.random()`, or singleton lookup left inside the function body is a hidden dependency—not a configuration seam. Move every global read into a parameter default or deps object so the function body reads zero globals.

```typescript
export type RenewalDeps = {
  readonly now: () => number;
  readonly graceDays: number;
  readonly postNotice: (payload: { accountId: string; cutoffMs: number }) => Promise<void>;
};

const defaultRenewalDeps = (): RenewalDeps => ({
  now: Date.now,
  graceDays: Number(process.env.RENEWAL_GRACE_DAYS ?? '7'),
  postNotice: async (payload) => {
    const client = new BillingHttpClient(process.env.BILLING_API_URL!);
    await client.post('/notices/renewal', payload);
  },
});

export async function sendRenewalNotice(
  accountId: string,
  expiresAtMs: number,
  deps: Partial<RenewalDeps> = {},
): Promise<boolean> {
  const resolved: RenewalDeps = { ...defaultRenewalDeps(), ...deps };
  const cutoffMs = expiresAtMs + resolved.graceDays * 86_400_000;
  if (resolved.now() > cutoffMs) {
    return false;
  }
  await resolved.postNotice({ accountId, cutoffMs });
  return true;
}
```

Do not use `vi.useFakeTimers()` or `vi.stubEnv()` when a parameter default can supply the clock or configuration cleanly. Do not pass the real `BillingHttpClient` through the seam in unit tests.

## 5. Sensing Closures and Stateful Fakes

Capture calls and inject faults using small hand-written fakes created per test—no mocking framework required.

```typescript
type NoticeCall = { readonly accountId: string; readonly cutoffMs: number };

function createSensingPoster(failure?: Error) {
  const recorded: NoticeCall[] = [];
  return {
    postNotice: async (payload: NoticeCall): Promise<void> => {
      recorded.push(payload);
      if (failure) throw failure;
    },
    calls: (): ReadonlyArray<NoticeCall> => [...recorded],
  };
}

// Test (separation + sensing)
const poster = createSensingPoster();
const sent = await sendRenewalNotice('acct-1', 1_700_000_000_000, {
  now: () => 1_700_000_000_000,
  graceDays: 3,
  postNotice: poster.postNotice,
});
expect(sent).toBe(true);
expect(poster.calls()).toEqual([
  { accountId: 'acct-1', cutoffMs: 1_700_000_000_000 + 3 * 86_400_000 },
]);
```

## 6. Async and Stream Seams

Async I/O uses the same parameter or contract seams with `Promise` return types. For streams or event emitters, inject a factory that returns a fresh stream:

```typescript
export type LogStreamProvider = () => ReadableStream<string>;

export async function collectErrorLines(
  openStream: LogStreamProvider = () => connectToLogService(),
): Promise<ReadonlyArray<string>> {
  const reader = openStream().getReader();
  const errors: string[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value.startsWith('ERROR')) errors.push(value);
  }
  return errors;
}
```

## 7. React Props, Context, and MSW Boundary Seams

- **Props as parameter seams:** accept optional collaborator props with production defaults so callers stay unchanged while tests pass fakes.
- **Context as configuration seams:** provide the real client at the app root and wrap components with a fake provider in tests.
- **MSW (Mock Service Worker) as an HTTP boundary seam:** when verifying request paths, headers, serialisation, or HTTP status handling across fetch/client code, intercept at the network boundary with `setupServer(...handlers)` in `beforeAll` / `afterEach(() => server.resetHandlers())` / `afterAll`.

```tsx
type OrderSummaryProps = {
  readonly items: ReadonlyArray<LineItem>;
  readonly formatCurrency?: (amount: Money) => string;
};

export function OrderSummary({
  items,
  formatCurrency = defaultFormatCurrency,
}: OrderSummaryProps) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{formatCurrency(item.price)}</li>
      ))}
    </ul>
  );
}
```

## 8. Legacy Class-Based Seams

When existing code uses classes, keep changes minimal and preserve the class when it owns cohesive state or multiple collaborating methods:

- **Constructor injection with production defaults:** replace internal `new Collaborator()` fields with constructor parameters that default to the production collaborator. Existing `new Service()` callers keep working.
- **Extract and Override:** when constructor changes are too wide for a first step, extract the single untestable call into a `protected` method and override it in a test-only subclass for separation or sensing. Treat Extract and Override as temporary scaffolding and move to constructor or parameter injection once tests cover the behaviour.

```typescript
export class OrderService {
  constructor(
    private readonly repo: OrderRepository = createDefaultOrderRepo(),
    private readonly now: () => number = Date.now,
  ) {}

  async findActive(id: string): Promise<Order | undefined> {
    const order = await this.repo.findById(id);
    return order && order.expiresAtMs > this.now() ? order : undefined;
  }
}
```

## 9. Temporary Module Mocking (Last-Resort Scaffolding)

`vi.mock()` and `jest.mock()` replace module imports at runtime. Use them **only** as temporary scaffolding when a signature cannot change before first characterisation tests exist.

Drawbacks:
- Bypasses TypeScript type checking.
- Hides the enabling point outside production code and couples tests to import paths.
- Shares mutable mock state across tests unless cleared explicitly.

Migration rule:
1. If an import is too heavy to mock directly, place it behind a thin local wrapper module first.
2. Once characterisation tests pass, introduce an explicit parameter, factory, or constructor seam.
3. Delete `vi.mock()` / `jest.mock()` and any `vi.stubEnv()` or `vi.useFakeTimers()` calls replaced by the new seam. Never keep both.

## Quick Comparison

| Seam Type | Enabling Point | Type Safety | Permanence |
| --- | --- | --- | --- |
| Default parameter | Call-site argument list / default | Full | Local seam or durable contract |
| Higher-order factory | Factory call site | Full | Local seam or durable contract |
| Narrow interface / constructor | Parameter or constructor argument | Full | Local seam or durable contract |
| React prop / Context | JSX prop / `<Context.Provider>` | Full | Local seam or durable contract |
| MSW handler | `server.use(...)` per test | Boundary | HTTP edge test seam |
| Extract and Override (class) | Test subclass override | Full | Temporary scaffolding |
| `vi.mock()` / `jest.mock()` | Test file mock declaration | None | Temporary scaffolding only |
