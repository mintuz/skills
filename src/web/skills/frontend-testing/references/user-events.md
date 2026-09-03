# User Event Simulation

**Always use `userEvent` over `fireEvent`** for realistic interactions.

## userEvent vs fireEvent

**Why userEvent is superior:**
- Dispatches the whole pointer, focus, and mouse event sequence a browser fires
  for the interaction, not one synthetic event
- Respects the order and the timing a browser uses
- Throws when the target has `pointer-events: none`, and suppresses the mouse
  activation events on a disabled control, so `click` never fires there and the
  test fails on an unreachable element instead of passing
- Catches bugs that a single synthetic event hides

```typescript
// ❌ WRONG - fireEvent (incomplete simulation)
fireEvent.change(input, { target: { value: 'test' } });
fireEvent.click(button);
```

```typescript
// ✅ CORRECT - userEvent (realistic simulation)
const user = userEvent.setup();
await user.type(input, 'test');
await user.click(button);
```

**Only use `fireEvent` when:**
- `userEvent` doesn't support the event (rare)
- Testing non-standard browser behavior

## userEvent.setup() Pattern

**Modern best practice (2025):**

```typescript
// ✅ CORRECT - Setup per test
it('should handle user input', async () => {
  const user = userEvent.setup(); // Fresh instance per test
  document.body.innerHTML = '<input aria-label="Email" />';

  await user.type(screen.getByLabelText(/email/i), 'test@example.com');
});
```

```typescript
// ❌ AVOID - Setup in beforeEach
let user;
beforeEach(() => {
  user = userEvent.setup();
});
```

**Why:** `setup()` binds to the current `document` and installs its clipboard and
pointer state when you call it. Calling it in the test body keeps that setup next
to the markup it drives, and makes per-test options such as
`userEvent.setup({ advanceTimers: vi.advanceTimersByTime })` obvious at the point
of use. Under fake timers, pass `advanceTimers`; do not disable the delay with
`delay: null`.

## Common Interactions

**Clicking:**
```typescript
const user = userEvent.setup();
await user.click(screen.getByRole('button', { name: /submit/i }));
```

**Typing:**
```typescript
await user.type(screen.getByLabelText(/email/i), 'test@example.com');
```

**Keyboard:**
```typescript
await user.keyboard('{Enter}'); // Press Enter
await user.keyboard('{Shift>}A{/Shift}'); // Shift+A
```

**Selecting options:**
```typescript
await user.selectOptions(
  screen.getByLabelText(/country/i),
  'USA'
);
```

**Clearing input:**
```typescript
await user.clear(screen.getByLabelText(/search/i));
```
