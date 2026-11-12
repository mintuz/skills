# Animations

Every example needs `tailwindcss-animate` (for `animate-in` and `animate-out`). The Dialog example also needs `@radix-ui/react-dialog`. Use these patterns only when the project installs those packages or the requester accepts them. Otherwise, build the transition from the built-in `transition`, `duration` and `data-[state=...]` utilities.

## Presets

```typescript
// lib/animations.ts
import { cn } from "./utils";

export const fadeIn = "animate-in fade-in duration-300";
export const fadeOut = "animate-out fade-out duration-300";
export const slideInFromTop = "animate-in slide-in-from-top duration-300";
export const slideInFromBottom = "animate-in slide-in-from-bottom duration-300";
export const slideInFromLeft = "animate-in slide-in-from-left duration-300";
export const slideInFromRight = "animate-in slide-in-from-right duration-300";
export const zoomIn = "animate-in zoom-in-95 duration-300";
export const zoomOut = "animate-out zoom-out-95 duration-300";

// Compound animations
export const modalEnter = cn(fadeIn, zoomIn, "duration-200");
export const modalExit = cn(fadeOut, zoomOut, "duration-200");
export const dropdownEnter = cn(fadeIn, slideInFromTop, "duration-150");
export const dropdownExit = cn(fadeOut, "slide-out-to-top", "duration-150");
```

## Dialog

The example is for React 19. On React 18 or earlier, wrap each part in `forwardRef`.

```typescript
// components/ui/dialog.tsx
import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ComponentProps } from "react";

function DialogOverlay({ className, ...props }: ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-black/80",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  );
}

function DialogContent({ className, children, ...props }: ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
          "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
          "sm:rounded-lg",
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}
```

## Classes

| Purpose | Classes |
| --- | --- |
| Entry | `animate-in` (base), `fade-in`, `slide-in-from-*`, `zoom-in-*` |
| Exit | `animate-out` (base), `fade-out`, `slide-out-to-*`, `zoom-out-*` |
| Duration | `duration-75` to `duration-1000` |

## Rules

- Drive state-based animations from data attributes, such as `data-[state=open]:`.
- Keep durations between 150 ms and 300 ms.
- Provide a reduced-motion alternative.
