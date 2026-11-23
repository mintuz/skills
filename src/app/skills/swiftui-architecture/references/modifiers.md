# Conditional Modifiers and `AnyShapeStyle`

## Avoid Conditional `.if` `@ViewBuilder` Extensions

Never write or use an `.if(condition) { view in ... }` `@ViewBuilder` view extension that branches with `if condition { transform(self) } else { self }`.

- Switching branches changes the view's structural identity, destroys `@State` in the view and its descendants, and replaces smooth animations with abrupt remove/insert transitions.
- **Review scoping rule:** When reviewing an existing codebase that already uses a conditional `.if` modifier, explain the identity, state-reset, and animation risks and show the ternary alternative, but do not remove or refactor untouched `.if` usages unprompted.

Prefer a ternary expression inside the modifier argument:

```swift
Text(label)
    .foregroundStyle(isHighlighted ? .red : .primary)
    .opacity(isVisible ? 1 : 0)
```

## Unifying Differing `ShapeStyle` Types with `AnyShapeStyle`

When a ternary's branches produce incompatible `ShapeStyle` types (for example `HierarchicalShapeStyle` `.primary` vs `TintShapeStyle` `.tint`, or `Color` `.yellow` vs `.tint`), do not duplicate the view in an `if`/`else` `@ViewBuilder` branch. Wrap each branch in `AnyShapeStyle(...)`:

```swift
Image(systemName: "star.fill")
    .foregroundStyle(isSelected ? AnyShapeStyle(.tint) : AnyShapeStyle(.primary))
```

- `AnyShapeStyle` is a lightweight, idiomatic value type (unlike `AnyView`, which erases view identity).
- **Do not over-flag:** `.foregroundStyle(isHighlighted ? .yellow : .primary)` and `.foregroundStyle(isOn ? .red : .blue)` already compile without `AnyShapeStyle`. Reach for `AnyShapeStyle` only when branch types genuinely do not unify.
