# Testing Library anti-patterns

`@testing-library/dom` exports no `render` function. Mount the markup yourself, then query it through `screen`, which is always bound to `document.body`. Only framework wrappers, such as `@testing-library/react`, export `render`.

Other references cover these mistakes; this file does not repeat them:

- `getBy*` to assert absence, and `getByTestId` where a role is available: [queries.md](queries.md).
- Side effects in `waitFor`, several unrelated assertions in one `waitFor`, and `findBy*` inside `waitFor`: [async-testing.md](async-testing.md).

## 1. Queries bound to a variable instead of `screen`

```typescript
// ❌
import { getQueriesForElement } from '@testing-library/dom';

document.body.innerHTML = '<button>Submit</button>';
const { getByRole } = getQueriesForElement(document.body);
const button = getByRole('button');

// ✅
import { screen } from '@testing-library/dom';

document.body.innerHTML = '<button>Submit</button>';
const button = screen.getByRole('button', { name: /submit/i });
```

`screen` needs no destructuring and gives better error messages. To scope a query to one region, use `within(element)`.

## 2. `querySelector` where an accessible query works

A CSS selector is an escape hatch. It is wrong only when a user-facing query reaches the same element. When no accessible route exists, follow "When no accessible query fits" in `SKILL.md`.

```typescript
// ❌
document.body.innerHTML = '<button class="submit-btn">Submit</button>';
const button = document.querySelector('.submit-btn');

// ✅
document.body.innerHTML = '<button>Submit</button>';
const button = screen.getByRole('button', { name: /submit/i });
```

## 3. Implementation details

```typescript
// ❌ Private implementation
const component = new Component();
expect(component._internalState).toBe('value');

// ✅ User-visible behaviour
document.body.innerHTML = '<p>value</p>';
expect(screen.getByText(/value/i)).toBeInTheDocument();
```

## 4. Property assertions where jest-dom matchers are registered

```typescript
// ❌
expect(button.disabled).toBe(true);
expect(element.classList.contains('active')).toBe(true);
expect(input.value).toBe('test');
expect(checkbox.checked).toBe(true);

// ✅
expect(button).toBeDisabled();
expect(element).toHaveClass('active');
expect(input).toHaveValue('test');
expect(checkbox).toBeChecked();
```

These matchers need jest-dom registered in the test setup. When the project does not register it, assert the element's own property, say that jest-dom would read better, and do not add it unasked.

## 5. Manual `cleanup()` calls

`@testing-library/dom` exports no `cleanup`. Framework wrappers export it and register it for you, but only when a global `afterEach` exists at import time. Under Vitest that means `globals: true`. When the project keeps globals off, call the wrapper's `cleanup` once, in an `afterEach` in the shared setup file. Never call it in a test file.

```typescript
// ❌ The wrapper's cleanup in a test file
afterEach(() => {
  cleanup(); // Belongs once in the setup file, or nowhere when globals are on
});

// ✅ Reset only the markup you mounted yourself
afterEach(() => {
  document.body.innerHTML = '';
});
```

jsdom keeps one document for the whole test file. Markup that you write into `document.body` yourself survives into the next test and makes queries ambiguous.

## 6. Element captured in `beforeEach`

The hook queries the element before the test arranges its own state, and the stale reference survives a re-render. A mount helper called in each test keeps setup beside the assertions that depend on it.

```typescript
// ❌
let button;
beforeEach(() => {
  document.body.innerHTML = '<button>Submit</button>';
  button = screen.getByRole('button', { name: /submit/i });
});

it('test 1', () => {
  // The element was queried before this test could arrange anything
});

// ✅
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

For React render factories, see `web:react-testing`.

## 7. Exact against flexible text matching

This is a choice, not an anti-pattern; both forms are supported.

- **Exact string.** Couples the test to the copy. Use it when the exact wording is part of the behaviour you assert: `screen.getByText('Welcome, John Doe')`.
- **Regex.** Tolerates wording, casing and interpolated values around the part that matters: `screen.getByText(/welcome.*john doe/i)`.

The default normalizer trims and collapses whitespace, so an exact string is not whitespace-fragile. An unanchored regex can match more than you intend; anchor it when the match must be precise.

## 8. ESLint plugins not in use

The plugins catch these anti-patterns automatically. When a project lacks them, recommend them. Install them only when asked:

```bash
npm install -D eslint-plugin-testing-library eslint-plugin-jest-dom
```

`.eslintrc.js`:

```javascript
{
  extends: [
    'plugin:testing-library/dom', // Framework-agnostic
    // OR 'plugin:testing-library/react' for React
    'plugin:jest-dom/recommended',
  ],
}
```
