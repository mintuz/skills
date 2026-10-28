# Test Data Factories

## Fresh Explicit Data, Not Shared Mutable Fixtures

In JavaScript and TypeScript, build test data with factory functions that take
optional overrides. Never build that data with `let` declarations or `beforeEach`.
Keep lifecycle hooks for owned resources such as a server, database transaction
or fake timer, including their established teardown.

These language-specific keywords are not a cross-language ban: local Swift `let`
bindings are immutable and valid. Simple local Swift scalar data needs no factory.

```typescript
// ✅ GOOD - Factory with overrides
const getMockPayment = (overrides?: Partial<Payment>): Payment => {
  return {
    id: "payment-123",
    amount: 100,
    currency: "GBP",
    cardId: "card_456",
    ...overrides,
  };
};

const getMockOrder = (overrides?: Partial<Order>): Order => {
  return {
    id: "order-789",
    items: [getMockOrderItem()],
    subtotal: 50,
    shippingCost: 5.99,
    status: "pending",
    ...overrides,
  };
};

// Usage in tests
it("should reject payments with negative amounts", () => {
  const payment = getMockPayment({ amount: -100 });
  const result = processPayment(payment);

  expect(result.success).toBe(false);
});

it("should apply discount for large orders", () => {
  const order = getMockOrder({ subtotal: 200 });
  const result = processOrder(order);

  expect(result.discount).toBeGreaterThan(0);
});
```

```typescript
// ❌ BAD - let and beforeEach
let payment: Payment;
let order: Order;

beforeEach(() => {
  payment = { id: "123", amount: 100, currency: "GBP" };
  order = { id: "456", items: [], subtotal: 50 };
});

it("should process payment", () => {
  // Where did payment come from? What's its state?
  // Hard to trace, easy to have shared state bugs
});
```

## Why Factories Are Better

| Shared mutable JavaScript/TypeScript let + beforeEach | Factory Functions |
| --- | --- |
| Shared mutable state | Fresh data each test |
| Hard to trace data origin | Explicit data creation |
| Implicit test coupling | Isolated tests |
| Mutation bugs possible | A fresh, isolated object per call |
| Harder to customize | Easy overrides |

## Composing Factories

```typescript
const getMockAddress = (overrides?: Partial<Address>): Address => ({
  line1: "123 Test Street",
  city: "London",
  postcode: "SW1A 1AA",
  country: "UK",
  ...overrides,
});

const getMockCustomer = (overrides?: Partial<Customer>): Customer => ({
  id: "customer-123",
  email: "test@example.com",
  name: "Test User",
  address: getMockAddress(),
  ...overrides,
});

const getMockOrderWithCustomer = (
  overrides?: Partial<Order & { customer?: Partial<Customer> }>
): Order => {
  const { customer: customerOverrides, ...orderOverrides } = overrides ?? {};
  return {
    ...getMockOrder(orderOverrides),
    customer: getMockCustomer(customerOverrides),
  };
};

// Usage
const order = getMockOrderWithCustomer({
  subtotal: 100,
  customer: { email: "vip@example.com" },
});
```

## Test Organization

### Organize by Behavior, Not Implementation

```typescript
// ✅ GOOD - Organized by business behavior
describe("Order processing", () => {
  describe("shipping calculations", () => {
    it("should charge standard shipping for orders under £50", () => {});
    it("should apply free shipping for orders over £50", () => {});
    it("should charge shipping for orders exactly at £50", () => {});
  });

  describe("discount application", () => {
    it("should apply 10% discount for orders over £100", () => {});
    it("should stack discounts with free shipping", () => {});
  });
});

// ❌ BAD - Organized by implementation
describe("OrderProcessor", () => {
  describe("calculateShipping method", () => {});
  describe("applyDiscount method", () => {});
  describe("validateOrder method", () => {});
});
```

### No 1:1 Test File to Implementation File Mapping

Organise tests by feature or behaviour, not by mirroring implementation structure:

```
// ❌ BAD - 1:1 mapping
src/
  payment-validator.ts
  payment-validator.test.ts
  payment-processor.ts
  payment-processor.test.ts

// ✅ GOOD - By feature/behavior
src/
  payment/
    payment-processor.ts      # Public API
    payment-validator.ts      # Internal (implementation detail)
    payment-processor.test.ts # Tests ALL payment behavior
```

The validator is an implementation detail; testing the processor's behaviour covers its logic fully.

## 100% Coverage Through Behavior

Reach complete coverage by testing every business behaviour, not by targeting implementation:

```typescript
// payment-validator.ts (implementation detail - no direct tests)
export const validateAmount = (amount: number): boolean => {
  return amount > 0 && amount <= 10000;
};

// payment-processor.ts (public API)
export const processPayment = (payment: Payment): Result<Receipt> => {
  if (!validateAmount(payment.amount)) {
    return { success: false, error: new PaymentError("Invalid amount") };
  }
  // ... process payment
};

// payment-processor.test.ts - tests achieve 100% coverage of validator
// without directly testing validateAmount

it("should reject payments with negative amounts", () => {
  const payment = getMockPayment({ amount: -100 });
  const result = processPayment(payment);
  expect(result.success).toBe(false);
});

it("should reject payments with zero amount", () => {
  const payment = getMockPayment({ amount: 0 });
  const result = processPayment(payment);
  expect(result.success).toBe(false);
});

it("should reject payments exceeding maximum", () => {
  const payment = getMockPayment({ amount: 10001 });
  const result = processPayment(payment);
  expect(result.success).toBe(false);
});

it("should process valid payment amounts", () => {
  const payment = getMockPayment({ amount: 100 });
  const result = processPayment(payment);
  expect(result.success).toBe(true);
});
```
