# Cascade, specificity and shorthands

## Specificity

| Selector | Specificity | Example |
| --- | --- | --- |
| Element | (0,0,1) | `div` |
| Class, attribute, pseudo-class | (0,1,0) | `.btn`, `[type="submit"]`, `:hover` |
| ID | (1,0,0) | `#header` |

Specificity compares column by column, so no number of classes beats one ID.

- Write `.nav`, not `ul.nav`. An element qualifier raises specificity and ties the class to one
  element.
- Give a deeply nested element its own class instead of a chain such as
  `div.sidebar .widget-area ul.links li a`.
- If you own an ID rule and the markup cannot take a class, lower its specificity with an
  attribute selector: `[id="sidebar"] .btn` is (0,2,0). This works only on a rule you can edit. It
  does not beat a foreign `#sidebar .btn` (1,1,0).

## When your rule loses

Try these in order. Stop at the first that works.

1. **Source order.** If both rules have equal specificity, move your rule after the other.
2. **Your own selectors.** If you own the winning rule, simplify it. Otherwise raise yours by
   self-chaining the class: `.btn.btn` is (0,2,0) and needs no markup change.
3. **Cascade layers**, only when every competing rule can enter the layer order.
4. **The boundary exception**, only when the foreign stylesheet, its selector, the load order and
   the markup cannot change, and the foreign declaration is a normal author rule. Write one
   property-scoped `!important` on the app class, with a comment that names the boundary and says
   when to remove it:

   ```css
   .checkout__submit {
     /* The provider's "#checkout .button" rule outranks this class, loads after it, and
        cannot be edited, moved or layered. Remove the !important if the provider drops it. */
     color: var(--colour-brand) !important;
   }
   ```

   Do not copy the foreign ID chain (`#checkout .checkout__submit`). It puts an ID selector in app
   styles and starts a specificity race with the vendor's next release.

   If the foreign declaration is itself `!important`, the declaration above loses: specificity
   decides between two unlayered important declarations. Put the app's important declaration in a
   layer instead. A layered important declaration beats an unlayered one whatever its specificity.
   This holds among author stylesheets in one encapsulation context (no shadow DOM boundary between
   them). Inline `style` attributes, shadow-tree styles and user-agent or user styles are outside
   this ordering.

A reactive `!important` is one added to win a conflict. In code you own it is a defect: make the
rule win by steps 1 to 3, then delete the `!important`.

## Proactive `!important`

An immutable utility uses `!important` on purpose, so that it always applies:

```css
.u-hidden {
  display: none !important;
}
```

Keep these. Do not put such a utility on an element whose state changes it. Do not override one:
the override must itself be `!important` and win a second contest.

## Cascade layers

`@layer` ranks rules before specificity. For normal declarations:

1. Unlayered styles beat every layered style.
2. Among layers, the later-declared layer wins.
3. Specificity and source order apply only within one layer, or among unlayered declarations.

```css
@layer reset, base, components;

@layer components {
  .btn { color: var(--colour-brand); } /* beats base and reset, whatever their specificity */
}

.btn { color: var(--colour-text); } /* unlayered: beats every layer */
```

For `!important` declarations the order reverses: an important declaration in an earlier layer
beats one in a later layer, and both beat an unlayered important declaration.

A layered normal app rule therefore cannot beat an unlayered third-party rule. Layers fix a
normal-declaration conflict only between styles you can place in layers. To put a third-party
stylesheet you cannot edit into a layer, use `@import url("vendor.css") layer(vendor);`. This is
the only permitted CSS `@import`. It adds a request that cannot start until the importing sheet
arrives. State this cost when you use it.

## Shorthands

A shorthand sets every property it covers. Each property you do not name goes back to its initial
value:

- `background` resets `background-color`, `background-image` (`none`), `background-position`
  (`0% 0%`), `background-size` (`auto`), `background-repeat` (`repeat`), `background-attachment`
  (`scroll`), `background-origin` and `background-clip`.
- `font` resets `font-style`, `font-variant`, `font-weight`, `font-stretch`, `font-size`,
  `line-height` and `font-family`.

Use a shorthand only when you mean every value it sets, for example `padding: var(--space-md);`
for all four sides. When a shorthand has wiped a value, do not re-declare the lost property after
it (`background-image: …` after `background: …`). Do not move the lost value into the shorthand
(`font: small-caps 600 …`). Both leave the rule resetting every other property it does not name.
