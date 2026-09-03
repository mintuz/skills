---
name: tailwind
description: WHEN building design systems or component libraries with Tailwind CSS; covers design tokens, CVA patterns and dark mode.
---

# Tailwind Design System

Build production-ready design systems with Tailwind CSS, including design tokens, component variants, responsive patterns, and accessibility.

## Related Skills

This skill is self-contained. Load another skill only when the task needs it:

- `web:css` — when you write plain CSS, cascade layers, or selectors beside the Tailwind utilities.
- `web:react` — when you also change React component structure, state, or data flow.
- `typescript:typescript-best-practices` — when you design the public types of a component.
- `web:web-design` — when you choose the visual design itself, not its implementation.

## Quick Reference

| Topic                               | Guide                                             |
| ----------------------------------- | ------------------------------------------------- |
| Tailwind config, global CSS, tokens | [setup.md](references/setup.md)                   |
| CVA pattern with type-safe variants | [cva-components.md](references/cva-components.md) |
| Animation utilities and Dialog      | [animations.md](references/animations.md)         |
| Utility functions (cn, focusRing)   | [utilities.md](references/utilities.md)           |
| Do's and Don'ts for maintainability | [best-practices.md](references/best-practices.md) |

## When to Use This Skill

- Creating a component library with Tailwind
- Implementing design tokens and theming
- Building responsive and accessible components
- Standardizing UI patterns across a codebase
- Migrating to or extending Tailwind CSS

## Core Concepts

### Design Token Hierarchy

```
Brand Tokens (abstract)
    └── Semantic Tokens (purpose)
        └── Component Tokens (specific)

Example:
    blue-500 → primary → button-bg
```

### Literal Class Names

Tailwind generates CSS only from class names that appear literally in the files
it scans. It reads source as plain text. It never evaluates the code, so a name
built at runtime by interpolation, such as `` `bg-${color}-600` ``, is never
generated. Such a component can still look correct while some other scanned file
happens to contain the same literal names, then lose those styles when that file
changes. Treat every dynamic class name as a defect.

A component is correct when two conditions hold together: every utility name is
a complete literal string in the file, and Tailwind scans that file. When you
change how a component builds its class names, say which mechanism now keeps the
names literal, and check that the file sits in a scanned source path. Those two
statements together let a reader judge the change without running a production
build.

### Component Variants

Keep the utilities that every variant shares in one base string. Give each
finite typed variant a complete literal class string. Use one of two mechanisms:

- An exhaustive `Record<Variant, string>` map. This needs no dependency, so it
  is the default when the task forbids new packages.
- CVA (`class-variance-authority`). Use it when the project already installs the
  package, or when the requester asks for CVA and accepts the dependency. CVA
  also derives the prop types, which pays off when a component has several
  independent variant axes, such as `variant` plus `size`. See
  [cva-components.md](references/cva-components.md).

Do not add `class-variance-authority` on your own initiative. The map is the
dependency-free equivalent, so the rule under [Dependencies](#dependencies)
rules the package out unless the requester chooses it.

Both mechanisms satisfy the literal-class-name rule. Choose between them on
installed dependencies and on the number of variant axes, not on style.

Do not solve a component's dynamic class name with a safelist. A safelist hides
which variants the component uses and grows the generated CSS. Reserve explicit
safelisting for a known, finite set of class names that cannot appear in scanned
source. Tailwind 4.1 and later write that as `@source inline(...)`; read the
installed minor version before you use it, because Tailwind 4.0 does not have
it. Safelisting cannot cover a name that is unknown until runtime, such as a
class read from a database. Map each external value to a literal class in your
own source instead, and give an unrecognised value a default.

If the focus colour varies by variant, include a literal visible outline style
and colour in each mapping. Outline width and offset alone do not guarantee a
visible indicator.

### Version Gate

Read the installed version from the project before you write any Tailwind
syntax. The two majors use different mechanisms, and their syntax is not
interchangeable. Read the minor version too before you use a feature that a
later minor added, such as `@source inline(...)` in Tailwind 4.1.

**Tailwind 4 (CSS-first).** Import with `@import "tailwindcss";`. Declare tokens
in a CSS `@theme` block. Use `@theme inline` when a utility must reference a CSS
variable that switches at runtime, such as a variable redefined under `.dark` or
`[data-theme="dark"]`. For a new Vite integration, register the
`@tailwindcss/vite` plugin. That plugin replaces the PostCSS setup rather than
joining it, so keep a working `@tailwindcss/postcss` integration where you find
one. Tailwind 4 detects sources automatically in a normal project layout, so it
usually needs no config file and no content glob. Register a path with `@source`
when Tailwind cannot reach it, for example a template inside an ignored
directory or outside the project root.

**Tailwind 3 (config-based).** Import with the `@tailwind base;`,
`@tailwind components;` and `@tailwind utilities;` directives. Declare tokens
under `theme.extend` in `tailwind.config.*`, and set `content` and `darkMode`
there. See [setup.md](references/setup.md).

Do not add a config file, content glob, PostCSS setup, or dependency unless the
observed project requires it.

## When to Use Each Guide

### Setup

Use [setup.md](references/setup.md) when you need:

- Initial Tailwind configuration
- CSS variable setup for theming
- Design token structure
- Global styles foundation

### CVA Components

Use [cva-components.md](references/cva-components.md) when you need:

- Type-safe component variants
- Button, Badge, or similar components
- Standardized variant APIs
- Reusable component patterns

### Animations

Use [animations.md](references/animations.md) when you need:

- Entry/exit animations
- Dialog or modal transitions
- Tailwind CSS Animate utilities
- State-based animations

### Utilities

Use [utilities.md](references/utilities.md) when you need:

- Class name composition (cn function)
- Common utility patterns
- Focus ring, disabled state helpers

### Best Practices

Use [best-practices.md](references/best-practices.md) for:

- Guidance on semantic naming
- Do's and Don'ts
- Accessibility requirements
- Performance considerations

## Quick Decision Trees

### Where should colors be defined?

```
Is this a one-off color?
├── Yes → Use arbitrary value sparingly (e.g., bg-[#abc123])
└── No → Is it semantic (primary, destructive)?
    ├── Yes → Add to semantic tokens in setup.md
    └── No → Is it a brand color?
        ├── Yes → Tailwind 4: add a `--color-*` token in `@theme`.
        │         Tailwind 3: add it to `theme.extend.colors`.
        └── No → Use existing Tailwind color
```

## Missing Tokens and Missing Facts

Take a colour, spacing value, or breakpoint from a token the project already
defines, from a value the request supplies, or from Tailwind's built-in palette.

When the request names a project-specific value that nothing in the packet
supplies, such as a brand colour, do not invent a value and present it as that
project's value. Say which value is missing, add the token at the semantic
layer, and mark the value as a placeholder for the design owner to confirm.

A request to choose the value quickly, or to leave no open question, does not
supply the value. Still name it as missing, and keep that note to one line.

A missing value does not by itself justify withholding the patch. When the patch
stays valid with a clearly marked placeholder, deliver it and list the open
question beside it. When the patch cannot be valid without the missing value,
describe the change you would make and ask for the value.

## Dependencies

Reuse the installed integration and helpers. Add a package only when the
requested feature requires it and the repository has no native equivalent, or
when the requester names that package and accepts the dependency. When
a request names a package the project does not install and also forbids new
dependencies, do not silently pick one side. State the conflict, give the
dependency-free equivalent, and let the requester choose.

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [CVA Documentation](https://cva.style/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix Primitives](https://www.radix-ui.com/primitives)
