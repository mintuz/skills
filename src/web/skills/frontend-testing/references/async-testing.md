# Async Testing Patterns

UI frameworks are async by nature (state updates, API calls, suspense). Testing Library provides utilities for async scenarios.

## findBy Queries

**Built-in async queries** (combines `getBy` + `waitFor`):

```typescript
// ✅ CORRECT - Wait for element to appear
const message = await screen.findByText(/success/i);

// Under the hood: retries getByText until it succeeds or timeout
```

**When to use:**
- Element appears after async operation
- Loading states disappear
- API responses render content

**Configuration:**
```typescript
// Default: 1000ms timeout
const message = await screen.findByText(/success/i);

// Custom timeout
const message = await screen.findByText(/success/i, {}, { timeout: 3000 });
```

## waitFor Utility

**For complex conditions** that `findBy` can't handle:

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

**waitFor retries until:**
- Assertion passes (doesn't throw)
- Timeout reached (default 1000ms)

## Common waitFor Mistakes

❌ **Side effects in waitFor**
```typescript
await waitFor(async () => {
  await user.click(button); // Side effect! Will click on every retry
  expect(submitOrder).toHaveBeenCalledTimes(1);
});
```

✅ **CORRECT - Only assertions**
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

`waitFor` reruns the whole callback whenever any assertion throws, so both
assertions do retry. The cost is diagnosis: the failure message names only the
first assertion that threw. Split unrelated assertions so each failure is
specific. Keep them together when the combined state is the condition you are
waiting for, and when either element on its own would be a false pass.

✅ **CORRECT - Await each condition on its own**
```typescript
await screen.findByText(/name/i);
await screen.findByText(/email/i);
```

Do not follow one `waitFor` with a plain `getBy*` for the second element. That
`getBy*` runs once and fails when the second element arrives later.

---

❌ **Wrapping findBy in waitFor**
```typescript
await waitFor(() => screen.findByText(/success/i)); // Redundant!
```

✅ **CORRECT - findBy already waits**
```typescript
await screen.findByText(/success/i);
```

## waitForElementToBeRemoved

**For disappearance scenarios:**

```typescript
// ✅ CORRECT - Wait for loading spinner to disappear
await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));

// ✅ CORRECT - Wait for modal to close
await waitForElementToBeRemoved(() => screen.queryByRole('dialog'));
```

**Note:** Use `queryBy*`, which returns null. The element must already be in the
DOM when the call starts; otherwise `waitForElementToBeRemoved` throws at once.

## Prove appearance before you assert absence

An absence assertion made straight after an interaction is anchored to nothing.
Depending on how fast the promise settles, it may run before the component could
react. It then passes whether the component is correct or broken.

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

**Rule:** Anchor every absence assertion to an observable state that can only
exist after the async work finished. The `status` and `alert` roles take their
accessible name from the author, not from their text, so find them by role alone
and assert their text with `toHaveTextContent`.

## Common Patterns

**Loading states:** the test controls when the load finishes, and the helper
owns both states.
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

**API responses:** mount the application helper, which owns the request and
renders the results.
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

**Debounced inputs:** the helper owns the debounce timer, so the test waits on
the rendered suggestion rather than on the timer.
```typescript
const user = userEvent.setup();
const suggest = vi.fn().mockResolvedValue(['React Testing Library']);

mountSuggestField({ suggest });

await user.type(screen.getByLabelText(/search/i), 'react');

// findBy retries past the debounce delay
await screen.findByText(/react testing library/i);
```
