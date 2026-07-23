# Test Data Factories

Read this reference when a behavior test needs structured data, repeated setup, nested variants, or isolation from shared mutable fixtures.

## Reuse before creating

Use the nearest existing factory that represents the same domain object. Create a factory when multiple tests need valid structured data with a few explicit variations. Keep a tiny one-off value in the test when abstraction would hide more than it explains.

## Keep defaults valid

A factory returns a fresh, valid object. Each test overrides only the field that drives its behavior slice.

```typescript
const payment = (overrides: Partial<Payment> = {}): Payment => ({
  id: "payment-123",
  amount: 100,
  currency: "GBP",
  ...overrides,
});

it("rejects a payment with a negative amount", () => {
  const result = processPayment(payment({ amount: -1 }));

  expect(result.ok).toBe(false);
});
```

Use the repository's schema parser when factories already validate through that schema. A factory does not justify a new runtime dependency.

## Compose domain objects

Compose nested factories instead of duplicating nested defaults:

```typescript
const address = (overrides: Partial<Address> = {}): Address => ({
  city: "London",
  country: "UK",
  ...overrides,
});

const customer = (
  overrides: Omit<Partial<Customer>, "address"> & {
    address?: Partial<Address>;
  } = {},
): Customer => {
  const { address: addressOverrides, ...customerOverrides } = overrides;

  return {
    id: "customer-123",
    address: address(addressOverrides),
    ...customerOverrides,
  };
};
```

Prefer one factory per domain concept. A scenario builder earns its place only when current tests repeatedly compose the same meaningful scenario.

## Keep setup local and fresh

Create behavior data and mutable harness state inside each test or a setup function called by each test. Reserve lifecycle hooks for framework or boundary cleanup that the repository cannot perform automatically.

```typescript
const setup = (overrides: Partial<Order> = {}) => {
  const order = orderFactory(overrides);
  return { order, result: processOrder(order) };
};
```

Return only values the test reads. Hidden mutation, order dependence, and shared writable objects break isolation even when wrapped in a helper.

## Check the factory

The data setup is complete when:

- each call returns fresh data;
- defaults form a valid ordinary case;
- the behavior-driving override is visible in the test;
- nested data comes from its owning factory;
- every new helper serves more than one current arrangement or makes one complex arrangement materially clearer.
