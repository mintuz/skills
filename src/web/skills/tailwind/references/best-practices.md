# Best practices

For literal class names, variants, focus indicators and refs, follow [SKILL.md](../SKILL.md). For CSS-variable theming, see [setup.md](setup.md).

## Semantic colours

Name colours by purpose, not appearance:

```typescript
// Correct: semantic token
<Text className="text-destructive">Error message</Text>
<div className="bg-primary text-primary-foreground">

// Incorrect: appearance-based colour
<Text className="text-red-500">Error message</Text>
<div className="bg-blue-500 text-white">
```

## Dark mode

Use tokens that adapt to the theme. Test both themes during development.

```typescript
// Incorrect: works only in light mode
<div className="bg-white text-black">

// Correct: adapts to the theme
<div className="bg-background text-foreground">
```

## Accessible names

Use the native element first. A `<button>`, an `<a href>`, or an `<input>` with a `<label>` already has its role, keyboard behaviour and accessible name. Add ARIA only when native semantics cannot express the need, such as an icon-only button with no visible text:

```typescript
<button
  aria-label="Close dialog"
  className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
>
  <XIcon aria-hidden="true" />
</button>
```

## Arbitrary values

Do not use arbitrary values often. Extend the theme instead.

```typescript
// Incorrect
<div className="w-[347px]">

// Correct in Tailwind 3: extend the theme in tailwind.config.*
theme: {
  extend: {
    width: { sidebar: '347px' }
  }
}
<div className="w-sidebar">
```

```css
/* Correct in Tailwind 4: declare the token in the namespace that owns the
   utility. Sizing utilities such as w-*, p-* and gap-* come from --spacing-*. */
@theme {
  --spacing-sidebar: 347px;
}
```

## `@apply`

Do not nest `@apply`. Put the utilities in the markup:

```css
/* Incorrect */
.button {
  @apply px-4 py-2;
  @apply rounded-md;
}

/* Correct */
<button className="px-4 py-2 rounded-md">
```

## Responsive design

Write mobile-first. The unprefixed class is the mobile default. Add larger breakpoints after it:

```typescript
<div className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
```

## Animation performance

Animate `transform` and `opacity`. Avoid transitions that change layout.

```typescript
// Correct: compositor-only
<div className="transition-transform hover:scale-105">

// Avoid: causes reflow
<div className="transition-all hover:w-full">
```
