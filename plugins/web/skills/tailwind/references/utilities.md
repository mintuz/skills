# Class composition

Start by finding the repository's existing class composition helper and callers. Reuse it and preserve its conflict semantics.

## Choose the composition owner

| Need | Owner |
| --- | --- |
| A fixed class list | One string |
| A small condition | A template, array, or existing lightweight helper |
| Strings, arrays, and object conditions | Existing `clsx` helper |
| Intentional Tailwind utility overrides | Existing `tailwind-merge` helper configured for the installed Tailwind version |
| Typed named component variants | The repository's variant pattern or [CVA components](cva-components.md) |

A shared `cn` helper is warranted when current callers need both conditional composition and Tailwind conflict resolution, and its dependencies already exist or adoption is in scope:

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

`clsx` selects class strings; it does not resolve CSS conflicts. `tailwind-merge` removes recognized conflicting Tailwind groups so later caller utilities can win. Confirm its installed version understands the project's Tailwind version and custom utility families before relying on that behavior.

## Detectable conditions

Keep complete classes at each branch:

```typescript
cn(
  "rounded-control px-4 py-2",
  selected ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
  className,
);
```

Finite maps are clearer when an input selects a visual contract:

```typescript
const toneClasses = {
  info: "border-blue-500 bg-blue-50 text-blue-950",
  danger: "border-red-500 bg-red-50 text-red-950",
} as const;
```

## Override contract

Place caller classes last only when override behavior is part of the component API. Verify conflicts for responsive, state, arbitrary, important, and custom utilities; source order alone does not guarantee that every unrelated declaration is replaced. Keep invariant accessibility and layout requirements inside the component contract when callers are not meant to change them.

Keep reusable style strings beside their component or feature. Promote them to a shared module only when multiple current owners use the same semantic contract.
