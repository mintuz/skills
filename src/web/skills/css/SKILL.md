---
name: css
description: "USE WHEN writing, fixing or reviewing plain CSS or Sass for a web page, even a one-line style change, including a rule that loses to another, a third-party stylesheet you cannot edit, type sizes and units, spacing between components, shorthands, a skip link or other hidden and focus styles, or deleting styles that look unused; NOT WHEN the project uses Tailwind (tailwind.config.js, utility classes, CVA variants, Tailwind theme tokens); produces CSS that wins the cascade without ID selectors or reactive !important, scales with the reader's text size, keeps spacing in the parent and deletes styles only on evidence."
---

# CSS

Write CSS that wins the cascade without ID selectors or reactive `!important`, scales with the
reader's text size, keeps spacing in the parent, and deletes nothing on a guess.

## Before you edit

1. Read the stylesheets the change touches, the custom-property scale, the utilities, and any
   README rule about load order or files you must not edit.
2. If the person asks for a review or findings, report and change nothing
   (`principle-investigate-read-only`). If the request covers all stylesheets, state which files
   and selectors you covered and which you left out (`principle-state-the-scope`).
3. Take sizes and colours from the custom-property scale. When the request names a pixel value,
   use the step that equals it. Add a step to the scale only when none fits; never put a raw
   number in a component (`principle-reuse-before-building`, `principle-derive-from-one-owner`).

## When a rule loses to another

Read [cascade.md](references/cascade.md) before you write `!important`, touch a selector with an
ID, or work around a third-party stylesheet.

- Style with classes only: no ID selectors, no element-qualified classes (`ul.nav`), no nesting
  four or more levels deep.
- Fix a conflict in this order and stop at the first that works: source order; your own
  selectors (simplify the rule you own, or self-chain `.btn.btn`); cascade layers, only when every
  competing rule can enter the layer order.
- When the winning rule is in a stylesheet you cannot edit, and its load order and markup cannot
  change, write one `!important` on the single property that loses, on your own class. Change no
  other file. Add a comment beside it that names the boundary and says when to remove the
  `!important` (for example, when the provider drops or changes its rule). Do not copy the foreign ID selector into your CSS. If the foreign declaration is
  itself `!important`, put yours in a cascade layer instead.
- When you find a reactive `!important` in code you own, make the rule win another way, then
  delete the `!important` (`principle-fix-root-causes`). Leave the proactive `!important` on
  `u-` utilities in place.
- When you explain the fix, say why the other rule won (for example, its ID outranks your class)
  and why yours now wins. For the boundary exception, say that an important declaration beats a
  normal one whatever its specificity or source order, and name the fixed stylesheet, load order
  and markup as the reason for the exception.

## Units

Read [units-and-spacing.md](references/units-and-spacing.md) when you choose a unit.

- Use `rem` or a scale step for `font-size`, spacing between blocks of text, padding around text
  in a control, and media queries: `@media (min-width: 48rem)`, not `768px`.
- Use `px` for borders, `border-radius` and shadows.
- Write `line-height` without a unit. Never set `html { font-size: 62.5%; }`.
- When you explain a unit change, say that `px` font sizes ignore the reader's text-size setting
  and `rem` follows it, and that a unitless line height multiplies each element's own font size.

## Spacing between components

- A component sets no margin outside its own box. The parent owns the space: `gap` on a grid or
  flex parent, or a stack rule `.stack > * + * { margin-block-start: … }`.
- When a component has an outer margin, delete the declaration. Do not set it to `0`, add a
  `:last-child` reset, or add a context override such as `.sidebar .card { margin-bottom: 0; }`
  (`principle-subtract-before-you-add`).
- When you explain the fix, name the cause of each spacing problem, for example a parent with no
  `gap` or a component's own outer margin.

## Shorthands

- Use the longhand when you set one value: `background-color`, not `background`. Use a shorthand
  only when you mean every value it sets.
- When a shorthand has wiped a value, replace the shorthand with the longhands you meant. Do not
  re-declare the lost value after it, and do not fold the lost value into the shorthand
  (`principle-fix-root-causes`).
- When you explain the fix, name the properties the shorthand reset, and say that a shorthand
  resets every property it covers but does not name to its initial value.

