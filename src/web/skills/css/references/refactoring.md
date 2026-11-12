# Refactoring, dead CSS and preprocessors

Read this before you delete selectors, or write Sass or another preprocessor. The refactoring
steps are in `SKILL.md`.

## Suspected dead CSS

Delete a selector only on evidence from production, never because a search did not find it.

1. **Search first, and distrust a miss.** Search the markup, templates and scripts for each
   class. A class built at run time (`` `promo-banner--${season}` ``, `'btn-' + size`, a class
   list from data) does not appear as text, and pages rendered from content outside the
   repository (a content management system, emails, another app) never appear in the search. A
   class found in use stays.
2. **Beacon each suspect** that no search proves used. Add a background image with a unique URL
   to its rule, so a production request shows the selector matched:

   ```css
   .legacy-modal {
     /* Usage beacon, added 4 Nov 2026. Delete this rule only after the logs show no request
        for it for two to three months and one test request has been seen to arrive. */
     background-image: url("/beacon.gif?selector=legacy-modal");
   }
   ```

   Serve a transparent 1x1 GIF at that URL. Only beacon a selector whose matched elements get no
   background image from any rule, in any state (check the computed styles): a beacon would
   replace a real image. Where one does, leave the image alone and record usage another way, such
   as a build-time class-usage report or a script that reports matched selectors.
3. **Confirm delivery.** See one beacon request reach the server logs before trusting silence.
   Caches, a Content Security Policy `img-src` rule and service workers can drop beacon requests.
4. **Monitor** production logs for two to three months. A selector with zero requests is then a
   deletion candidate. Zero requests is evidence, not proof: coverage tools and beacons both miss
   pages behind a login and states only an interaction reaches.
5. **Delete in small, reversible steps**, one selector or one feature at a time, and watch for
   regressions after each.

When a person asks you to delete selectors now, do steps 1 and 2, delete nothing that a search
cannot prove unused, and tell them what you found, what you added, and what evidence would allow
each deletion.

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
mixin for rules that are only similar by chance. Repetition in compiled output is fine (gzip
removes it); repetition in source is the problem. Mixins do not move rules in source order and
do not group unrelated selectors.

```scss
// Variants of one component: @extend may be used
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
.site-footer {
  @include clearfix;
}
```

Write full class names. Do not build them with `&` concatenation (`.card { &-header {} }`),
because `.card-header` then cannot be found by a search. Use `&` only for pseudo-classes
(`&:hover`), pseudo-elements (`&::before`) and state classes (`&.is-active`).

## Loading stylesheets

Do not use CSS `@import` to load stylesheets: the browser cannot request the imported sheet until
the importing sheet arrives, and rendering waits for the whole chain. Use one `<link>` element per
stylesheet, which load in parallel, or concatenate the files in a build step. The exception is
`@import url(…) layer(…)` to put a third-party sheet you cannot edit into a cascade layer (see
`cascade.md`); state its cost when you use it.
