# Testing Library Anti-Patterns

`@testing-library/dom` exports no `render` function. Mount the markup yourself,
then query it through `screen`, which is always bound to `document.body`. Only
framework wrappers, such as `@testing-library/react`, export `render`.

## 1. Not using `screen` object

❌ **WRONG - Hold bound queries in local variables**
```typescript
import { getQueriesForElement } from '@testing-library/dom';

document.body.innerHTML = '<button>Submit</button>';
const { getByRole } = getQueriesForElement(document.body);
const button = getByRole('button');
```

✅ **CORRECT - Use screen**
```typescript
import { screen } from '@testing-library/dom';

document.body.innerHTML = '<button>Submit</button>';
const button = screen.getByRole('button', { name: /submit/i });
```

**Why:** `screen` needs no destructuring and gives better error messages. Use
`within(element)` when you must scope a query to one region.

---

## 2. Using querySelector instead of an available accessible query

A CSS selector is an escape hatch, not a first choice. It is wrong only when a
user-facing query would reach the same element. See "When No Accessible Query
Fits" in the main skill file for the case where no accessible route exists.

❌ **WRONG - Selector where a role query works**
```typescript
document.body.innerHTML = '<button class="submit-btn">Submit</button>';
const button = document.querySelector('.submit-btn');
```

✅ **CORRECT - Accessible query**
```typescript
document.body.innerHTML = '<button>Submit</button>';
const button = screen.getByRole('button', { name: /submit/i });
```

---

## 3. Testing implementation details

❌ **WRONG - Internal state**
```typescript
const component = new Component();
expect(component._internalState).toBe('value'); // Private implementation
```

✅ **CORRECT - User-visible behavior**
```typescript
document.body.innerHTML = '<p>value</p>';
expect(screen.getByText(/value/i)).toBeInTheDocument();
```

---

## 4. Not using jest-dom matchers

❌ **WRONG - Manual assertions**
```typescript
expect(button.disabled).toBe(true);
expect(element.classList.contains('active')).toBe(true);
```

✅ **CORRECT - jest-dom matchers**
```typescript
expect(button).toBeDisabled();
expect(element).toHaveClass('active');
```

**Install:** `npm install -D @testing-library/jest-dom`

---

## 5. Manual cleanup() calls

`@testing-library/dom` exports no `cleanup`. Framework wrappers export it and
register it for you, but only when a global `afterEach` exists at import time.
Under Vitest that means `globals: true`, or an explicit `cleanup` call in your
own `afterEach`.

❌ **WRONG - Call the wrapper's cleanup by hand**
```typescript
afterEach(() => {
  cleanup(); // The framework wrapper already registered this
});
```

✅ **CORRECT - Reset only the markup you mounted yourself**
```typescript
afterEach(() => {
  document.body.innerHTML = '';
});
```

**Why:** jsdom keeps one document for the whole test file. Markup you write into
`document.body` yourself survives into the next test and makes queries ambiguous.

---

## 6. Wrong assertion methods

❌ **WRONG - Property access**
```typescript
expect(input.value).toBe('test');
expect(checkbox.checked).toBe(true);
```

✅ **CORRECT - jest-dom matchers**
```typescript
expect(input).toHaveValue('test');
expect(checkbox).toBeChecked();
```

---

## 7. beforeEach mount pattern

❌ **AVOID - Element captured in beforeEach**
```typescript
let button;
beforeEach(() => {
  document.body.innerHTML = '<button>Submit</button>';
  button = screen.getByRole('button', { name: /submit/i });
});

it('test 1', () => {
  // The element was queried before this test could arrange anything
});
```

**Why:** the hook queries the element before the test arranges its own state, and
the stale reference survives any re-render. The mount helper below keeps setup
beside the assertions that depend on it.

✅ **CORRECT - Mount helper called per test**
```typescript
const mountButton = () => {
  document.body.innerHTML = '<button>Submit</button>';
  return {
    button: screen.getByRole('button', { name: /submit/i }),
  };
};

it('test 1', () => {
  const { button } = mountButton(); // Fresh state
});
```

For framework mount helpers, see the `react-testing` skill.

---

## 8. Several unrelated assertions in one waitFor

`waitFor` reruns the whole callback whenever any assertion throws, so every
assertion does retry. The cost is diagnosis: the failure names only the first
assertion that threw. Split unrelated assertions. Keep them together when the
combined state is the condition you are waiting for.

❌ **AVOID - Several unrelated assertions**
```typescript
await waitFor(() => {
  expect(screen.getByText(/name/i)).toBeInTheDocument();
  expect(screen.getByText(/email/i)).toBeInTheDocument();
});
```

✅ **CORRECT - Await each condition on its own**
```typescript
await screen.findByText(/name/i);
await screen.findByText(/email/i);
```

Do not follow one `waitFor` with a plain `getBy*` for the second element. That
`getBy*` runs once and fails when the second element arrives later.

---

## 9. Side effects in waitFor

❌ **WRONG - Interaction in callback**
```typescript
await waitFor(async () => {
  await user.click(button); // waitFor retries, so this clicks many times!
  expect(submitOrder).toHaveBeenCalledTimes(1);
});
```

✅ **CORRECT - Interact once, then wait**
```typescript
await user.click(button);
await waitFor(() => {
  expect(submitOrder).toHaveBeenCalledTimes(1);
});
```

---

## 10. Choosing between exact and flexible matching

This is a choice, not an anti-pattern. Both forms are supported.

**Exact string** - couples the test to the copy. Correct when the exact wording
is part of the behaviour you are asserting.
```typescript
screen.getByText('Welcome, John Doe');
```

**Regex** - tolerates wording, casing, and interpolated values around the part
that matters.
```typescript
screen.getByText(/welcome.*john doe/i);
```

**Two notes:** the default normalizer already trims and collapses whitespace, so
an exact string is not whitespace-fragile. An unanchored regex can match more
than you intend, so anchor it when the match must be precise.

---

## 11. Wrong query variant for assertion

❌ **WRONG - getBy for non-existence**
```typescript
expect(() => screen.getByText(/error/i)).toThrow();
```

✅ **CORRECT - queryBy**
```typescript
expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
```

---

## 12. Wrapping findBy in waitFor

❌ **WRONG - Redundant**
```typescript
await waitFor(() => screen.findByText(/success/i));
```

✅ **CORRECT - findBy already waits**
```typescript
await screen.findByText(/success/i);
```

---

## 13. Using testId when role available

❌ **WRONG - testId**
```typescript
screen.getByTestId('submit-button');
```

✅ **CORRECT - Role**
```typescript
screen.getByRole('button', { name: /submit/i });
```

---

## 14. Not installing ESLint plugins

**Install these plugins:**
```bash
npm install -D eslint-plugin-testing-library eslint-plugin-jest-dom
```

**.eslintrc.js:**
```javascript
{
  extends: [
    'plugin:testing-library/dom', // For framework-agnostic
    // OR 'plugin:testing-library/react' for React
    'plugin:jest-dom/recommended',
  ],
}
```

**Catches anti-patterns automatically.**
