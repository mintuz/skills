# TDD Workflow Examples

## Example 1: Adding Free Shipping Feature

**Step 1: RED - Write failing test for simplest behavior**

```typescript
it("should calculate total with shipping cost", () => {
  const order = getMockOrder({ subtotal: 30, shippingCost: 5.99 });

  const result = processOrder(order);

  expect(result.total).toBe(35.99);
  expect(result.shippingCost).toBe(5.99);
});
```

**Step 2: GREEN - Minimal implementation**

```typescript
const processOrder = (order: Order): ProcessedOrder => {
  return {
    ...order,
    total: order.subtotal + order.shippingCost,
  };
};
```

**Step 3: RED - Add test for free shipping behavior**

```typescript
it("should apply free shipping for orders over £50", () => {
  const order = getMockOrder({ subtotal: 60, shippingCost: 5.99 });

  const result = processOrder(order);

  expect(result.shippingCost).toBe(0);
  expect(result.total).toBe(60);
});
```

**Step 4: GREEN - Add conditional (now both paths tested)**

```typescript
const processOrder = (order: Order): ProcessedOrder => {
  const shippingCost = order.subtotal > 50 ? 0 : order.shippingCost;

  return {
    ...order,
    shippingCost,
    total: order.subtotal + shippingCost,
  };
};
```

**Step 5: RED - Add edge case test**

```typescript
it("should charge shipping for orders exactly at £50", () => {
  const order = getMockOrder({ subtotal: 50, shippingCost: 5.99 });

  const result = processOrder(order);

  expect(result.shippingCost).toBe(5.99);
  expect(result.total).toBe(55.99);
});
```

**Step 6: REFACTOR - Extract constant (if valuable)**

```typescript
const FREE_SHIPPING_THRESHOLD = 50;

const qualifiesForFreeShipping = (subtotal: number): boolean => {
  return subtotal > FREE_SHIPPING_THRESHOLD;
};

const processOrder = (order: Order): ProcessedOrder => {
  const shippingCost = qualifiesForFreeShipping(order.subtotal)
    ? 0
    : order.shippingCost;

  return {
    ...order,
    shippingCost,
    total: order.subtotal + shippingCost,
  };
};
```

## Example 2: Payment Validation

**RED → GREEN → RED → GREEN pattern:**

```typescript
// Test 1: RED
it("should process valid payments", () => {
  const payment = getMockPayment({ amount: 100 });
  const result = processPayment(payment);

  expect(result.success).toBe(true);
});

// GREEN: Minimal implementation
const processPayment = (payment: Payment): Result<Receipt> => {
  return { success: true, data: { id: "receipt-123" } };
};

// Test 2: RED
it("should reject payments with negative amounts", () => {
  const payment = getMockPayment({ amount: -100 });
  const result = processPayment(payment);

  expect(result.success).toBe(false);
  expect(result.error.message).toBe("Invalid amount");
});

// GREEN: Add validation
const processPayment = (payment: Payment): Result<Receipt> => {
  if (payment.amount < 0) {
    return { success: false, error: new Error("Invalid amount") };
  }
  return { success: true, data: { id: "receipt-123" } };
};

// Test 3: RED
it("should reject payments with zero amount", () => {
  const payment = getMockPayment({ amount: 0 });
  const result = processPayment(payment);

  expect(result.success).toBe(false);
});

// GREEN: Adjust condition
const processPayment = (payment: Payment): Result<Receipt> => {
  if (payment.amount <= 0) {
    return { success: false, error: new Error("Invalid amount") };
  }
  return { success: true, data: { id: "receipt-123" } };
};
```

## Refactoring Assessment

### When to Refactor

With tests green, look for these signals:

| Signal | Refactoring Action |
| --- | --- |
| Magic numbers repeated | Extract named constants |
| Unclear names | Improve naming |
| Complex logic | Extract functions |
| Knowledge duplication | Create single source of truth |
| Nested structure | Use early returns |
| Long functions | Split into smaller functions |

### When NOT to Refactor

If the code is already clean, move to the next test:

- Clear function names ✓
- No magic numbers ✓
- Simple structure ✓
- Self-documenting ✓
