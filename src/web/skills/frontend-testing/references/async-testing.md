# Async testing patterns

## findBy*

`findBy*` retries the matching `getBy*` query until it succeeds or the timeout expires. Use it for an element that appears after async work, such as the end of a loading state or a rendered API response.

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
  expect(screen.getAllByRole('listitem')).toHaveLength(10);
});
```

## waitFor mistakes

**Side effect in the callback.** `waitFor` reruns the callback, so an interaction inside it runs on every retry.

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

**Unrelated assertions in one callback.** Any throwing assertion reruns all of them, and the failure message names only the first. Split unrelated assertions. Keep assertions together only when the combined state is the condition you wait for, and either element alone would be a false pass.

```typescript
// ❌
await waitFor(() => {
  expect(screen.getByText(/name/i)).toBeInTheDocument();
  expect(screen.getByText(/email/i)).toBeInTheDocument();
});

// ✅
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

Pass a `queryBy*` callback. The element must be in the DOM when the call starts; otherwise `waitForElementToBeRemoved` throws at once.

```typescript
await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));
await waitForElementToBeRemoved(() => screen.queryByRole('dialog'));
```

## Settled state before absence

Apply the "Absence" rule in `SKILL.md`.

```typescript
await user.click(screen.getByRole('button', { name: /save/i }));

// ❌ Can run before the component reacts, so it proves nothing
expect(screen.queryByRole('alert')).not.toBeInTheDocument();

// ✅ Wait for the settled state, then assert absence
const status = await screen.findByRole('status');
expect(status).toHaveTextContent(/saved/i);
expect(screen.queryByRole('alert')).not.toBeInTheDocument();
```

## Common patterns

**Loading state.** The test controls when the load finishes. The helper owns both states.

```typescript
let resolveUser: (name: string) => void;
const loadUser = vi.fn(() => new Promise<string>((resolve) => {
  resolveUser = resolve;
}));

mountUserCard({ loadUser }); // Renders the loading state, then the name
expect(screen.getByText(/loading/i)).toBeInTheDocument();

resolveUser('John Doe');
await screen.findByText(/john doe/i);
// The wait above anchors this absence check
expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
```

**API response.** Mount the helper that owns the request, the submit handler and the rendered results.

```typescript
const user = userEvent.setup();
const search = vi.fn().mockResolvedValue(tenResults);

mountSearchForm({ search });
await user.type(screen.getByLabelText(/search/i), 'react');
await user.click(screen.getByRole('button', { name: /search/i }));

await waitFor(() => {
  expect(screen.getAllByRole('listitem')).toHaveLength(10);
});
```

**Debounced input.** The helper owns the debounce timer. Wait for the rendered suggestion, not for the timer; `findBy*` retries past the debounce delay.

```typescript
const user = userEvent.setup();
const suggest = vi.fn().mockResolvedValue(['React Testing Library']);

mountSuggestField({ suggest });
await user.type(screen.getByLabelText(/search/i), 'react');
await screen.findByText(/react testing library/i);
```
