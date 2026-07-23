# Animation

Use the installed Tailwind utilities first. Classes such as `animate-in`, `fade-in`, and `slide-in-from-*` belong to animation plugins rather than Tailwind core; use them only when the repository already configures the matching plugin or adoption is explicitly in scope.

## Motion contract

Record:

- the state change that starts motion;
- the element that remains mounted while it runs;
- the start and end values;
- the property, duration, easing, and interruption behavior;
- the reduced-motion result;
- the component primitive that owns presence and interaction.

Prefer opacity and transform when they express the design. Use targeted transition properties so unrelated changes stay immediate.

## State-driven transition

When an existing primitive exposes `data-state`, keep the complete classes beside that component:

```typescript
const dialogMotion = [
  "transition-[opacity,transform] duration-200 ease-out",
  "data-[state=open]:scale-100 data-[state=open]:opacity-100",
  "data-[state=closed]:scale-95 data-[state=closed]:opacity-0",
  "motion-reduce:transform-none motion-reduce:transition-none",
].join(" ");
```

A transition can animate exit only while the element remains mounted. Use the component primitive's presence lifecycle for deferred unmounting. Let the primitive own focus trapping, restoration, Escape handling, labelling, outside interaction, and portal behavior; Tailwind owns the visual states.

## Keyframes and plugins

For custom keyframes, define them through the installed Tailwind version's theme mechanism and expose one semantic `animate-*` utility. Keep the keyframes beside the token that names them.

For an animation plugin:

1. Confirm the package, version, and Tailwind integration already exist or are in scope.
2. Read its current documentation for exact utility names.
3. Keep plugin classes as complete source strings.
4. Verify open and closed lifecycle states in production output and the browser.

## Verification

Exercise entry, exit, rapid reversal, repeated opening, focus movement, scrolling, and reduced motion. Inspect generated rules and confirm the unmounted state occurs after exit completion. Check that motion preserves pointer, keyboard, and screen-reader behavior.
