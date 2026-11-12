# Utilities

## Class name utility (`cn`)

`cn` needs `clsx` and `tailwind-merge`. Install them only when the project lacks them and the requester asks for them or accepts the dependency. Never add either on your own initiative.

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

`clsx` builds a class string from conditions. `twMerge` resolves conflicting Tailwind classes: the later class wins. `cn` accepts strings, objects of conditional classes, arrays, nested combinations, and `undefined` or `null` (ignored).

```typescript
cn("base-class", isActive && "active-class", "another-class");
cn("base", { "text-red-500": hasError, "text-green-500": isSuccess });
cn(["base", "multiple", "classes"]);
cn("px-2", "px-4"); // "px-4"
```

Install command, when approved:

```bash
pnpm add clsx tailwind-merge
# or
yarn add clsx tailwind-merge
```

Without the dependency, join class strings in plain JavaScript, such as `[base, variantClasses, className].filter(Boolean).join(" ")`. A plain join does not resolve conflicts, so make sure that the joined strings never set the same property twice.

## Shared class strings

### Focus outline

An outline stays visible in forced-colours mode; a ring does not (see [Focus indicators](../SKILL.md#focus-indicators)).

```typescript
export const focusOutline = cn(
  "focus-visible:outline-2 focus-visible:outline-offset-2",
  "focus-visible:outline-ring"
);

<button className={cn("base-styles", focusOutline)}>Click me</button>;
```

### Disabled state

```typescript
export const disabled = "disabled:pointer-events-none disabled:opacity-50";

<button className={cn("base-styles", disabled)} disabled={isDisabled}>
  Submit
</button>;
```

### Transition

```typescript
export const transition = "transition-colors duration-200";

<div className={cn("bg-gray-100 hover:bg-gray-200", transition)}>Hover me</div>;
```
