# Behavior Patterns

Read this reference when selecting a test surface, naming a behavior, isolating a boundary, or choosing a test double.

## Define the contract

A behavior contract has four parts:

1. public starting state or input;
2. public action;
3. observable outcome;
4. external boundary or side effect, when one exists.

Use the narrowest public entry point that still proves the requested outcome. Rendered UI contracts belong to `frontend-testing`; React harness decisions belong to `react-testing`.

```typescript
it("rejects a payment with a negative amount", () => {
  const result = processPayment(payment({ amount: -1 }));

  expect(result).toEqual({ ok: false, reason: "invalid amount" });
});
```

The contract is rejection. A validator call, private field, internal class, or intermediate state cannot replace that observable result.

## Slice behavior

Start with one representative outcome, then let each new Red test introduce one distinction:

| Domain distinction | Example slice |
| --- | --- |
| Happy path | A valid payment succeeds |
| Rejection | A negative payment is rejected |
| Boundary | A zero payment is rejected |
| Side effect | A successful payment records one receipt |
| Failure propagation | A gateway decline returns the domain error |

Derive slices from requirements and reachable domain boundaries. A generic edge-case list is not evidence that an edge applies.

## Name and locate tests

Name the observable rule in domain language:

```typescript
"applies free shipping above £50"
"charges shipping at exactly £50"
```

Keep tests beside the repository's existing feature tests. Organize them around public behavior when the local suite does so; preserve established file placement when it uses another convention.

## Isolate external boundaries

Use real domain code inside the behavior owner. Replace only boundaries that are slow, nondeterministic, destructive, or outside the process, using the repository's existing fake, stub, spy, or network interception pattern.

Assert the observable result first. Assert a boundary call only when the call itself is part of the contract, such as charging once or publishing a required event.

## Check the pattern

The selected test is ready for Red when:

- its name states one observable outcome;
- it enters through a public surface;
- its arrangement exposes the domain distinction;
- its assertion can fail when that outcome is absent;
- each test double stands at an external boundary.
