# React-Specific Anti-Patterns

## 1. Unnecessary act() wrapping

❌ **WRONG - Manual act() everywhere**
```tsx
act(() => {
  render(<MyComponent />);
});

await act(async () => {
  await user.click(button);
});
```

✅ **CORRECT - RTL handles it**
```tsx
render(<MyComponent />);
await user.click(button);
```

RTL wraps `render()`, `userEvent` methods, `fireEvent`, `waitFor` and `findBy*` in `act()`. Use a manual `act()` only around a state-changing hook callback that the test calls directly, such as one returned by `renderHook`, and around a direct state mutation, which is rare and usually bad practice.

## 2. Manual cleanup() calls

❌ **WRONG - Manual cleanup**
```tsx
afterEach(() => {
  cleanup(); // Automatic since RTL 9!
});
```

✅ **CORRECT - No cleanup needed**
```tsx
// Cleanup happens automatically after each test
```

RTL registers that cleanup only when the runner exposes a global `afterEach`. In Vitest set `globals: true`, or register `afterEach(cleanup)` once in a shared setup file, not in every test file. When the project keeps globals off on purpose, use the setup file and leave the setting alone:

```ts
// src/test/setup.ts, named in vitest.config.ts under test.setupFiles
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

## 3. beforeEach render pattern

❌ **WRONG - Shared render in beforeEach**
```tsx
let button;
beforeEach(() => {
  render(<MyComponent />);
  button = screen.getByRole('button'); // Shared state across tests
});

it('test 1', () => {
  // Uses shared button from beforeEach
});
```

✅ **CORRECT - Factory function per test**
```tsx
const renderComponent = () => {
  render(<MyComponent />);
  return {
    button: screen.getByRole('button'),
  };
};

it('test 1', () => {
  const { button } = renderComponent(); // Fresh state
});
```

The factory returns what each test needs, so no test reads state another test left behind.

## 4. Testing component internals

❌ **WRONG - Accessing component internals**
```tsx
const wrapper = shallow(<MyComponent />);
expect(wrapper.state('isOpen')).toBe(true); // Internal state
expect(wrapper.instance().handleClick).toBeDefined(); // Internal method
```

✅ **CORRECT - Test rendered output**
```tsx
render(<MyComponent />);
expect(screen.getByRole('dialog')).toBeInTheDocument(); // What user sees
```

❌ **WRONG - Querying the DOM structure**
```tsx
const { container } = render(<LoginForm />);
const input = container.querySelector('input[name="email"]');
```

✅ **CORRECT - Query by accessible name, interact like a user**
```tsx
const user = userEvent.setup();
render(<LoginForm />);
await user.type(screen.getByLabelText('Email'), 'test@example.com');
```

## 5. Shallow rendering

❌ **WRONG - Shallow rendering**
```tsx
const wrapper = shallow(<MyComponent />);
// Child components not rendered - incomplete test
```

✅ **CORRECT - Full rendering**
```tsx
render(<MyComponent />);
// Full component tree rendered - realistic test
```

**Why:** shallow rendering hides integration bugs between parent and child components.
