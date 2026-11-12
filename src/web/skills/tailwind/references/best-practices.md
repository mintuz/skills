# Best practices

## Theming with CSS variables

Use CSS variables so that a theme changes at run time without a rebuild.

Tailwind 3, in `tailwind.config.*`:

```typescript
colors: {
  primary: "hsl(var(--primary))",
}
```

Tailwind 4, in CSS:

```css
@theme inline {
  --color-primary: var(--app-primary);
}
```

## Variants

Compose variants with a literal map or CVA, as [Component variants](../SKILL.md#component-variants) selects:

```typescript
const buttonVariants = cva("base-styles", {
  variants: { size: { sm: "...", lg: "..." } }
})
```

Order the class layers as: base styles, variants, sizes, states, overrides.

## Semantic colours

Name colours by purpose, not appearance. Use the semantic token that the project defines for the purpose. Use the built-in palette only for a purpose that no project token covers.

```typescript
// Correct: semantic token
<Button variant="primary">Submit</Button>
<Text className="text-destructive">Error message</Text>
<div className="bg-primary text-primary-foreground">

// Incorrect: appearance-based colour
<Button className="bg-blue-500">Submit</Button>
<Text className="text-red-500">Error message</Text>
<div className="bg-blue-500 text-white">
```

## Dark mode

Use tokens that adapt to the theme, and test both themes during development.

```typescript
// Incorrect: works only in light mode
<div className="bg-white text-black">

// Correct: adapts to the theme
<div className="bg-background text-foreground">
```

## Refs

In React 19, `ref` is a regular prop. Do not add `forwardRef` or `displayName`:

```typescript
function Button(props: ComponentPropsWithRef<'button'>) {
  return <button {...props} />
}
```

On React 18 or earlier, wrap the component in `forwardRef`.

## Accessibility

Use the native element first. A `<button>`, an `<a href>`, or an `<input>` with a `<label>` already has its role, keyboard behaviour and accessible name. Add ARIA only when native semantics cannot express the need, such as an icon-only button with no visible text.

Give every interactive element a visible focus state, drawn as an outline so that forced-colours mode keeps it (see [Focus indicators](../SKILL.md#focus-indicators)). In Tailwind 4, `outline-none` also stops a later `outline-<width>` from drawing.

```typescript
// Visible text names the button: no ARIA needed
<button className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">Save</button>

// Icon-only button: no visible text, so name it with aria-label
<button
  aria-label="Close dialog"
  className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
>
  <XIcon aria-hidden="true" />
</button>

// Incorrect: no focus state
<button className="outline-none">

// Incorrect in Tailwind 4: the outline style is none, so the width draws nothing
<button className="outline-none focus-visible:outline-2">
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

## Dynamic class names

Do not build class names dynamically (see [Literal class names](../SKILL.md#literal-class-names)):

```typescript
// Incorrect: Tailwind never generates `bg-emerald-600`
<button className={`bg-${color}-600`}>

// Correct: the full name is literal in the source
const tone = { success: 'bg-emerald-600', warning: 'bg-amber-600' } as const
<button className={tone[t]}>
```

## Responsive design

Write mobile-first: the unprefixed class is the mobile default, then add larger breakpoints.

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