## Hidden content and focus

Read [patterns.md](references/patterns.md) before you hide anything or style focus.

- Text hidden permanently uses the `.u-sr-only` utility. Never put it on an element that can
  receive focus.
- A control that appears on focus, such as a skip link, is a stateful component with no
  `!important`:
  - Hide it by clipping it to 1px (`clip-path: inset(50%)`). Never use `display: none`,
    `visibility: hidden`, or off-screen coordinates such as `top: -40px` or `translateY(-100%)`.
  - Its focus rule restores every hiding property and shows an `outline`, not only a
    `box-shadow`.
  - Its focus rule bounds its width to the viewport (`max-inline-size: calc(100vw - 2rem)`), so
    it fits a 320 CSS px viewport at 400% zoom.
  - A `@media (forced-colors: active)` rule gives it system colours.
- Keep a contrast ratio of at least 4.5:1 for text, and 3:1 for large text, control boundaries
  and focus indicators.

## New classes

Read [patterns.md](references/patterns.md) before you add a class. Read
[refactoring.md](references/refactoring.md) before you write Sass.

- Give each class one job: keep structure apart from cosmetics. Add a variant as a modifier; do
  not change a base class for one context. Use the `u-` prefix only for immutable utilities.
- Load each stylesheet with its own `<link>`, not with CSS `@import`.

## Refactoring a stylesheet

Refactor in three steps. Land each step as a small change that can be reverted on its own; do not
freeze deploys or rewrite the whole stylesheet.

1. Identify: refactor CSS that is used often and causes problems. A selector with an ID, an
   element qualifier or deep nesting, and a rule overridden with `!important`, already cause
   problems. Skip stable rules and code that is about to be removed, and say why you skip it. For
   CSS that may be dead, plan a usage measurement on production traffic (a beacon per selector,
   logged for two to three months) before any deletion, as in
   [Deleting styles that look unused](#deleting-styles-that-look-unused).
2. Isolate: build each replacement in its own partial, not on top of the existing rules. Give
   every replacement flat class selectors: no IDs, no element qualifiers, no nesting past three
   levels.
3. Implement: put a component's fix in that component's partial. For each reactive `!important`,
   make the rule win by source order, self-chaining, or a layer (only when every competing rule
   can enter the layer order), then delete the `!important`. Put a legacy conflict you cannot
   resolve yet in a separate, documented legacy-override file (`shame.css`), and record what
   allows its removal.

## Deleting styles that look unused

A class missing from a search is not proof that nothing uses it (`principle-observe-dont-infer`).
Read [refactoring.md](references/refactoring.md) first.

1. Search the markup, templates and scripts, including class names built at run time (template
   strings, concatenation). A class you find in use stays; name the file and the expression that
   builds it.
2. If pages also come from content outside the repository, or the search cannot settle it, delete
   nothing, and say that the repository search cannot cover those pages. Add a usage beacon to
   each suspect rule, with a comment that says when the rule may be deleted:
   `background-image: url("/beacon.gif?selector=<class>");`. Add a beacon only where no rule
   gives the matched elements a background image; where one does, keep the image and record usage
   another way, such as a build-time class-usage report or a script that reports matched
   selectors.
3. Delete a rule only after two to three months of production logs show no request for it, and
   only after one test request has been seen to arrive. Zero requests is evidence, not proof:
   caches, a Content Security Policy `img-src` rule and service workers can drop beacon requests
   (`principle-gaps-are-not-passes`). Delete in small steps that can each be reverted
   (`principle-sequence-verifiable-units`).
4. In the report, give for each suspect rule:
   - whether you kept it and why, quoting the file and the expression that builds a run-time
     class and its default value;
   - what you added to measure it;
   - the evidence that would allow its deletion: the measurement above, the caveat that zero
     requests is not proof, and deletion in small, reversible steps.

   Do not call a selector unused because a search did not find it; say that the search could not
   show it in use.

## Finish

Check the CSS you wrote against every rule above. In the report, name each file you changed, say
what changed and why it works, and name the values you deliberately kept (for example, a `px`
border). If you did not see the page in a browser, say that the rendering was not checked
(`principle-label-the-evidence`).
