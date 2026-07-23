---
name: css
description: WHEN authoring, debugging, reviewing, or refactoring CSS, styles, or web layout; NOT for visual direction or framework-specific component logic; traces each visual requirement through layout, cascade, responsive states, and accessibility checks.
---

# CSS

Treat each visual requirement as a **cascade contract**: the intended result must survive the active layout algorithm, selector weight, source order, content, viewport, and user settings.

## Choose the branch

| Request | Route |
| --- | --- |
| Author or fix styles | Follow all four steps; begin a bug fix with a failing visual reproduction |
| Review styles | Follow steps 1, 2, and 4 read-only; report each broken contract with evidence |
| Refactor styles | Capture current behavior, read the refactoring reference in step 2, then follow all four steps |
| Tailwind, CSS-in-JS, or a preprocessor | Apply this skill to the emitted CSS behavior and use the framework's own guidance for its API |

## 1. Frame the cascade contract

Read the repository instructions, touched markup and styles, relevant component callers, build configuration, browser support, and existing tokens, utilities, cascade layers, and naming conventions.

For each requested change, record the target element, intended visual result, interaction states, relevant viewport or container sizes, content extremes, and user settings. For a defect, reproduce it and trace the computed value through layout, inheritance, cascade layer, selector weight, and source order before editing.

**Complete when:** every requested result has an observable contract, and the current owner and cause of each affected style are known.

## 2. Choose the rule and owner

Read every matching reference before deciding that branch:

| Branch | Required reference |
| --- | --- |
| Class, component, utility, token, or extension architecture | [patterns.md](references/patterns.md) |
| Selector conflicts, specificity, `!important`, or shorthand properties | [specificity.md](references/specificity.md) |
| Units, line height, spacing, margins, layout, stacking, or inline images | [units-margins.md](references/units-margins.md) |
| Sass `@extend` or mixins, imports, dead CSS, code smells, or refactoring | [preprocessors-refactoring.md](references/preprocessors-refactoring.md) |

Use semantic HTML for structure and add ARIA where native semantics cannot express the contract. Prefer existing design tokens and the native layout algorithm that owns the relationship. Layout parents own external spacing; components own their internal presentation. Keep classes low-specificity and single-purpose, extend stable bases with variants, and reserve immutable utilities for deliberate global overrides.

**Complete when:** each contract has one clear styling owner, a reference-backed cascade strategy, and units that match the required scaling behavior.

## 3. Implement the smallest stable change

Reuse the existing styling surface, tokens, utilities, and cascade position. Keep state and responsive rules beside the component behavior they modify, and apply every matched reference decision.

Preserve unaffected visual behavior. Add only declarations that serve a contract from step 1.

**Complete when:** every contract maps to a rule or markup change, every declaration has one reason to exist, and every reset or override is intentional.

## 4. Prove the rendered behavior

Run the smallest relevant formatter, lint, and build checks, then inspect the rendered result in a browser. Exercise:

- default, hover, focus, active, disabled, error, loading, and empty states that exist;
- the smallest and largest supported viewport plus each touched breakpoint or container boundary;
- short, long, missing, and localized content where layout can change;
- keyboard focus, zoom or enlarged text, contrast, reflow, and reduced motion when animation is present;
- neighboring components and reused utilities for cascade leakage.

Inspect computed styles for changed cascade behavior. For refactors, compare the before and after contract; for reviews, cite the selector, declaration, rendered consequence, and failed check.

**Complete when:** every contract from step 1 is observed in the browser, automated checks pass, accessibility behavior holds, and any unavailable verification is named.
