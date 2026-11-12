# Query selection

## Priority order

Use the first query in this list that reaches the element:

1. **`getByRole`:** ARIA role and accessible name, as a screen reader finds them. Needs semantic markup.
2. **`getByLabelText`:** a form field, through its associated `<label>`.
3. **`getByPlaceholderText`:** an input with no label. A placeholder does not replace a label.
4. **`getByText`:** content with no useful role, such as paragraphs, spans and plain `div` text. When a role identifies the element, such as `heading`, `listitem` or `cell`, use `getByRole`.
5. **`getByDisplayValue`:** a current form value, such as a pre-filled input.
6. **`getByAltText`:** an image.
7. **`getByTitle`:** an SVG title or a `title` attribute.
8. **`getByTestId`:** last resort. Users cannot see a test id.

## Query variants

Each query name combines a variant with a cardinality. The variants are `getBy*`, `queryBy*` and `findBy*`. Each has an all-elements form (`getAllBy*`, `queryAllBy*`, `findAllBy*`) that returns an array. All forms except `queryAllBy*` throw when nothing matches.

- **`getBy*`:** the element must exist; throws when not found.
- **`queryBy*`:** returns null when not found. Use it to assert absence.
- **`findBy*`:** async; waits for the element to appear.

```typescript
expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();
const message = await screen.findByText(/success/i);

// ✅ Absence
expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
// ❌ getBy throws, so it cannot express absence cleanly
expect(() => screen.getByRole('dialog')).toThrow();
```

## Common mistakes

**CSS selector where an accessible query works.** A class name is an implementation detail. A selector is wrong only when a user-facing query reaches the same element; otherwise follow "When no accessible query fits" in `SKILL.md`.

```typescript
// ❌
const button = container.querySelector('.submit-button');
// ✅
const button = screen.getByRole('button', { name: /submit/i });
```

**`getByTestId` where a role is available.**

```typescript
// ❌
screen.getByTestId('submit-button');
// ✅
screen.getByRole('button', { name: /submit/i });
```

**No accessible name on a role named by its content.** Several buttons can be on the page, so add `{ name }` to a `button`, `link`, `heading` or `option` query. A `status`, `alert`, `region`, `dialog`, `navigation` or `form` takes its name only from `aria-label` or `aria-labelledby`; see "Accessible names come from the markup" in `SKILL.md`.

```typescript
// ❌
screen.getByRole('button');
// ✅
screen.getByRole('button', { name: /submit/i });
```
