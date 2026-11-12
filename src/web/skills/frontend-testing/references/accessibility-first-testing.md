# Accessibility-first testing

## Accessible queries

Accessible queries find elements as a screen reader does. They push the markup towards accessibility, and they couple the test to the user experience, not to the implementation, so a refactor does not break them.

```typescript
// ❌ Implementation detail
screen.getByTestId('user-menu');

// ✅ Accessible query
screen.getByRole('button', { name: /user menu/i });
```

When an accessible query fails, first check the markup for an accessibility issue. Some elements you do not own, such as a third-party widget, expose no accessible route; "When no accessible query fits" in `SKILL.md` gives the fallback.

## ARIA attributes

Add ARIA to a custom component when no semantic HTML element fits:

```html
<div role="dialog" aria-label="Confirmation Dialog">
  <h2>Are you sure?</h2>
  ...
</div>
```

Do not restate a role that semantic HTML already has:

```html
<!-- ❌ Redundant role -->
<button role="button">Submit</button>

<!-- ✅ Semantic HTML is enough -->
<button>Submit</button>
```

Add ARIA state to semantic HTML. A role is intrinsic; state is not.

```html
<button aria-expanded="false" aria-controls="filters">Filters</button>
<button aria-pressed="true">Bold</button>
```

## Semantic HTML first

Prefer semantic HTML to ARIA. It gives keyboard navigation, focus management and screen reader support with less code.

```html
<!-- ❌ Custom element and ARIA -->
<div role="button" onclick="handleClick()" tabindex="0">
  Submit
</div>

<!-- ✅ Semantic HTML -->
<button onclick="handleClick()">
  Submit
</button>
```
