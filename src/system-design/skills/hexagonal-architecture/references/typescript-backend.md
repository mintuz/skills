# TypeScript Backend Example

Load this reference when implementing or reviewing a TypeScript/Node backend feature in an opted-in hexagonal repository.

## 1. Pure Domain Types and Rules (Inside)

Keep domain rules synchronous and pure. Pass `now` and identifiers as explicit values (`principle-keep-the-core-pure`).

```typescript
// src/receipts/domain/eligibility.ts
export type OrderId = string & { readonly __brand: 'OrderId' };

export type OrderSummary = {
  readonly id: OrderId;
  readonly customerEmail: string;
  readonly paidAt: Date;
  readonly totalMinorUnits: number;
  readonly currency: 'GBP' | 'USD' | 'EUR';
};

export type ReceiptEligibility =
  | { readonly eligible: true; readonly subject: string }
  | { readonly eligible: false; readonly reason: 'window-expired' };

const RECEIPT_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export const evaluateReceiptEligibility = (
  order: OrderSummary,
  now: Date,
): ReceiptEligibility => {
  if (now.getTime() - order.paidAt.getTime() > RECEIPT_WINDOW_MS) {
    return { eligible: false, reason: 'window-expired' };
  }
  return { eligible: true, subject: `Receipt for order ${order.id}` };
};
```

## 2. Driving and Driven Ports (Inside, Application-Owned)

Never import vendor SDK clients or SDK DTOs here — not even with `import type`. Declare your own domain shapes and map them inside adapters (`principle-hide-representations`).

```typescript
// src/receipts/application/ports.ts
import type { OrderId, OrderSummary } from '../domain/eligibility';

export type SendReceiptResult =
  | { readonly sent: true }
  | { readonly sent: false; readonly reason: 'not-found' | 'window-expired' };

// Driving port (provided interface)
export interface ForSendingReceipts {
  readonly sendReceipt: (orderId: OrderId) => Promise<SendReceiptResult>;
}

// Driven ports (required interfaces, owned by the use case)
export interface OrderCatalog {
  readonly findById: (orderId: OrderId) => Promise<OrderSummary | undefined>;
}

export interface ReceiptMailer {
  readonly send: (message: {
    readonly to: string;
    readonly subject: string;
    readonly orderId: OrderId;
  }) => Promise<void>;
}
```

## 3. Use Case Orchestration (Inside)

The use case receives only ports and value suppliers (`now`), never concrete SDK clients or database handles.

```typescript
// src/receipts/application/send-receipt.ts
import { evaluateReceiptEligibility } from '../domain/eligibility';
import type { ForSendingReceipts, OrderCatalog, ReceiptMailer } from './ports';

export const createReceiptSender = (deps: {
  readonly orders: OrderCatalog;
  readonly mailer: ReceiptMailer;
  readonly now: () => Date;
}): ForSendingReceipts => ({
  sendReceipt: async (orderId) => {
    const order = await deps.orders.findById(orderId);
    if (!order) return { sent: false, reason: 'not-found' };

    const decision = evaluateReceiptEligibility(order, deps.now());
    if (!decision.eligible) return { sent: false, reason: decision.reason };

    await deps.mailer.send({
      to: order.customerEmail,
      subject: decision.subject,
      orderId: order.id,
    });
    return { sent: true };
  },
});
```

## 4. Driven Adapters (Outside, First-Party Code)

Place adapters beside the feature (`src/receipts/adapters/`) or in `adapters/` — never inside a third-party SDK folder (`src/lib/sdk/`). Translate expected external conditions into port outcomes; let unexpected failures propagate.

```typescript
// src/receipts/adapters/sdk-order-catalog.ts
import type { OrdersApiClient } from '../../lib/sdk/orders-api';
import type { OrderCatalog } from '../application/ports';
import type { OrderId } from '../domain/eligibility';

export const createSdkOrderCatalog = (client: OrdersApiClient): OrderCatalog => ({
  findById: async (orderId) => {
    const dto = await client.getOrder(orderId);
    if (!dto) return undefined;
    return {
      id: dto.id as OrderId,
      customerEmail: dto.email,
      paidAt: new Date(dto.paidAtIso),
      totalMinorUnits: dto.totalCents,
      currency: dto.currency,
    };
  },
});
```

## 5. Driving Adapter with Boundary Parsing (Outside)

Keep transport syntax parsing (`400`) separate from schema validation (`422`), authenticate before invoking the use case, and map domain outcomes to HTTP status codes (`principle-parse-at-the-boundary`).

