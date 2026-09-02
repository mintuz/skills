# CVA (Class Variance Authority) Components

Type-safe variant components using Class Variance Authority for consistent component APIs.

## Before You Use CVA

CVA is a dependency (`class-variance-authority`). Use it when the project
already installs the package, or when the requester asks for CVA and accepts the
dependency. Do not add the package on your own initiative: the exhaustive
`Record<Variant, string>` map described in `SKILL.md` is the dependency-free
equivalent, so use that map whenever the package is absent and nobody has chosen
to add it. CVA still pays off, once it is available, when a component has
several independent variant axes, such as `variant` plus `size`. Both
mechanisms keep every utility name literal in the source, which is what Tailwind
scans for.

## Pattern Overview

CVA provides a type-safe way to define component variants with:
- Base styles shared across all variants
- Named variant groups (variant, size, state)
- Default variants
- TypeScript inference for props

## Button Component Example

```typescript
// components/ui/button.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef } from 'react'
// cn() comes from utilities.md and needs clsx and tailwind-merge. Without those
// packages, pass the class string straight to className instead.
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
```

## Usage Examples

```tsx
// Basic usage
<Button>Click me</Button>

// With variants
<Button variant="destructive" size="lg">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost" size="sm">Edit</Button>

```

To render the button as another element, add `@radix-ui/react-slot` and swap the
element for `Slot`. Add that package only when the requester accepts it.


## Component Architecture

```
Base styles → Variants → Sizes → States → Overrides
```

## Key Benefits

- **Type Safety**: TypeScript knows valid variant combinations
- **Consistency**: Centralized variant definitions
- **Composability**: Easy to combine with other classes via `cn()`
- **Maintainability**: Single source of truth for component styles
