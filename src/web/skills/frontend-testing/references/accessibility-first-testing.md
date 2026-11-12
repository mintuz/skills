# Accessibility-first testing

## Accessible queries

Accessible queries find elements as a screen reader does. A refactor does not break them, because they couple the test to the user experience.

```typescript
// ❌ Implementation detail
screen.getByTestId('user-menu');
// ✅
screen.getByRole('button', { name: /user menu/i });
```

When an accessible query fails, first check the markup for an accessibility issue. For markup you do not own, such as a third-party widget, follow "When no accessible query fits" in `SKILL.md`.

## Semantic HTML before ARIA

Prefer semantic HTML. It gives keyboard navigation, focus management and screen reader support with less code.

```html
<!-- ❌ -->
<div role="button" onclick="handleClick()" tabindex="0">Submit</div>
<!-- ✅ -->
<button onclick="handleClick()">Submit</button>
```

Do not restate a role that the element already has:

```html
<!-- ❌ -->
<button role="button">Submit</button>
```

Add ARIA to a custom component only when no semantic element fits:

```html
<div role="dialog" aria-label="Confirmation Dialog">
  <h2>Are you sure?</h2>
</div>
```

Add ARIA state to semantic HTML. A role is intrinsic; state is not.

```html
<button aria-expanded="false" aria-controls="filters">Filters</button>
<button aria-pressed="true">Bold</button>
```
