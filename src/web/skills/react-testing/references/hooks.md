# Testing React Hooks

## Custom Hooks with renderHook

Built into React Testing Library since v13:

```tsx
import { act, renderHook } from '@testing-library/react';

it('should toggle value', () => {
  const { result } = renderHook(() => useToggle(false));

  expect(result.current.value).toBe(false);

  act(() => {
    result.current.toggle();
  });

  expect(result.current.value).toBe(true);
});
```

- `result.current` - current return value of the hook
- `act()` - wraps a state-changing callback you invoke directly, because it runs outside Testing Library's auto-wrapped helpers
- `rerender()` - re-runs the hook with new props

## Hooks with Props

```tsx
it('should format the current amount', () => {
  const { result, rerender } = renderHook(
    ({ amount }) => useFormattedPrice(amount),
    { initialProps: { amount: 10 } }
  );

  expect(result.current).toBe('£10.00');

  // Re-run the hook with a new argument
  rerender({ amount: 20 });
  expect(result.current).toBe('£20.00');
});
```

`rerender` changes the hook callback's arguments only (see "Hooks and Context" in the main skill file). Choose a hook whose return value derives from the argument; a hook that only seeds `useState` keeps its first value after a `rerender`.
