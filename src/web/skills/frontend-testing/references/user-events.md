# User event simulation

## userEvent against fireEvent

Use `userEvent`, not `fireEvent`. `userEvent`:

- dispatches the full pointer, focus and mouse event sequence that a browser fires, in browser order and timing, not one synthetic event;
- throws when the target has `pointer-events: none`;
- suppresses mouse activation events on a disabled control, so `click` never fires there and the test fails instead of passing.

```typescript
// ❌ Incomplete simulation
fireEvent.change(input, { target: { value: 'test' } });
fireEvent.click(button);

// ✅
const user = userEvent.setup();
await user.type(input, 'test');
await user.click(button);
```

Use `fireEvent` only when:

- `userEvent` does not support the event;
- the test covers non-standard browser behaviour;
- the project does not have `@testing-library/user-event` installed. Say that `user-event` would model the interaction more closely. Do not add it unasked.

## userEvent.setup()

Call `userEvent.setup()` in the test body, not in `beforeEach`. `setup()` binds to the current `document` and installs its clipboard and pointer state when called. Per-test options, such as `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })`, then sit at the point of use. Under fake timers, pass `advanceTimers`. Do not disable the delay with `delay: null`.

```typescript
it('accepts user input', async () => {
  const user = userEvent.setup();
  document.body.innerHTML = '<input aria-label="Email" />';

  await user.type(screen.getByLabelText(/email/i), 'test@example.com');
});
```

## Common interactions

```typescript
const user = userEvent.setup();

await user.click(screen.getByRole('button', { name: /submit/i }));
await user.type(screen.getByLabelText(/email/i), 'test@example.com');
await user.keyboard('{Enter}');
await user.keyboard('{Shift>}A{/Shift}'); // Shift+A
await user.selectOptions(screen.getByLabelText(/country/i), 'USA');
await user.clear(screen.getByLabelText(/search/i));
```
