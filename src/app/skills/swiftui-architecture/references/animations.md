# Custom SwiftUI Animations

## Prefer the `@Animatable` Macro

Annotate custom `View` or `Shape` types with `@Animatable` instead of hand-writing `animatableData`.

```swift
@Animatable
struct ProgressArc: Shape {
    var progress: Double
    @AnimatableIgnored var lineWidth: CGFloat

    func path(in rect: CGRect) -> Path { /* ... */ }
}
```

When a stored property's type is not animatable (for example `Bool`), the compiler emits:

> `"Cannot automatically synthesize 'animatableData'. Mark this property with '@AnimatableIgnored'. Conform the type of this property to 'Animatable' or 'VectorArithmetic'."`

Fix by marking non-animated properties `@AnimatableIgnored` or conforming the property type to `Animatable` / `VectorArithmetic`.

## Manual `animatableData` for Custom Setter Logic

Implement `animatableData` manually when interpolation needs logic that is not 1:1 with stored properties (normalisation, clamping, modulo wrapping such as `phase.truncatingRemainder(dividingBy: 2 * .pi)`, or derived properties):

- **Deployment target `>= 26.0`:** Use `AnimatableValues<...>` and read members via `newValue.value.0`, `newValue.value.1`, etc.
- **Earlier deployment targets:** Use `AnimatablePair<..., ...>` and read members via `newValue.first` and `newValue.second`.
