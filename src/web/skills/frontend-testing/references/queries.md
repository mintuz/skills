# Query Selection

## Priority Order

Use queries in this order (accessibility-first):

1. **`getByRole`** - highest priority. Matches ARIA role + accessible name, mirrors the screen reader experience, forces semantic HTML.
2. **`getByLabelText`** - form fields. Finds inputs by their associated `<label>`; ensures accessible forms.
3. **`getByPlaceholderText`** - input fallback, only when no label is present. A placeholder shouldn't replace a label.
4. **`getByText`** - content with no useful role: paragraphs, spans, and plain `div` content users read. Use `getByRole` instead when a role identifies the element, such as `heading`, `listitem`, or `cell`.
5. **`getByDisplayValue`** - current form values, such as pre-filled inputs.
6. **`getByAltText`** - images; ensures accessible images.
7. **`getByTitle`** - SVG titles, `title` attributes. Rare, when other queries are unavailable.
8. **`getByTestId`** - last resort, when no other query works. Not user-facing.

## Query Variants

Every query name combines a variant with a cardinality. The variants are `getBy*`, `queryBy*`, and `findBy*`. Each has an all-elements form (`getAllBy*`, `queryAllBy*`, `findAllBy*`) that returns an array and, except for `queryAllBy*`, throws when nothing matches.

**`getBy*`** - element must exist (throws if not found)
```typescript
// ✅ Use when asserting element EXISTS
const button = screen.getByRole('button', { name: /submit/i });
expect(button).toBeDisabled();
```

**`queryBy*`** - returns null if not found
```typescript
// ✅ Use when asserting element DOESN'T exist
expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

// ❌ WRONG - getBy throws, can't assert non-existence
expect(() => screen.getByRole('dialog')).toThrow(); // Ugly!
```

**`findBy*`** - async, waits for the element to appear
```typescript
// ✅ Use when element appears after async operation
const message = await screen.findByText(/success/i);
```

## Common Mistakes

❌ **`container.querySelector` where a role query works**
```typescript
const button = container.querySelector('.submit-button'); // DOM implementation detail
```

✅ **Query by accessible role**
```typescript
const button = screen.getByRole('button', { name: /submit/i }); // User-facing
```

---

❌ **`getByTestId` when a role is available**
```typescript
screen.getByTestId('submit-button'); // Not how users find button
```

✅ **Query by role**
```typescript
screen.getByRole('button', { name: /submit/i }); // How screen readers find it
```

---

❌ **Role query without an accessible name**
```typescript
screen.getByRole('button'); // Which button? Multiple on page!
```

✅ **Specify the accessible name**
```typescript
screen.getByRole('button', { name: /submit/i }); // Specific button
```

---

❌ **`getBy` to assert non-existence**
```typescript
expect(() => screen.getByText(/error/i)).toThrow(); // Awkward
```

✅ **Use `queryBy`**
```typescript
expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
```
