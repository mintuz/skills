# React-Specific Anti-Patterns

## 1. Unnecessary act() wrapping

❌ **WRONG**
```tsx
act(() => {
  render(<MyComponent />);
});

await act(async () => {
  await user.click(button);
});
```

✅ **CORRECT**
```tsx
render(<MyComponent />);
await user.click(button);
```

RTL wraps `render()`, `userEvent` methods, `fireEvent`, `waitFor` and `findBy*` in `act()`. Use a manual `act()` only in two cases:

- Around a state-changing hook callback that the test calls directly, such as one returned by `renderHook`.
- Around a direct state mutation. This is rare and usually bad practice.

## 2. Manual cleanup() calls

❌ **WRONG**
```tsx
afterEach(() => {
  cleanup();
});
```

✅ **CORRECT:** remove the call. RTL cleans up automatically since RTL 9.

RTL registers that cleanup only when the runner exposes a global `afterEach`. In Vitest, set `globals: true`, or register `afterEach(cleanup)` once in a shared setup file, not in every test file. When the project keeps globals off on purpose, use the setup file and leave the setting alone:

```ts
// src/test/setup.ts, named in vitest.config.ts under test.setupFiles
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

## 3. beforeEach render pattern

❌ **WRONG:** shared state across tests.
```tsx
let button;
beforeEach(() => {
  render(<MyComponent />);
  button = screen.getByRole('button');
});
```

✅ **CORRECT:** a factory function that each test calls for fresh state.
```tsx
const renderComponent = () => {
  render(<MyComponent />);
  return { button: screen.getByRole('button') };
};

it('test 1', () => {
  const { button } = renderComponent();
});
```

## 4. Internals and shallow rendering

❌ **WRONG:** internal state and methods. `shallow` also skips child components, so it hides bugs between parent and child.
```tsx
const wrapper = shallow(<MyComponent />);
expect(wrapper.state('isOpen')).toBe(true);
expect(wrapper.instance().handleClick).toBeDefined();
```

✅ **CORRECT:** full rendering and the output the user sees.
```tsx
render(<MyComponent />);
expect(screen.getByRole('dialog')).toBeInTheDocument();
```

❌ **WRONG:** a DOM structure query.
```tsx
const { container } = render(<LoginForm />);
const input = container.querySelector('input[name="email"]');
```

✅ **CORRECT:** an accessible-name query and a user interaction.
```tsx
const user = userEvent.setup();
render(<LoginForm />);
await user.type(screen.getByLabelText('Email'), 'test@example.com');
```
