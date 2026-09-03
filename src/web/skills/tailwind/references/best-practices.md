# Best Practices

Guidelines for building maintainable Tailwind CSS design systems.

## Do's ✓

### Use CSS Variables for Theming
Enable runtime theme changes without rebuilding.

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

### Compose Variants with a Literal Map or CVA
Give each variant a complete literal class string, never an interpolated one.
Use CVA when the project already installs `class-variance-authority`, or when
the requester asks for CVA and accepts the dependency. Otherwise use an
exhaustive `Record<Variant, string>` map.
```typescript
const buttonVariants = cva("base-styles", {
  variants: { size: { sm: "...", lg: "..." } }
})
```

### Use Semantic Colors
Name by purpose, not appearance:
```typescript
// Good: semantic naming
<Button variant="primary">Submit</Button>
<Text className="text-destructive">Error message</Text>

// Bad: color-based naming
<Button className="bg-blue-500">Submit</Button>
<Text className="text-red-500">Error message</Text>
```

### Forward Refs
Enable component composition:
```typescript
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => <button ref={ref} {...props} />
)
```

### Include Accessibility
Always add ARIA attributes and focus states:
```typescript
<button
  aria-label="Close dialog"
  className="focus-visible:ring-2"
>
```

## Don'ts ✗

### Don't Use Arbitrary Values Frequently
Extend the theme instead:
```typescript
// Bad
<div className="w-[347px]">

// Good - Tailwind 3, extend the theme in tailwind.config.*
theme: {
  extend: {
    width: { sidebar: '347px' }
  }
}
<div className="w-sidebar">
```
```css
/* Good - Tailwind 4, declare the token in the namespace that owns the
   utility. Sizing utilities such as w-*, p-* and gap-* come from --spacing-*. */
@theme {
  --spacing-sidebar: 347px;
}
```

### Don't Nest @apply
Hurts readability and defeats Tailwind's purpose:
```css
/* Bad */
.button {
  @apply px-4 py-2;
  @apply rounded-md;
}

/* Good - use utilities directly in JSX */
<button className="px-4 py-2 rounded-md">
```

### Don't Build Class Names Dynamically
Tailwind scans source as plain text and never generates an interpolated name:
```typescript
// Bad - `bg-emerald-600` is never generated
<button className={`bg-${color}-600`}>

// Good - the full name is literal in the source
const tone = { success: 'bg-emerald-600', warning: 'bg-amber-600' } as const
<button className={tone[t]}>
```

### Don't Skip Focus States
Keyboard navigation requires visible focus:
```typescript
// Bad
<button className="outline-none">

// Good
<button className="focus-visible:ring-2 focus-visible:ring-ring">
```

### Don't Hardcode Colors
Use semantic tokens from theme:
```typescript
// Bad
<div className="bg-blue-500 text-white">

// Good
<div className="bg-primary text-primary-foreground">
```

### Don't Forget Dark Mode
Test both themes during development:
```typescript
// Bad - only works in light mode
<div className="bg-white text-black">

// Good - adapts to theme
<div className="bg-background text-foreground">
```

## Additional Guidelines

### Component Organization
```
Base styles → Variants → Sizes → States → Overrides
```

### Responsive Design
Mobile-first approach:
```typescript
// Mobile default, then tablet, then desktop
<div className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
```

### Animation Performance
Prefer transform and opacity:
```typescript
// Good - GPU accelerated
<div className="transition-transform hover:scale-105">

// Avoid - causes reflow
<div className="transition-all hover:w-full">
```
