# Async testing patterns

## findBy queries

`findBy*` combines `getBy*` with `waitFor`: it retries the `getBy*` query until it succeeds or the timeout expires. Use it when an element appears after an async operation, when a loading state ends, or when an API response renders content.

```typescript
// Default timeout: 1000 ms
const message = await screen.findByText(/success/i);

// Custom timeout
const message = await screen.findByText(/success/i, {}, { timeout: 3000 });
```

## waitFor

Use `waitFor` for a condition that `findBy*` cannot express. It retries the callback until the callback stops throwing or the timeout (default 1000 ms) expires.

```typescript
await waitFor(() => {
  expect(screen.getByText(/loaded/i)).toBeInTheDocument();
});

await waitFor(() => {
  expect(screen.getAllByRole('listitem')).toHaveLength(10);
});
```

## waitFor mistakes

**Side effect in the callback.** `waitFor` reruns the callback, so an interaction inside it runs on every retry. Interact once, outside the callback; put only assertions inside it.

```typescript
// ❌ Clicks on every retry
await waitFor(async () => {
  await user.click(button);
  expect(submitOrder).toHaveBeenCalledTimes(1);
});

// ✅
await user.click(button);
await waitFor(() => {
  expect(submitOrder).toHaveBeenCalledTimes(1);
});
```

**Several unrelated assertions in one callback.** `waitFor` reruns the whole callback when any assertion throws, so every assertion retries. The failure message names only the first assertion that threw, so diagnosis is harder. Split unrelated assertions so that each failure is specific. Keep assertions together when the combined state is the condition you wait for, and when either element alone would be a false pass.

```typescript
// ❌
await waitFor(() => {
  expect(screen.getByText(/name/i)).toBeInTheDocument();
  expect(screen.getByText(/email/i)).toBeInTheDocument();
});

// ✅ Await each condition on its own
await screen.findByText(/name/i);
await screen.findByText(/email/i);
```

Do not follow one `waitFor` with a plain `getBy*` for the second element. That `getBy*` runs once and fails when the second element arrives later.

**`findBy*` inside `waitFor`.** `findBy*` already waits.

```typescript
// ❌
await waitFor(() => screen.findByText(/success/i));
// ✅
await screen.findByText(/success/i);
```

## waitForElementToBeRemoved

```typescript
// Wait for a loading spinner to disappear
await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));

// Wait for a modal to close
await waitForElementToBeRemoved(() => screen.queryByRole('dialog'));
```

Pass a `queryBy*` callback, which returns null. The element must be in the DOM when the call starts; otherwise `waitForElementToBeRemoved` throws at once.

## Prove the settled state before you assert absence

The "Absence" rule in `SKILL.md` applies: wait for a settled state first.

```typescript
// ❌ Passes for the wrong reason: proves nothing
await user.click(screen.getByRole('button', { name: /save/i }));
expect(screen.queryByRole('alert')).not.toBeInTheDocument();

// ✅ Wait for the settled state, then assert absence
await user.click(screen.getByRole('button', { name: /save/i }));
const status = await screen.findByRole('status');
expect(status).toHaveTextContent(/saved/i);
expect(screen.queryByRole('alert')).not.toBeInTheDocument();
```

## Common patterns

**Loading states.** The test controls when the load finishes; the helper owns both states.

```typescript
let resolveUser: (name: string) => void;
const loadUser = vi.fn(() => new Promise<string>((resolve) => {
  resolveUser = resolve;
}));

mountUserCard({ loadUser }); // Renders the loading state, then the name

expect(screen.getByText(/loading/i)).toBeInTheDocument();

resolveUser('John Doe');

await screen.findByText(/john doe/i);

// The wait above proves the component reacted, so this absence check is anchored
expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
```

**API responses.** Mount the application helper, which owns the request and renders the results.

```typescript
const user = userEvent.setup();
const search = vi.fn().mockResolvedValue(tenResults);

mountSearchForm({ search }); // Owns the markup, the submit handler and the list

await user.type(screen.getByLabelText(/search/i), 'react');
await user.click(screen.getByRole('button', { name: /search/i }));

// Wait for the results after the search promise resolves
await waitFor(() => {
  expect(screen.getAllByRole('listitem')).toHaveLength(10);
});
```

**Debounced inputs.** The helper owns the debounce timer, so the test waits for the rendered suggestion, not for the timer.

```typescript
const user = userEvent.setup();
const suggest = vi.fn().mockResolvedValue(['React Testing Library']);

mountSuggestField({ suggest });

await user.type(screen.getByLabelText(/search/i), 'react');

// findBy retries past the debounce delay
await screen.findByText(/react testing library/i);
```
