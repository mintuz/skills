# Dead CSS, code smells and preprocessors

The refactoring steps and the deletion procedure are in `SKILL.md`. This file adds detail.

## Suspected dead CSS

- A search misses a class built at run time (`` `promo-banner--${season}` ``, `'btn-' + size`, a
  class list from data). It also misses pages rendered from content outside the repository (a
  content management system, emails, another app).
- A beacon is a background image with a unique URL, so a production request shows that the
  selector matched:

  ```css
  .legacy-modal {
    /* Usage beacon, added 4 Nov 2026. Delete this rule only after the logs show no request
       for it for two to three months and one test request has been seen to arrive. */
    background-image: url("/beacon.gif?selector=legacy-modal");
  }
  ```

  Serve a transparent 1x1 GIF at that URL. Before you add a beacon, check the computed styles: no
  rule may give the matched elements a background image in any state, because the beacon would
  replace it.
- Coverage tools and beacons both miss pages behind a login and states that only an interaction
  reaches.
- Delete one selector or one feature at a time, and watch for regressions after each step.
- If a person asks you to delete selectors now, search and add beacons, delete nothing that a
  search cannot prove unused, and report what you found, what you added, and what evidence would
  allow each deletion.

## Code smells

| Smell | Problem | Fix |
| --- | --- | --- |
| Unexplained `!important` | starts a specificity race | restructure the cascade, or document an immutable external boundary |
| ID selector | no number of classes beats one ID | a class; `[id="x"]` only on an ID rule you own whose markup cannot take a class |
| Shorthand that resets values | sets properties you did not name | longhands |
| Broad selector (`header {}`, `* + *`) | applies to too much | a class |
| Magic number (`top: 37px`) | no one knows why | a scale step, a relative value or a named custom property |
| Undoing style | a rule that cancels a declaration you wrote elsewhere (`margin-bottom: 0` against your own margin, `border: none` against your own border) | delete the original declaration and add styles only where they are wanted; removing a user-agent default on a base class is not an undoing style |
| Qualified selector (`ul.nav`) | ties a class to one element | `.nav` |
| Nesting four or more levels deep | hard to follow, high specificity | a flat class |
| `px` for `font-size` | ignores the reader's text-size setting | `rem` |
| Complex selector | hard to reason about | a dedicated class |
| `@extend` across unrelated rules | groups selectors and moves rules in the output | a mixin |
| `&-bar` class concatenation | the class name cannot be searched | the full class name |
| Margins in both directions | spacing is hard to predict | one direction, set by the parent |

## Preprocessors

Use `@extend` only for rules that are the same for a reason: variants of one component. Use a
mixin for rules that are similar by chance. Repetition in compiled output is acceptable (gzip
removes it); repetition in source is not.

```scss
// Variants of one component: @extend is permitted
%btn-base {
  padding-block: var(--space-sm);
  padding-inline: var(--space-md);
  border: none; // removes the user-agent border; not an undoing style
}
.btn {
  @extend %btn-base;
}

// Unrelated rules that share a pattern: a mixin
@mixin clearfix {
  &::after {
    content: "";
    display: table;
    clear: both;
  }
}
.site-header {
  @include clearfix;
}
```

Write full class names. Do not build them with `&` concatenation (`.card { &-header {} }`): a
search then cannot find `.card-header`. Use `&` only for pseudo-classes (`&:hover`),
pseudo-elements (`&::before`) and state classes (`&.is-active`).

## Loading stylesheets

CSS `@import` delays the imported sheet until the importing sheet arrives, and rendering waits for
the whole chain. Use one `<link>` element per stylesheet, which load in parallel, or concatenate
the files in a build step. The only exception is `@import url(…) layer(…)` for a third-party sheet
you cannot edit (see `cascade.md`). State its cost when you use it.
