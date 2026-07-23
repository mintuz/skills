# Setup, migration, tokens, and themes

The installed Tailwind major version is the compatibility boundary. Keep an existing project on its current version and integration unless migration is requested. Confirm the version from the manifest and lockfile, then follow the matching official framework guide rather than a generic install command.

## Version gate

| Project | Configuration owner |
| --- | --- |
| Tailwind v4 | CSS-first configuration with `@import`, `@theme`, `@source`, and `@custom-variant`; load a legacy JavaScript config explicitly with `@config` |
| Tailwind v3 | `tailwind.config.*` for content and theme configuration, plus `@tailwind` CSS directives |
| Migration to v4 | The official upgrade guide and tool, followed by a production-output and browser-support comparison |

Current official references:

- [Installation](https://tailwindcss.com/docs/installation)
- [Upgrade guide](https://tailwindcss.com/docs/upgrade-guide)
- [Theme variables](https://tailwindcss.com/docs/theme)
- [Source detection](https://tailwindcss.com/docs/detecting-classes-in-source-files)
- [Dark mode](https://tailwindcss.com/docs/dark-mode)

## Tailwind v4

Use `@theme` for values that should create utility APIs. Use ordinary CSS variables for runtime values, and connect semantic utilities to them with `@theme inline`:

```css
@import "tailwindcss";

@theme inline {
  --color-background: var(--app-background);
  --color-foreground: var(--app-foreground);
  --color-primary: var(--app-primary);
  --color-primary-foreground: var(--app-primary-foreground);
  --color-destructive: var(--app-destructive);
  --color-destructive-foreground: var(--app-destructive-foreground);
  --radius-control: var(--app-radius-control);
}

:root {
  --app-background: oklch(1 0 0);
  --app-foreground: oklch(0.2 0 0);
  --app-primary: oklch(0.55 0.2 255);
  --app-primary-foreground: oklch(1 0 0);
  --app-destructive: oklch(0.58 0.22 27);
  --app-destructive-foreground: oklch(1 0 0);
  --app-radius-control: 0.5rem;
}

.dark {
  --app-background: oklch(0.2 0 0);
  --app-foreground: oklch(0.96 0 0);
  --app-primary: oklch(0.75 0.14 255);
  --app-primary-foreground: oklch(0.2 0 0);
  --app-destructive: oklch(0.7 0.19 27);
  --app-destructive-foreground: oklch(0.2 0 0);
}
```

The default `dark` variant follows `prefers-color-scheme`. For an application-owned `.dark` selector, define the variant beside the import:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

Place the chosen theme marker on a stable ancestor and initialize it before first paint when the application persists user preference.

Tailwind v4 detects project sources automatically. Register ignored dependencies or monorepo packages relative to the stylesheet:

```css
@source "../packages/ui";
```

## Tailwind v3

Keep source globs and theme extensions in the JavaScript or TypeScript config:

```typescript
import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
      },
      borderRadius: {
        control: "var(--radius-control)",
      },
    },
  },
} satisfies Config;
```

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 12%;
    --primary: 221 83% 53%;
    --primary-foreground: 0 0% 100%;
    --destructive: 0 72% 51%;
    --destructive-foreground: 0 0% 100%;
    --radius-control: 0.5rem;
  }

  .dark {
    --background: 0 0% 12%;
    --foreground: 0 0% 96%;
    --primary: 217 91% 60%;
    --primary-foreground: 0 0% 12%;
    --destructive: 0 91% 71%;
    --destructive-foreground: 0 0% 12%;
  }
}
```

Make every content glob cover the applications and shared packages that contain class strings.

## Token contract

Use three levels only where the product has all three:

```text
brand value → semantic purpose → component-specific value
blue-600 → primary → button-primary-background
```

Prefer semantic utilities such as `bg-primary text-primary-foreground` when a value changes with theme or product meaning. Keep paired foreground and surface tokens together, and update every supported theme in the same change. A component-specific token earns a place only when that component owns a repeated value that cannot be expressed by a semantic or existing Tailwind token.

## Source detection

Tailwind scans source as text. Store every candidate as a complete class name:

```typescript
const tone = {
  danger: "bg-red-600 hover:bg-red-500",
  success: "bg-green-600 hover:bg-green-500",
} as const;
```

Class fragments such as `` `bg-${color}-600` `` have no complete source token. Map runtime inputs to a finite set of complete strings. Use the version's explicit source or safelist mechanism only when the complete classes legitimately live outside scanned source.

## Migration proof

Run the official upgrade path only when migration is in scope. Before accepting it, compare:

- framework and PostCSS or Vite integration;
- source coverage and representative generated utilities;
- theme, dark-mode, prefix, important, and plugin behavior;
- renamed utilities, defaults, and custom CSS;
- production browser requirements and bundle output;
- rendered light, dark, responsive, focus, and motion states.
