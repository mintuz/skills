---
name: css
description: WHEN authoring CSS/styles/layout for web UI, including plain-CSS custom-property design scales; NOT for Tailwind projects (tailwind.config.js, utility classes, CVA variants, Tailwind theme tokens), load web:tailwind instead; outputs production-ready, accessible, maintainable CSS.
---

# CSS Best Practices

Production-grade CSS development with architectural principles, proper specificity management, and maintainable patterns.

## Core Principles

1. **Single Responsibility** - Each class handles one concern only
2. **Open/Closed** - Open for extension, closed for modification
3. **Immutable CSS** - Utilities and objects never change after creation
4. **Behavior over implementation** - Focus on what the code does, not how
5. **Accessibility first** - Semantic HTML before ARIA, proper contrast and sizing

## Quick Reference

| Topic                                                    | Guide                                                                   |
| -------------------------------------------------------- | ----------------------------------------------------------------------- |
| Specificity hierarchy, safe techniques, !important rules | [specificity.md](references/specificity.md)                             |
| rem vs px, margins, layout algorithms                    | [units-margins.md](references/units-margins.md)                         |
| @extend vs mixins, refactoring workflow, code smells     | [preprocessors-refactoring.md](references/preprocessors-refactoring.md) |
| Architectural principles and common code patterns        | [patterns.md](references/patterns.md)                                   |

## When to Use Each Guide

### Specificity

Use [specificity.md](references/specificity.md) when you need:

- Specificity hierarchy and calculations
- Safe techniques (self-chaining, attribute selectors)
- Cascade layers (`@layer`) and how unlayered styles win
- Anti-patterns (IDs, deep nesting, qualified selectors)
- !important rules (proactive vs reactive)
- Shorthand property gotchas
- Alternatives to reactive !important

### Units and Margins

Use [units-margins.md](references/units-margins.md) when you need:

- rem vs px decision framework
- Line-height best practices
- Margin encapsulation rules
- Single-direction margin patterns
- Margin collapse behavior
- Layout algorithm awareness (Flow, Flexbox, Grid)
- Common gotchas (z-index, magic space under images)

### Preprocessors and Refactoring

Use [preprocessors-refactoring.md](references/preprocessors-refactoring.md) when you need:

- @extend vs mixins guidance
- Avoiding & concatenation
- CSS @import performance issues
- Finding dead CSS with beacons
- The Three I's refactoring workflow
- Code smell reference tables

### Patterns

Use [patterns.md](references/patterns.md) when you need:

- Single Responsibility Principle examples
- Open/Closed Principle patterns
- Immutable CSS patterns and prefixes
- Component without margin examples
- Utility class patterns
- Visually hidden text and focusable (stateful) hidden controls
- Self-chaining for specificity
- CSS custom properties for design scales

## Quick Reference: Decision Trees

### Should I use !important?

```
Is this a utility class that must be immutable?
├── Yes → Use !important (proactive)
└── No → Is there a specificity conflict?
    ├── Yes → First change source order, layers, or selectors you own
    │   (for normal declarations a layered rule never beats an unlayered one,
    │   so layers help only when every competing rule can enter the layer order)
    │   └── Immutable external boundary? Use one property-scoped !important on
    │       the app class and document the boundary; don't copy its ID chain.
    │       If the foreign declaration is itself !important, specificity decides
    │       between important declarations, so put the app's important
    │       declaration in a layer: a layered important declaration beats an
    │       unlayered one regardless of specificity
    └── No → Don't use !important
```

### Should I use px or rem?

```
Should this scale with user font preferences?
├── Yes → Use rem
│   Examples: font-size, spacing between text blocks (margin, gap), padding
│   around text in a control, media queries
└── No → Use px
    Examples: borders, border-radius, box-shadows, fixed visual details
```

### Should I use shorthand?

```
Am I intentionally setting ALL related properties?
├── Yes → Shorthand is fine
└── No → Use longhand to avoid unintentional resets
    Shorthand already wiped a value you need? → Replace the shorthand with
    the longhands you meant to set. Do not re-declare the lost property
    after the shorthand; that hides the cause. Name the reset properties
    in the rationale.
```

### Should component have margin?

```
Is this a layout component (grid, stack, container)?
├── Yes → Margin/gap is appropriate
└── No → Delete the margin declaration (do not reset it to 0; that is an
    undoing style) and move spacing to the parent or a utility class
```

### Should I hide this visually?

```
Does the hidden content ever receive focus or become visible?
├── No → Immutable utility (.u-sr-only with !important)
└── Yes → Stateful pattern: no !important on hiding properties,
    one focus rule restores every hiding property, inline size bounded
    by the viewport, and a forced-colors rule that uses system colors
```

### @extend or mixin?

```
Are these selectors thematically related (same component)?
├── Yes → @extend might be acceptable
└── No → Use mixin (safer, doesn't disrupt source order)
```

### How should I refactor this CSS?

```
Step 1: Identify - Is this frequently used and problematic?
├── Yes → Continue
└── No → Skip refactoring, focus elsewhere

Step 2: Isolate - Build new version separately
├── Use CodePen/jsFiddle
├── Rebuild with flat class selectors: no IDs, no element qualifiers,
│   no nesting past 3 levels
└── Don't build on top of existing CSS

Step 3: Implement - Reintegrate carefully
├── Component fixes → component's partial
├── Existing reactive !important overrides → make each override win by
│   source order, self-chaining, or a layer (only when every competing
│   rule can enter the layer order), then delete the !important
└── Legacy conflicts → shame.css

Suspected dead CSS? → Add a beacon (unique background-image URL) to each
suspect selector whose matched elements get no background image from any
rule (check computed styles in every state), monitor production logs for
2-3 months, then treat zero-request selectors as deletion candidates
and remove them in small, reversible increments. Zero requests is evidence,
not proof: caches, CSP, and service workers can hide requests. Coverage tools
miss logged-in pages and interaction-only states.
```

## Summary Checklist

Before committing CSS, verify:

- [ ] Classes follow single responsibility (structure separate from cosmetics)
- [ ] No ID selectors for styling
- [ ] Reactive !important appears only as a documented, property-scoped last resort at an immutable external boundary
- [ ] Components have no margin (spacing controlled by parent)
- [ ] Using rem for font-size and scalable spacing
- [ ] Using px for borders, shadows, and fixed visual elements
- [ ] Longhand properties when only setting one value
- [ ] No deep nesting (4+ levels)
- [ ] No qualified selectors (e.g., `ul.nav`)
- [ ] Layout algorithm appropriate for context (Flow, Flex, Grid)
- [ ] Accessible color contrast ratios
- [ ] Hidden content that receives focus uses the stateful pattern (see "Should I hide this visually?"), never `display: none`
- [ ] Focus indicators do not rely on `box-shadow` alone (forced-colors mode removes it); `outline` is the recommended indicator
- [ ] Fixed or absolutely positioned controls fit a 320 CSS px viewport (400% zoom) without horizontal scroll
- [ ] Semantic HTML before adding ARIA
