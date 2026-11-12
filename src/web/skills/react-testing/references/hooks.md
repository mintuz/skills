# Testing React Hooks

## renderHook

`renderHook` is part of React Testing Library since v13.

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

- `result.current` holds the current return value of the hook.
- `act()` wraps a state-changing callback that the test calls directly, because that call runs outside the auto-wrapped helpers.
- `rerender()` runs the hook again with new props.

## Hook arguments

```tsx
it('should format the current amount', () => {
  const { result, rerender } = renderHook(
    ({ amount }) => useFormattedPrice(amount),
    { initialProps: { amount: 10 } }
  );

  expect(result.current).toBe('£10.00');

  rerender({ amount: 20 });
  expect(result.current).toBe('£20.00');
});
```

`rerender` changes the arguments of the hook callback only (see "Hooks and context" in `SKILL.md`). Use a hook whose return value derives from the argument. A hook that only seeds `useState` keeps its first value after a `rerender`.
