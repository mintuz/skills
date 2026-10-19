# Async Testing Patterns

## findBy Queries

`findBy*` combines `getBy*` with `waitFor`. Use it when an element appears after an async operation, a loading state disappears, or an API response renders content.

```typescript
// ✅ CORRECT - Wait for element to appear
const message = await screen.findByText(/success/i);

// Under the hood: retries getByText until it succeeds or timeout
```

```typescript
// Default: 1000ms timeout
const message = await screen.findByText(/success/i);

// Custom timeout
const message = await screen.findByText(/success/i, {}, { timeout: 3000 });
```

## waitFor Utility

Use `waitFor` for conditions `findBy` cannot express. It retries until the callback stops throwing or the timeout (default 1000ms) is reached.

```typescript
// ✅ CORRECT - Complex assertion
await waitFor(() => {
  expect(screen.getByText(/loaded/i)).toBeInTheDocument();
});

// ✅ CORRECT - Multiple elements
await waitFor(() => {
  expect(screen.getAllByRole('listitem')).toHaveLength(10);
});
```

## Common waitFor Mistakes

❌ **Side effects in waitFor**
```typescript
await waitFor(async () => {
  await user.click(button); // Side effect! Will click on every retry
  expect(submitOrder).toHaveBeenCalledTimes(1);
});
```

✅ **Only assertions**
```typescript
await user.click(button); // Outside waitFor
await waitFor(() => {
  expect(submitOrder).toHaveBeenCalledTimes(1); // Only assertion
});
```

---

❌ **Several unrelated assertions**
```typescript
await waitFor(() => {
  expect(screen.getByText(/name/i)).toBeInTheDocument();
  expect(screen.getByText(/email/i)).toBeInTheDocument();
});
```

`waitFor` reruns the whole callback whenever any assertion throws, so both assertions do retry. The cost is diagnosis: the failure message names only the first assertion that threw. Split unrelated assertions so each failure is specific. Keep them together when the combined state is the condition you are waiting for, and when either element alone would be a false pass.

✅ **Await each condition on its own**
```typescript
await screen.findByText(/name/i);
await screen.findByText(/email/i);
```

Do not follow one `waitFor` with a plain `getBy*` for the second element: that `getBy*` runs once and fails when the second element arrives later.

---

❌ **Wrapping findBy in waitFor**
```typescript
await waitFor(() => screen.findByText(/success/i)); // Redundant!
```

✅ **findBy already waits**
```typescript
await screen.findByText(/success/i);
```

## waitForElementToBeRemoved

```typescript
// ✅ CORRECT - Wait for loading spinner to disappear
await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));

// ✅ CORRECT - Wait for modal to close
await waitForElementToBeRemoved(() => screen.queryByRole('dialog'));
```

Pass a `queryBy*` callback, which returns null. The element must be in the DOM when the call starts; otherwise `waitForElementToBeRemoved` throws at once.

## Prove appearance before you assert absence

The main skill file's "Absence" rule applies: wait for a settled state first.

❌ **WRONG - Green for the wrong reason**
```typescript
await user.click(screen.getByRole('button', { name: /save/i }));
expect(screen.queryByRole('alert')).not.toBeInTheDocument(); // Proves nothing
```

✅ **CORRECT - Wait for the settled state first, then assert absence**
```typescript
await user.click(screen.getByRole('button', { name: /save/i }));
const status = await screen.findByRole('status');
expect(status).toHaveTextContent(/saved/i);
expect(screen.queryByRole('alert')).not.toBeInTheDocument();
```

## Common Patterns

**Loading states:** the test controls when the load finishes; the helper owns both states.
```typescript
let resolveUser: (name: string) => void;
const loadUser = vi.fn(() => new Promise<string>((resolve) => {
  resolveUser = resolve;
}));

mountUserCard({ loadUser }); // Renders the loading state, then the name

// Initially loading
expect(screen.getByText(/loading/i)).toBeInTheDocument();

resolveUser('John Doe');

// Wait for data
await screen.findByText(/john doe/i);

// Loading gone, and the wait above proves the component reacted
expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
```

**API responses:** mount the application helper, which owns the request and renders the results.
```typescript
const user = userEvent.setup();
const search = vi.fn().mockResolvedValue(tenResults);

mountSearchForm({ search }); // Owns the markup, the submit handler and the list

await user.type(screen.getByLabelText(/search/i), 'react');
await user.click(screen.getByRole('button', { name: /search/i }));

// Wait for results (after the search promise resolves)
await waitFor(() => {
  expect(screen.getAllByRole('listitem')).toHaveLength(10);
});
```

**Debounced inputs:** the helper owns the debounce timer, so the test waits on the rendered suggestion, not the timer.
```typescript
const user = userEvent.setup();
const suggest = vi.fn().mockResolvedValue(['React Testing Library']);

mountSuggestField({ suggest });

await user.type(screen.getByLabelText(/search/i), 'react');

// findBy retries past the debounce delay
await screen.findByText(/react testing library/i);
```