```typescript
// src/receipts/adapters/http-send-receipt.ts
import { z } from 'zod';
import type { ForSendingReceipts } from '../application/ports';
import type { OrderId } from '../domain/eligibility';

const SendReceiptBodySchema = z.object({
  orderId: z.string().trim().min(1),
}).strict();

export const createSendReceiptHandler = (receipts: ForSendingReceipts) =>
  async (request: Request): Promise<Response> => {
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return Response.json({ error: 'malformed-json' }, { status: 400 });
    }

    const parsed = SendReceiptBodySchema.safeParse(rawBody);
    if (!parsed.success) {
      return Response.json({ error: 'invalid-body' }, { status: 422 });
    }

    const result = await receipts.sendReceipt(parsed.data.orderId as OrderId);
    if (!result.sent) {
      const status = result.reason === 'not-found' ? 404 : 422;
      return Response.json({ error: result.reason }, { status });
    }
    return Response.json({ sent: true }, { status: 200 });
  };
```

## 6. Composition Root (Executable Host)

Keep the composition root's caller signature unchanged: it accepts SDK clients or environment configuration and builds adapters internally. Inline composition inside a handler is valid only when that handler is a tiny, unshared serverless deployment entrypoint and wiring stays visually separate from input parsing.

```typescript
// src/composition/app.ts
import type { MailerClient } from '../lib/sdk/mailer';
import type { OrdersApiClient } from '../lib/sdk/orders-api';
import { createReceiptSender } from '../receipts/application/send-receipt';
import { createSdkOrderCatalog } from '../receipts/adapters/sdk-order-catalog';
import { createSdkReceiptMailer } from '../receipts/adapters/sdk-receipt-mailer';
import { createSendReceiptHandler } from '../receipts/adapters/http-send-receipt';

export const buildApp = (deps: {
  readonly ordersApi: OrdersApiClient;
  readonly mailerClient: MailerClient;
}) => {
  const receipts = createReceiptSender({
    orders: createSdkOrderCatalog(deps.ordersApi),
    mailer: createSdkReceiptMailer(deps.mailerClient),
    now: () => new Date(),
  });

  return {
    sendReceiptHandler: createSendReceiptHandler(receipts),
  };
};
```

## 7. Stateful Fakes and Use-Case Tests (Outside)

Use hand-written stateful or recording fakes under `src/receipts/testing/`. Never use `vi.fn()`, `vi.mock()`, `vi.spyOn()`, or SDK imports in use-case tests.

```typescript
// src/receipts/testing/fakes.ts
import type { OrderCatalog, ReceiptMailer } from '../application/ports';
import type { OrderId, OrderSummary } from '../domain/eligibility';

export const createFakeOrderCatalog = (
  initial: readonly OrderSummary[] = [],
): OrderCatalog => {
  const store = new Map(initial.map((o) => [o.id, o]));
  return { findById: async (id) => store.get(id) };
};

export const createRecordingReceiptMailer = (): ReceiptMailer & {
  readonly sent: readonly { readonly to: string; readonly subject: string; readonly orderId: OrderId }[];
} => {
  const sent: { readonly to: string; readonly subject: string; readonly orderId: OrderId }[] = [];
  return {
    send: async (message) => { sent.push(message); },
    get sent() { return sent; },
  };
};
```

```typescript
// src/receipts/application/send-receipt.test.ts
import { describe, expect, it } from 'vitest';
import { createReceiptSender } from './send-receipt';
import { createFakeOrderCatalog, createRecordingReceiptMailer } from '../testing/fakes';
import type { OrderId } from '../domain/eligibility';

describe('sendReceipt', () => {
  it('skips mailing when the 30-day window has expired', async () => {
    const orderId = 'ord_1' as OrderId;
    const mailer = createRecordingReceiptMailer();
    const receipts = createReceiptSender({
      orders: createFakeOrderCatalog([{
        id: orderId,
        customerEmail: 'ada@example.com',
        paidAt: new Date('2026-01-01T00:00:00Z'),
        totalMinorUnits: 2_500,
        currency: 'GBP',
      }]),
      mailer,
      now: () => new Date('2026-02-15T00:00:00Z'),
    });

    const result = await receipts.sendReceipt(orderId);

    expect(result).toEqual({ sent: false, reason: 'window-expired' });
    expect(mailer.sent).toHaveLength(0);
  });
});
```

Run a shared contract suite against both `createFakeOrderCatalog` and `createSdkOrderCatalog` (with a local HTTP stub) to verify identical contract semantics (`references/testing-and-probes.md`).
