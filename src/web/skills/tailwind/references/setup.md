# Tailwind CSS Setup

Initial configuration for Tailwind CSS design systems with semantic tokens and dark mode support.

Read the installed Tailwind major version first. The two majors use different
mechanisms. Follow only the section that matches the installed version.

## Tailwind 3: Configuration File

Applies to Tailwind 3. Tailwind 4 needs no config file for a new project, but it
can still load an existing one with `@config "./tailwind.config.ts";`.

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Semantic color tokens
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  // Keep this plugin only if the project installs tailwindcss-animate.
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

## Tailwind 3: Global CSS with Design Tokens

Applies to Tailwind 3 only. Tailwind 4 replaces the three `@tailwind`
directives with a single `@import "tailwindcss";`.

```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}
```

## Tailwind 4: CSS-First Setup

Applies to Tailwind 4. Tailwind 4 declares tokens in CSS and detects sources
automatically in a normal project layout, so a new project needs no config file
and no `content` glob. Register a path with `@source` when Tailwind cannot reach
it, and set the detection base path with `source()` on the import when the
project root is not the base path, as in a monorepo package.

Register the bundler plugin. Tailwind 4 still supports PostCSS through
`@tailwindcss/postcss`, so keep a working PostCSS integration rather than
replacing it. For a new Vite project, add the installed `@tailwindcss/vite`
plugin beside the existing plugins:

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({ plugins: [tailwindcss()] });
```

Declare fixed tokens in a `@theme` block. A `--color-*` token generates the
matching colour utilities, such as `bg-primary` and `text-primary`:

```css
/* globals.css */
@import "tailwindcss";

@theme {
  --color-primary: oklch(0.21 0.03 264);
  --radius-lg: 0.5rem;
}
```

Use `@theme inline` when a utility must follow a CSS variable that changes at
runtime, such as a variable redefined under a dark-mode selector. `inline`
places the variable reference in the generated utility, so the utility resolves
the value at the point of use and picks up the override:

```css
@import "tailwindcss";

:root {
  --app-primary: oklch(0.21 0.03 264);
}

[data-theme="dark"] {
  --app-primary: oklch(0.93 0.02 264);
}

@theme inline {
  --color-primary: var(--app-primary);
}
```

Load a legacy JavaScript Tailwind plugin with `@plugin`, and define a
class-based dark variant with `@custom-variant`. Add the `@plugin` line only
when the project installs that plugin package:

```css
@plugin "tailwindcss-animate";
@custom-variant dark (&:where(.dark, .dark *));
```

## Design Token Hierarchy

```
Brand Tokens (abstract)
    └── Semantic Tokens (purpose)
        └── Component Tokens (specific)

Example:
    blue-500 → primary → button-bg
```

## Key Concepts

- **CSS Variables**: Enable runtime theming without rebuilding. In Tailwind 4,
  a token must be declared with `@theme inline` for its utilities to follow a
  variable that switches at runtime
- **HSL Colors**: Better for programmatic color adjustments
- **Semantic Naming**: Colors named by purpose (primary) not appearance (blue)
- **Dark Mode**: Class-based dark mode strategy for client-side control. Set it
  with `darkMode` in the config in Tailwind 3, or with `@custom-variant` in
  Tailwind 4
