# Implementation constraints

Apply every matching constraint to authored or reviewed utility markup.

## Ownership

- Reuse the repository's existing tokens and utilities before extending the theme.
- Use semantic tokens for durable product meaning such as surfaces, foregrounds, actions, borders, and status.
- Use palette utilities when the literal palette value is the contract, and arbitrary values for genuine one-offs tied to a specific requirement.
- Keep feature-specific class strings with the component. Share a style definition only when current callers use the same semantic contract.
- Let utilities style controlled markup; use a component class or custom CSS layer when external markup, selectors, or a stable CSS API owns the relationship.

## Detection and composition

- Store each class candidate as a complete source string.
- Map runtime inputs to finite class maps or typed variants.
- Preserve the repository's formatter or class-order convention.
- Put caller overrides last only where the component API promises overrides, and verify the merge helper recognizes the conflicts.
- Keep responsive, theme, state, `aria-*`, and `data-*` variants beside the utility they modify.

## Responsive layout

- Start with the smallest supported viewport and add breakpoint or container variants when the contract changes.
- Use the parent layout owner for relationships among siblings and the component for its internal layout.
- Test every touched boundary plus the smallest and largest supported sizes.
- Exercise long, short, missing, localized, and user-generated content before adding fixed dimensions.

## States and accessibility

- Start with native semantic elements and browser behavior.
- Give every interactive control a visible `focus-visible` treatment and preserve usable forced-colors behavior.
- Represent applicable hover, active, disabled, loading, error, selected, expanded, open, and closed states.
- Pair color meaning with text, iconography, or semantics; verify foreground and surface tokens together in every theme.
- Keep touch targets, reflow, zoom, keyboard order, accessible names, and reduced motion inside the utility contract.
- Use accessible primitives for composite widgets; utility classes provide presentation rather than interaction semantics.

## Theme integrity

- Change paired surface and foreground tokens together.
- Define every semantic token in every supported theme.
- Keep the theme marker, storage, server rendering, and first-paint strategy under one application owner.
- Verify native form controls and browser UI use the intended color scheme where relevant.

## Generated output

- Confirm representative classes appear in the production CSS.
- Cover every package containing class strings with the installed version's source-detection mechanism.
- Measure output before adding safelists, broad source paths, or plugins.
- Treat formatter, merge-helper, and animation-plugin compatibility as versioned dependencies of Tailwind.

## Review ledger

For every scoped component, account for:

- base, variant, size, state, responsive, and theme classes;
- source detection and generated rules;
- token and class ownership;
- cascade and merge behavior;
- semantic HTML and accessible interaction;
- rendered behavior at each required boundary.
