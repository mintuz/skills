---
name: tailwind
description: "USE WHEN writing, fixing or reviewing the styling of a component or page in a project that uses Tailwind CSS, even a one-class change and even when the request does not say Tailwind: colours, focus rings, spacing, class names chosen by a prop, variants with a map or CVA, theme tokens and dark mode in the Tailwind stylesheet or tailwind.config, and Tailwind setup or upgrades (if a styling request does not show whether the project uses Tailwind, check package.json or the main stylesheet first); NOT WHEN writing plain CSS or Sass in a project without Tailwind; produces class names Tailwind can find, syntax for the installed major version, visible focus indicators, and no dependency or invented brand value that nobody asked for."
---

# Tailwind

Write Tailwind styling that the build generates, that matches the installed version and that adds nothing the requester did not ask for.

## Boundaries

- In a project without Tailwind, use `web:css` instead. In a Tailwind project, this skill covers the stylesheet that Tailwind processes as well as the class names.
- When the change also alters React component structure, state or data flow, also load `web:react`.

## References

Read a reference only when the task needs it:

| Reference | Read when the task involves |
| --- | --- |
| [setup.md](references/setup.md) | Tailwind config, global CSS, CSS variables for theming, the token hierarchy |
| [cva-components.md](references/cva-components.md) | A CVA component, after [Component variants](#component-variants) selects CVA |
| [animations.md](references/animations.md) | Entry and exit animations, dialog transitions, `tailwindcss-animate` |
| [utilities.md](references/utilities.md) | Class composition with `cn`, focus and disabled-state helpers |
| [best-practices.md](references/best-practices.md) | Semantic naming, accessibility, dark mode, responsive and animation performance |

## Version gate

Before you write any Tailwind syntax, read the installed major version from the project. The syntax of Tailwind 3 and Tailwind 4 is not interchangeable. Before you use a feature that a later minor version added, such as `@source inline(...)` in Tailwind 4.1, read the minor version too.

**Tailwind 4 (CSS-first):**

- Import with `@import "tailwindcss";`.
- Declare tokens in a CSS `@theme` block.
- When a utility must follow a CSS variable that changes at run time, such as a variable redefined under `.dark` or `[data-theme="dark"]`, declare the token in `@theme inline`. A plain `@theme` variable that references another variable resolves once at the root, so its utility keeps the root value inside a nested override. `@theme inline` puts the variable reference in the generated utility, so the utility resolves the value on the element where it is used. When you use `@theme inline` for this, give both halves of the reason in your reply: a plain `@theme` token would resolve at the root and keep the root value, and `@theme inline` resolves it on the element.
- For a new Vite integration, register the `@tailwindcss/vite` plugin. It replaces the PostCSS setup, so keep a working `@tailwindcss/postcss` integration where you find one.
- Tailwind 4 detects sources automatically in a normal layout and usually needs no config file or content glob. Register a path with `@source` only when Tailwind cannot reach it, such as a template in an ignored directory or outside the project root.

**Tailwind 3 (config-based):**

- Import with `@tailwind base;`, `@tailwind components;` and `@tailwind utilities;`.
- Declare tokens under `theme.extend` in `tailwind.config.*`, and set `content` and `darkMode` there. See [setup.md](references/setup.md).

Do not add a config file, content glob, PostCSS setup or dependency unless the observed project requires it (`principle-foundational-thinking`).

## Literal class names

Tailwind generates CSS only for class names that appear as complete literal strings in the files it scans. It reads source as plain text and never evaluates it, so it never generates a name built at run time, such as `` `bg-${color}-600` ``. Such a component can look correct while another scanned file contains the same names, then lose its styles when that file changes. Treat every dynamic class name as a defect.

A component is correct when every utility name is a complete literal string in the file and Tailwind scans that file. When you change how a component builds its class names:

1. Say which mechanism now keeps the names literal.
2. Check that the file is in a scanned source path, and say so.

## Component variants

Keep the utilities that every variant shares in one base string. Give each finite typed variant a complete literal class string. Choose the mechanism from the installed dependencies and the number of variant axes:

- **Exhaustive `Record<Variant, string>` map.** It needs no dependency. Use it by default, and always when the task forbids new packages.
- **CVA (`class-variance-authority`).** Use it when the project already installs the package, or when the requester asks for CVA and accepts the dependency. CVA derives the prop types, which helps with several independent axes, such as `variant` plus `size`. See [cva-components.md](references/cva-components.md).

Do not add `class-variance-authority` on your own initiative; [Dependencies](#dependencies) applies.

Do not fix a component's dynamic class name with a safelist. A safelist hides which variants the component uses and grows the generated CSS. Use safelisting only for a known, finite set of class names that cannot appear in scanned source; Tailwind 4.1 and later write it as `@source inline(...)`, and Tailwind 4.0 does not have it. A safelist cannot cover a name that is unknown until run time, such as a class read from a database. Instead, map each external value to a literal class in your own source, with a default for an unrecognised value.

Before you write a component that takes a ref, read the installed React version. In React 19, accept `ref` as a regular prop and do not add `forwardRef` or `displayName`. Use `forwardRef` only on React 18 or earlier.

## Focus indicators

Give every interactive element a visible indicator on keyboard focus (`focus-visible:`) with an outline style, width and colour. Use an outline, not only a ring: a ring is a box-shadow, and forced-colours mode removes box-shadows.

- In Tailwind 4, `outline-none` sets `outline-style: none`, so an `outline-<width>` utility on the same element draws nothing. Remove `outline-none`, or add `focus-visible:outline-solid` beside the width. When you do either, say this reason in your reply.
- To hide the outline but keep it in forced-colours mode, for example under a ring, use `outline-hidden` in Tailwind 4 and `outline-none` in Tailwind 3.
- If the focus colour varies by variant, put a literal visible outline style and colour in each mapping. Outline width and offset alone do not guarantee a visible indicator.

## Colours and missing values

Take each colour, spacing value or breakpoint from one of these sources:

1. A token that the project already defines for that purpose. Prefer a semantic token.
2. A value that the request supplies.
3. Tailwind's built-in palette, only for a purpose that no project token covers.

Place a colour as follows:

- One-off colour with a supplied value: use an arbitrary value, such as `bg-[#abc123]`.
- Semantic colour, such as `primary` or `destructive`: add it to the semantic tokens ([setup.md](references/setup.md)).
- Brand colour: in Tailwind 4, add a `--color-*` token in `@theme`; in Tailwind 3, add it to `theme.extend.colors`.
- Any other colour: use an existing Tailwind colour.

When the request names a project-specific value that nothing supplies, such as a brand colour, never invent a value and present it as the project's:

1. In one line, say that the project defines no such value. A request to choose quickly, or to leave no open question, does not supply the value.
2. Add the token at the semantic layer.
3. Mark its value as a placeholder, and say that the design owner must supply the real value.

A missing value alone does not justify withholding the patch. When the patch stays valid with a marked placeholder, deliver it with the open question beside it. When the patch cannot be valid without the value, describe the change and ask for the value (`principle-never-block-on-the-human`).

## Dependencies

Reuse the installed integration and helpers (`principle-reuse-before-building`). Add a package only when one of these is true:

- The requested feature requires it and the repository has no native equivalent.
- The requester names the package and accepts the dependency.

When a request names an uninstalled package and also forbids new dependencies, do not silently pick one side. State the conflict, give the dependency-free equivalent, and tell the requester how to get the package if they still want it (`principle-price-each-option`).
