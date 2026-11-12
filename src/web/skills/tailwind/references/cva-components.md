# CVA components

Use CVA only when [Component variants](../SKILL.md#component-variants) selects it. CVA is a dependency (`class-variance-authority`). Without the package, and without the requester choosing it, use the exhaustive `Record<Variant, string>` map.

A CVA definition has a base string shared by all variants, named variant groups (such as `variant` and `size`), default variants, and inferred TypeScript prop types.

## Button

The example is for React 19, where `ref` is a regular prop. On React 18 or earlier, wrap the component in `forwardRef`.

```typescript
// components/ui/button.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentPropsWithRef } from 'react'
// cn() comes from utilities.md and needs clsx and tailwind-merge. Without those
// packages, pass the class string straight to className instead.
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50',
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

export type ButtonProps = ComponentPropsWithRef<'button'> &
  VariantProps<typeof buttonVariants>

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
```

## Usage

```tsx
<Button>Click me</Button>
<Button variant="destructive" size="lg">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost" size="sm">Edit</Button>
```

To render the button as another element, add `@radix-ui/react-slot` only when the requester accepts it, and replace the element with `Slot`.

Order the class layers as: base styles, variants, sizes, states, overrides.
