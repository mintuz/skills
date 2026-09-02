# Testing React Hooks

## Custom Hooks with renderHook

**Built into React Testing Library** (since v13):

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

**Pattern:**
- `result.current` - Current return value of hook
- `act()` - Wrap a state-changing callback that you invoke directly, because it runs outside Testing Library's auto-wrapped helpers
- `rerender()` - Re-run hook with new props

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

**`rerender` changes the arguments of the hook callback only.** It does not
change the props of the `wrapper`. Choose a hook whose return value derives from
the argument; a hook that only seeds `useState` keeps its first value after a
`rerender`. To change provider props, render a consumer component with
`render()` and use that render result's `rerender()`.
