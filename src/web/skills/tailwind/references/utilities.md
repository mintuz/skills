# Utility Functions

## Class Name Utility (cn)

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Why cn()?

- **clsx**: conditionally construct className strings
- **twMerge**: merge Tailwind classes (later classes override earlier ones)

### Usage Examples

```typescript
// Conditional classes
cn("base-class", isActive && "active-class", "another-class");

// Object syntax
cn("base", { "text-red-500": hasError, "text-green-500": isSuccess });

// Array syntax
cn(["base", "multiple", "classes"]);

// Merging conflicting classes
cn("px-2", "px-4"); // Result: "px-4" (later class wins)
```

## Common Utilities

### Focus Ring

```typescript
export const focusRing = cn(
  "focus-visible:outline-none focus-visible:ring-2",
  "focus-visible:ring-ring focus-visible:ring-offset-2"
);

// Usage
<button className={cn("base-styles", focusRing)}>Click me</button>;
```

### Disabled State

```typescript
export const disabled = "disabled:pointer-events-none disabled:opacity-50";

// Usage
<button className={cn("base-styles", disabled)} disabled={isDisabled}>
  Submit
</button>;
```

### Transition

```typescript
export const transition = "transition-colors duration-200";

// Usage
<div className={cn("bg-gray-100 hover:bg-gray-200", transition)}>Hover me</div>;
```

## Installation

Install `clsx` and `tailwind-merge` only when the project lacks them and the
requester asks for them or accepts the dependency. Never add either on your own
initiative; plain string joining is the dependency-free equivalent.

```bash
yarn add clsx tailwind-merge
# or
pnpm add clsx tailwind-merge
```

Without the dependency, join class strings in plain JavaScript, such as
`[base, variantClasses, className].filter(Boolean).join(" ")`. Such a join does
not resolve conflicts, so ensure the joined strings never set the same property
twice.

## TypeScript Support

`cn` accepts:

- Strings
- Objects (conditional classes)
- Arrays
- Nested combinations
- undefined/null (ignored)
