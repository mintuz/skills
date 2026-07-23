---
name: tailwind
description: WHEN installing, migrating, configuring, building, changing, debugging, or reviewing Tailwind CSS styles, themes, design tokens, component variants, or class composition; NOT for framework-agnostic CSS behavior or visual direction alone; establishes version-aware utility contracts and proves generated, accessible behavior.
---

# Prerequisites

Load each companion whose condition matches:

| Condition | Companion skill |
| --- | --- |
| Every Tailwind change | `web:css` for the emitted CSS cascade and rendered layout |
| Tailwind inside React components | `web:react` for component, state, and accessibility boundaries |
| Choosing visual direction, hierarchy, spacing, type, or color | `web:web-design` |
| Defining a TypeScript variant API | `typescript:typescript` |

# Tailwind

Treat each requested style as a **utility contract**: the class must be statically detectable, compile under the installed Tailwind version, resolve through the intended token and variant, and produce the required rendered behavior.

## Choose the branch

| Request | Route |
| --- | --- |
| Install, migrate, configure, theme, or extend Tailwind | Follow all four steps and load the setup reference in step 2 |
| Build or change Tailwind UI | Follow all four steps and load every matching implementation reference |
| Debug missing or incorrect styles | Reproduce in step 1, then trace class detection, generated CSS, and the cascade |
| Review Tailwind code | Follow all four steps read-only; report failed utility contracts with evidence |
| Change raw CSS behavior without Tailwind API work | Use `web:css` |
| Choose visual direction without implementation | Use `web:web-design` |

## 1. Establish the utility contracts

Read the repository instructions, package manifest and lockfile, installed Tailwind and plugin versions, framework integration, build configuration, source stylesheet, touched components and callers, existing tokens, class helpers, and tests. Preserve the repository's package manager, Tailwind major version, integration, and naming conventions unless migration or adoption is explicitly in scope.

For each requested result, record the target element, visual outcome, interaction and responsive states, theme, content extremes, and user settings. For a defect, reproduce it and determine whether the cause is source detection, an unavailable utility, variant state, merge order, generated CSS, or the downstream cascade.

**Complete when:** every requested result has an observable utility contract; the installed version, current owner, and generation path are known; and every defect has an identified generated or missing rule and rendered cause.

## 2. Load only the matching reference

Read every reference whose condition matches before choosing the implementation:

| Condition | Required reference |
| --- | --- |
| Installation, migration, framework integration, source detection, tokens, themes, or dark mode | [Setup, migration, tokens, and themes](references/setup.md) |
| Typed component variants or an existing CVA component API | [CVA components](references/cva-components.md) |
| Conditional classes, caller overrides, `clsx`, `tailwind-merge`, or `cn` | [Class composition](references/utilities.md) |
| Transitions, keyframes, entry or exit motion, dialogs, or animation plugins | [Animation](references/animations.md) |
| Authoring or reviewing utility markup | [Implementation constraints](references/best-practices.md) |

Use the existing utility or semantic token when it expresses the contract. Add a token for a durable, repeated design decision; use an arbitrary value for a genuine one-off requirement. Keep component classes ordered as base, variants, sizes, states, then caller overrides.

**Complete when:** every utility contract has one styling owner, a version-compatible Tailwind API, every matching reference applied, and each new token, helper, dependency, or plugin is required by current scope.

## 3. Implement detectable utilities

Reuse the existing integration, tokens, components, helpers, and installed dependencies. Write complete class names in statically detectable source strings; map dynamic inputs to finite class maps or typed variants. Keep responsive, theme, interaction, `aria-*`, and `data-*` variants beside the base utility they modify.

Preserve semantic HTML, keyboard behavior, visible focus, accessible names, contrast, reflow, and reduced-motion behavior. Let an accessible component primitive own dialog, menu, popover, and disclosure behavior while Tailwind owns presentation.

**Complete when:** every contract maps to detectable classes and generated CSS, every dynamic input maps to complete finite classes, every applicable state has utilities, and each addition has one current reason to exist.

## 4. Prove generated and rendered behavior

Run the smallest relevant test first, then the repository's configured typecheck, lint, format, and production build. Inspect the generated CSS or build output for representative changed utilities, then verify the rendered result in a browser.

Exercise default and applicable hover, focus, active, disabled, loading, error, open, and closed states; the smallest and largest supported viewport plus touched breakpoints; light and dark themes; short and extreme content; keyboard navigation, zoom, contrast, reflow, and reduced motion. For setup or migration, also verify every source package is scanned and compare affected output across the version boundary.

For a review, cite the source class, generated or missing rule, rendered consequence, and failed check. For implementation, report commands and outcomes.

**Complete when:** every utility contract is observed in the browser, representative utilities exist in production output, all configured checks pass, accessibility behavior holds, and every unavailable verification is named.
