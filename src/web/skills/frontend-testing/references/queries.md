# Query selection

## Priority order

Use the first query in this list that reaches the element:

1. **`getByRole`.** Matches the ARIA role and accessible name, as a screen reader does. It requires semantic markup.
2. **`getByLabelText`.** Form fields, found through their associated `<label>`.
3. **`getByPlaceholderText`.** An input with no label. A placeholder does not replace a label.
4. **`getByText`.** Content with no useful role: paragraphs, spans and plain `div` content that users read. When a role identifies the element, such as `heading`, `listitem` or `cell`, use `getByRole`.
5. **`getByDisplayValue`.** Current form values, such as pre-filled inputs.
6. **`getByAltText`.** Images.
7. **`getByTitle`.** SVG titles and `title` attributes, when no query above works.
8. **`getByTestId`.** Last resort, when no other query works. Users cannot see a test id.

## Query variants

Each query name combines a variant with a cardinality. The variants are `getBy*`, `queryBy*` and `findBy*`. Each has an all-elements form (`getAllBy*`, `queryAllBy*`, `findAllBy*`) that returns an array. All forms except `queryAllBy*` throw when nothing matches.

**`getBy*`** — the element must exist; throws when it is not found.

```typescript
const button = screen.getByRole('button', { name: /submit/i });
expect(button).toBeDisabled();
```

**`queryBy*`** — returns null when the element is not found. Use it to assert absence.

```typescript
// ✅ Absence
expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

// ❌ getBy throws, so it cannot express absence cleanly
expect(() => screen.getByRole('dialog')).toThrow();
```

**`findBy*`** — async; waits for the element to appear after an async operation.

```typescript
const message = await screen.findByText(/success/i);
```

## Common mistakes

**`container.querySelector` where a role query works.** A class name is a DOM implementation detail.

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

**Role query without an accessible name, for a role named by its content.** Several buttons can be on the page.

```typescript
// ❌
screen.getByRole('button');
// ✅
screen.getByRole('button', { name: /submit/i });
```

This applies to roles named by their content, such as `button`, `link`, `heading` and `option`. A `status`, `alert`, `region`, `dialog`, `navigation` or `form` takes its name only from `aria-label` or `aria-labelledby`. Without one, query it by role alone and assert its text (see "Accessible names come from the markup" in `SKILL.md`).

**`getBy*` to assert absence.**

```typescript
// ❌
expect(() => screen.getByText(/error/i)).toThrow();
// ✅
expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
```
