# User event simulation

## userEvent against fireEvent

Use `userEvent`, not `fireEvent`. `userEvent`:

- dispatches the whole pointer, focus and mouse event sequence that a browser fires for the interaction, not one synthetic event;
- follows browser order and timing;
- throws when the target has `pointer-events: none`, and suppresses mouse activation events on a disabled control, so `click` never fires there and the test fails on an unreachable element instead of passing;
- catches bugs that a single synthetic event hides.

```typescript
// ❌ fireEvent: incomplete simulation
fireEvent.change(input, { target: { value: 'test' } });
fireEvent.click(button);

// ✅ userEvent: realistic simulation
const user = userEvent.setup();
await user.type(input, 'test');
await user.click(button);
```

Use `fireEvent` only in these cases:

- `userEvent` does not support the event (rare);
- the test covers non-standard browser behaviour;
- the project does not have `@testing-library/user-event` installed. Then say that `user-event` would model the interaction more closely. Do not add it unasked.

## userEvent.setup() pattern

Call `userEvent.setup()` in the test body, not in `beforeEach`.

```typescript
// ✅ One instance per test
it('accepts user input', async () => {
  const user = userEvent.setup();
  document.body.innerHTML = '<input aria-label="Email" />';

  await user.type(screen.getByLabelText(/email/i), 'test@example.com');
});

// ❌ Instance created in beforeEach
let user;
beforeEach(() => {
  user = userEvent.setup();
});
```

`setup()` binds to the current `document` and installs its clipboard and pointer state when it is called. A call in the test body keeps that setup next to the markup it drives, and shows per-test options such as `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })` at the point of use. Under fake timers, pass `advanceTimers`; do not disable the delay with `delay: null`.

## Common interactions

```typescript
const user = userEvent.setup();

// Click
await user.click(screen.getByRole('button', { name: /submit/i }));

// Type
await user.type(screen.getByLabelText(/email/i), 'test@example.com');

// Keyboard
await user.keyboard('{Enter}'); // Enter
await user.keyboard('{Shift>}A{/Shift}'); // Shift+A

// Select an option
await user.selectOptions(screen.getByLabelText(/country/i), 'USA');

// Clear an input
await user.clear(screen.getByLabelText(/search/i));
```
