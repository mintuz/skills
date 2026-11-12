# Testing Library anti-patterns

`@testing-library/dom` exports no `render`. Mount the markup yourself, then query it through `screen`, which is always bound to `document.body`. Only framework wrappers, such as `@testing-library/react`, export `render`.

Other references cover these mistakes:

- `getBy*` to assert absence, `getByTestId` where a role is available, and a CSS selector where an accessible query works: [queries.md](queries.md).
- Side effects in `waitFor`, unrelated assertions in one `waitFor`, and `findBy*` inside `waitFor`: [async-testing.md](async-testing.md).

## 1. Queries bound to a variable instead of `screen`

`screen` needs no destructuring and gives better error messages. To scope a query to one region, use `within(element)`.

```typescript
// ❌
const { getByRole } = getQueriesForElement(document.body);
const button = getByRole('button');

// ✅
const button = screen.getByRole('button', { name: /submit/i });
```

## 2. Implementation details

```typescript
// ❌ Private implementation
const component = new Component();
expect(component._internalState).toBe('value');

// ✅ User-visible behaviour
expect(screen.getByText(/value/i)).toBeInTheDocument();
```

## 3. Property assertions where jest-dom is registered

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

When the project does not register jest-dom, assert the element's own property and say that jest-dom would read better. Do not add it unasked.

## 4. Manual `cleanup()` calls

`@testing-library/dom` exports no `cleanup`. Framework wrappers export it and register it automatically, but only when a global `afterEach` exists at import time. Under Vitest, that needs `globals: true`. When the project keeps globals off, call the wrapper's `cleanup` once, in an `afterEach` in the shared setup file. Never call it in a test file.

jsdom keeps one document for the whole test file. Markup that you write into `document.body` yourself survives into the next test and makes queries ambiguous. Reset only that markup:

```typescript
afterEach(() => {
  document.body.innerHTML = '';
});
```

## 5. Element captured in `beforeEach`

The hook queries the element before the test arranges its own state, and the stale reference survives a re-render. Call a mount helper in each test instead. For React render factories, see `web:react-testing`.

```typescript
// ✅
const mountButton = () => {
  document.body.innerHTML = '<button>Submit</button>';
  return { button: screen.getByRole('button', { name: /submit/i }) };
};

it('test 1', () => {
  const { button } = mountButton(); // Fresh state
});
```

## 6. Exact against flexible text matching

Both forms are valid.

- **Exact string:** use it when the exact wording is part of the behaviour you assert: `screen.getByText('Welcome, John Doe')`. The default normalizer trims and collapses whitespace.
- **Regex:** tolerates wording, casing and interpolated values around the part that matters: `screen.getByText(/welcome.*john doe/i)`. An unanchored regex can match more than you intend; anchor it when the match must be precise.

## 7. ESLint plugins not in use

The plugins catch these anti-patterns. When a project lacks them, recommend them. Install them only when asked:

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
