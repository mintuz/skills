---
name: tailwind
description: WHEN building design systems or component libraries with Tailwind CSS; covers design tokens, CVA patterns and dark mode.
---

# Tailwind Design System

Build production-ready design systems with Tailwind CSS, including design tokens, component variants, responsive patterns, and accessibility.

## Related Skills

Load another skill only when the task needs it:

- `web:css` — when you write plain CSS, cascade layers, or selectors beside the Tailwind utilities.
- `web:react` — when you also change React component structure, state, or data flow.
- `typescript:typescript-best-practices` — when you design the public types of a component.
- `web:web-design` — when you choose the visual design itself, not its implementation.

## Quick Reference

| Guide | Read for |
| --- | --- |
| [setup.md](references/setup.md) | Tailwind config, global CSS, CSS variables for theming, design token structure |
| [cva-components.md](references/cva-components.md) | Type-safe CVA variants, Button/Badge-style components, standardised variant APIs, reusable patterns |
| [animations.md](references/animations.md) | Entry/exit animations, dialog or modal transitions, Tailwind CSS Animate utilities, state-based animations |
| [utilities.md](references/utilities.md) | Class name composition (`cn`), common utility patterns, focus ring and disabled-state helpers |
| [best-practices.md](references/best-practices.md) | Semantic naming, do's and don'ts, accessibility requirements, performance |

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
it scans. It reads source as plain text and never evaluates it, so a name built
at runtime by interpolation, such as `` `bg-${color}-600` ``, is never
generated. Such a component can look correct while another scanned file happens
to contain the same literal names, then lose those styles when that file
changes. Treat every dynamic class name as a defect.

A component is correct when every utility name is a complete literal string in
the file and Tailwind scans that file. When you change how a component builds
its class names, say which mechanism now keeps the names literal, and check that
the file sits in a scanned source path. Together, those two statements let a
reader judge the change without a production build.

### Component Variants

Keep the utilities that every variant shares in one base string. Give each
finite typed variant a complete literal class string. Use one of two mechanisms:

- An exhaustive `Record<Variant, string>` map. It needs no dependency, so it is
  the default when the task forbids new packages.
- CVA (`class-variance-authority`), when the project already installs the
  package or the requester asks for CVA and accepts the dependency. CVA also
  derives the prop types, which pays off with several independent variant axes,
  such as `variant` plus `size`. See
  [cva-components.md](references/cva-components.md).

Do not add `class-variance-authority` on your own initiative: the map is the
dependency-free equivalent, so [Dependencies](#dependencies) rules the package
out unless the requester chooses it.

Both mechanisms keep class names literal. Choose on installed dependencies and
the number of variant axes, not on style.

Do not solve a component's dynamic class name with a safelist: it hides which
variants the component uses and grows the generated CSS. Reserve safelisting for
a known, finite set of class names that cannot appear in scanned source.
Tailwind 4.1+ writes that as `@source inline(...)`; Tailwind 4.0 lacks it, so
read the installed minor version first. Safelisting cannot cover a name unknown
until runtime, such as a class read from a database; map each external value to
a literal class in your own source instead, with a default for an unrecognised
value.

If the focus colour varies by variant, include a literal visible outline style
and colour in each mapping. Outline width and offset alone do not guarantee a
visible indicator.

### Version Gate

Read the installed version from the project before writing any Tailwind
syntax; the two majors' syntax is not interchangeable. Read the minor version
too before using a feature a later minor added, such as `@source inline(...)` in
Tailwind 4.1.

**Tailwind 4 (CSS-first).** Import with `@import "tailwindcss";`. Declare tokens
in a CSS `@theme` block. Use `@theme inline` when a utility must reference a CSS
variable that switches at runtime, such as a variable redefined under `.dark` or
`[data-theme="dark"]`. For a new Vite integration, register the
`@tailwindcss/vite` plugin; it replaces the PostCSS setup rather than joining
it, so keep a working `@tailwindcss/postcss` integration where you find one.
Tailwind 4 detects sources automatically in a normal layout, so it usually needs
no config file or content glob. Register a path with `@source` when Tailwind
cannot reach it, such as a template inside an ignored directory or outside the
project root.

**Tailwind 3 (config-based).** Import with the `@tailwind base;`,
`@tailwind components;` and `@tailwind utilities;` directives. Declare tokens
under `theme.extend` in `tailwind.config.*`, and set `content` and `darkMode`
there. See [setup.md](references/setup.md).

Do not add a config file, content glob, PostCSS setup, or dependency unless the
observed project requires it (`principle-foundational-thinking`).

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

When the request names a project-specific value nothing in the packet
supplies, such as a brand colour, never invent a value and present it as the
project's. Name the missing value, add the token at the semantic layer, and mark
the value as a placeholder for the design owner to confirm.

A request to choose quickly, or to leave no open question, does not supply the
value. Still name it as missing, in one line.

A missing value alone does not justify withholding the patch. When the patch
stays valid with a clearly marked placeholder, deliver it with the open question
beside it. When it cannot be valid without the value, describe the change and
ask for the value (`principle-never-block-on-the-human`).

## Dependencies

Reuse the installed integration and helpers (`principle-reuse-before-building`).
Add a package only when the requested feature requires it and the repository
has no native equivalent, or when the requester names that package and accepts
the dependency. When a request names an uninstalled package and also forbids
new dependencies, do not silently pick one side: state the conflict, give the
dependency-free equivalent, and let the requester choose
(`principle-price-each-option`).

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [CVA Documentation](https://cva.style/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix Primitives](https://www.radix-ui.com/primitives)
