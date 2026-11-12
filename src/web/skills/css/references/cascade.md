# Cascade, specificity and shorthands

Read this when a rule loses to another, before you write `!important`, when a selector uses an ID
or an element qualifier, when a third-party stylesheet is involved, or when a shorthand has reset
a value.

## Specificity

| Selector | Specificity | Example |
| --- | --- | --- |
| Element | (0,0,1) | `div` |
| Class, attribute, pseudo-class | (0,1,0) | `.btn`, `[type="submit"]`, `:hover` |
| ID | (1,0,0) | `#header` |

Specificity compares column by column, so no number of classes beats one ID.

- Style with classes. Do not style with an ID selector.
- Do not qualify a class with an element (`ul.nav`): it raises specificity and ties the class to
  one element. Write `.nav`.
- Do not nest selectors four or more levels deep (`div.sidebar .widget-area ul.links li a`). Give
  the element its own class.
- If you own an ID rule and the markup cannot take a class, lower its specificity with an
  attribute selector: `[id="sidebar"] .btn` is (0,2,0). This works only on a rule you can edit; it
  does not beat a foreign `#sidebar .btn` (1,1,0).

## When your rule loses

Try these in order. Stop at the first that works.

1. **Source order.** Move your rule after the one it must beat, when both have equal specificity.
2. **Your own selectors.** Simplify the winning rule if you own it, or raise yours by
   self-chaining the class: `.btn.btn` is (0,2,0) and needs no markup change.
3. **Cascade layers**, only when every competing rule can enter the layer order (see below).
4. **The boundary exception**, only when all of these hold: the foreign stylesheet, its selector,
   the load order and the markup cannot change; the foreign declaration is a normal author rule.
   Then write one property-scoped `!important` on the app class, with a comment that names the
   boundary and says when to remove it:

   ```css
   .checkout__submit {
     /* The provider's "#checkout .button" rule outranks this class, loads after it, and
        cannot be edited, moved or layered. Remove the !important if the provider drops it. */
     color: var(--colour-brand) !important;
   }
   ```

   Do not copy the foreign ID chain (`#checkout .checkout__submit`): it puts an ID selector in
   app styles and starts a specificity race with the vendor's next release.

   If the foreign declaration is itself `!important`, the class declaration above loses, because
   specificity decides between two unlayered important declarations. Put the app's important
   declaration in a layer instead: a layered important declaration beats an unlayered one
   whatever its specificity. This holds among author stylesheets in one encapsulation context
   (no shadow DOM boundary between them); inline `style` attributes, shadow-tree styles and
   user-agent or user styles sit outside this ordering.

An `!important` you find in code you own, added to win a conflict (a reactive `!important`), is a
defect: make the rule win by steps 1 to 3, then delete the `!important`.

## Proactive `!important`

An immutable utility uses `!important` on purpose, so that it always applies:

```css
.u-hidden {
  display: none !important;
}
.u-text-center {
  text-align: center !important;
}
```

Leave these in place. Do not put such a utility on an element whose state changes it, and do not
override one: an override must itself be `!important` and win a second contest.

## Cascade layers

`@layer` ranks rules before specificity. For normal declarations:

1. Unlayered styles beat every layered style.
2. Among layers, the later-declared layer wins.
3. Specificity and source order apply only after that: within one layer, or among unlayered
   declarations.

```css
@layer reset, base, components;

@layer components {
  .btn { color: var(--colour-brand); } /* beats base and reset, whatever their specificity */
}

.btn { color: var(--colour-text); } /* unlayered: beats every layer */
```

For `!important` declarations the order reverses: an important declaration in an earlier layer
beats one in a later layer, and both beat an unlayered important declaration.

So a layered normal app rule cannot beat an unlayered third-party rule. Layers fix a
normal-declaration conflict only between styles you can place in layers. To place a third-party
stylesheet you cannot edit into a layer, import it with `@import url("vendor.css") layer(vendor);`.
This is the one use of CSS `@import` here: it adds a request the browser cannot start until the
importing sheet arrives, so say so when you use it.

## Shorthands

A shorthand sets every property it covers. The ones you do not name go back to their initial
values:

```css
.card {
  background: #fff;
}
/* sets background-color: #fff, and also resets background-image: none,
   background-position: 0% 0%, background-size: auto, background-repeat: repeat,
   background-attachment: scroll, background-origin and background-clip */
```

`font` does the same to `font-style`, `font-variant`, `font-weight`, `font-stretch`, `font-size`,
`line-height` and `font-family`.

- Use the longhand when you mean one value: `background-color: var(--colour-brand);`, not
  `background: var(--colour-brand);`.
- Use a shorthand only when you mean every value it sets: `padding: var(--space-md);` for all
  four sides.
- When a shorthand has wiped a value, replace the shorthand with the longhands you meant to set.
  Do not re-declare the lost property after it (`background-image: …` after `background: …`), and
  do not move the lost value into the shorthand (`font: small-caps 600 …`): both leave the rule
  resetting every other property it does not name. Name the properties the shorthand reset when
  you explain the fix.
