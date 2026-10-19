# Accessibility-First Testing

## Why Accessible Queries

1. **Tests mirror real usage** - query like screen readers do.
2. **Improves app accessibility** - tests force accessible markup.
3. **Refactor-friendly** - coupled to user experience, not implementation.

```typescript
// ❌ WRONG - Implementation detail
screen.getByTestId('user-menu');

// ✅ CORRECT - Accessibility query
screen.getByRole('button', { name: /user menu/i });
```

When an accessible query fails, check your markup first for an accessibility issue. Some elements you do not own, such as a third-party widget, expose no accessible route; "When No Accessible Query Fits" in the main skill file gives the fallback.

## ARIA Attributes

✅ **Add ARIA to custom components** where semantic HTML is unavailable:
```html
<div role="dialog" aria-label="Confirmation Dialog">
  <h2>Are you sure?</h2>
  ...
</div>
```

❌ **Do not restate a role semantic HTML already has:**
```html
<!-- ❌ WRONG - Redundant role -->
<button role="button">Submit</button>

<!-- ✅ CORRECT - Semantic HTML is enough -->
<button>Submit</button>
```

✅ **Add ARIA state to semantic HTML.** A role is intrinsic; state is not.
```html
<button aria-expanded="false" aria-controls="filters">Filters</button>
<button aria-pressed="true">Bold</button>
```

## Semantic HTML Priority

Prefer semantic HTML over ARIA. It gives built-in keyboard navigation, focus management, and screen reader support with less code.

```html
<!-- ❌ WRONG - Custom element + ARIA -->
<div role="button" onclick="handleClick()" tabindex="0">
  Submit
</div>

<!-- ✅ CORRECT - Semantic HTML -->
<button onclick="handleClick()">
  Submit
</button>
```
