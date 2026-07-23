# CVA components

Use Class Variance Authority when it is already installed or adopting it is explicitly in scope, and the component has current named variant axes. A plain class string or finite object map is the smaller owner for a component with one fixed presentation.

Load `typescript:typescript` for the public variant type and [Class composition](utilities.md) when caller classes are accepted.

## Variant contract

Keep the complete contract in one definition:

1. Base classes own invariant layout, typography, focus, and disabled behavior.
2. Variant axes represent public product choices, not incidental CSS properties.
3. Sizes own coordinated height, spacing, and icon dimensions.
4. Compound variants represent real intersections between axes.
5. Defaults match the component's documented default rendering.
6. Caller classes come last through the repository's existing merge helper.

Every class string remains complete and statically detectable.

## Pattern

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center rounded-control font-medium",
    "focus-visible:ring-2 focus-visible:ring-primary",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      intent: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        sm: "h-9 gap-1.5 px-3 text-sm",
        md: "h-10 gap-2 px-4 text-sm",
      },
    },
    defaultVariants: {
      intent: "primary",
      size: "md",
    },
  },
);

type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants>;

export function Button({
  className,
  intent,
  size,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ intent, size }), className)}
      {...props}
    />
  );
}
```

Adapt utility names to the installed Tailwind version and repository tokens. Preserve the repository's existing ref convention; add polymorphic `asChild` behavior only when current callers require it and an accessible slot primitive already owns that contract.

## Verification

Render every variant, size, default, and compound combination that callers can select. Check caller overrides, focus-visible and disabled behavior, accessible names, extreme content, supported themes, and representative generated utilities. The public prop type, runtime output, and documentation must describe the same finite set.
