# TDD Workflow Examples

Read this reference when a concrete feature or defect transcript is needed. The commands are illustrative; use the repository's runner and selectors.

## Add one behavior at a time

Requested behavior:

- orders below or at £50 keep their shipping charge;
- orders above £50 receive free shipping.

Inventory both outcomes, then select the ordinary paid-shipping slice.

### Red 1

```typescript
it("charges shipping for an order at £50", () => {
  const result = processOrder(order({ subtotal: 50, shippingCost: 5 }));

  expect(result.total).toBe(55);
});
```

```text
$ test process-order --test-name-pattern "at £50"
Expected: 55
Received: 50
```

The test reaches its assertion and fails because paid shipping is absent.

### Green 1

```typescript
export const processOrder = (order: Order): ProcessedOrder => ({
  ...order,
  total: order.subtotal + order.shippingCost,
});
```

The targeted test and affected order suite pass. Return to the inventory and select free shipping.

### Red 2

```typescript
it("applies free shipping above £50", () => {
  const result = processOrder(order({ subtotal: 51, shippingCost: 5 }));

  expect(result).toMatchObject({ shippingCost: 0, total: 51 });
});
```

The new test fails with `shippingCost: 5` and `total: 56`; the earlier test remains Green.

### Green 2

```typescript
export const processOrder = (order: Order): ProcessedOrder => {
  const shippingCost = order.subtotal > 50 ? 0 : order.shippingCost;

  return {
    ...order,
    shippingCost,
    total: order.subtotal + shippingCost,
  };
};
```

Both slices pass. The `> 50` boundary is demanded by the two tests; another abstraction is not.

### Refactor decision

The rule has one owner and the function is clear: **no refactor needed**. Run the relevant configured checks and report both cycles.

## Reproduce a defect

Reported defect: a declined gateway response is returned as a successful payment.

### Red

Use the public payment API and the existing gateway fake:

```typescript
it("returns a decline when the gateway declines the payment", async () => {
  gateway.declineWith("insufficient funds");

  const result = await pay(payment());

  expect(result).toEqual({
    ok: false,
    reason: "insufficient funds",
  });
});
```

The diagnostic Red state is a resolved success result. A thrown fixture error or an unconfigured gateway is test setup failure and must be repaired before production changes.

### Green

Change the shared response-mapping owner so every caller receives the declined result. Run the regression test, the existing successful-payment test, and the affected payment suite.

### Refactor decision

Assess structure only after those contracts are Green. If response mapping now duplicates live domain knowledge, preserve a Green checkpoint and use `refactoring`; otherwise record “no refactor needed.”

## Evidence record

For either example, a complete report can be compact:

| Slice | Red | Green | Refactor |
| --- | --- | --- | --- |
| Shipping at £50 | targeted test failed `50 != 55` | target and order suite passed | no refactor needed |
| Free shipping above £50 | targeted test failed with shipping `5` | target and order suite passed | no refactor needed |

Record real commands and outcomes for the repository under change.
