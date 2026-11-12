# Patterns

Read this before you write a new class, a modifier, a utility, or styles that hide content.

## One job per class

Keep structure (box, spacing, layout) and cosmetics (colour, theme) in separate classes.

```css
/* Wrong: one class owns the box and the theme */
.promo {
  padding: var(--space-lg);
  background-color: var(--colour-brand);
  color: #ffffff;
}

/* Right */
.box {
  padding: var(--space-lg);
}
.theme-primary {
  background-color: var(--colour-brand);
  color: #ffffff;
}
```

A change to one job then leaves the other untouched, and the classes recombine in new contexts.

## Extend with a modifier

When one context needs a variant, add a modifier class. Do not change the base class for that
context.

```css
.btn {
  padding-block: var(--space-sm);
  padding-inline: var(--space-md);
}

.btn--large {
  padding-block: var(--space-md);
  padding-inline: var(--space-lg);
}

.btn--primary {
  background-color: var(--colour-brand);
  color: #ffffff;
}
```

Keep base classes small. If a base class does not fit a context, stop using it there rather than
bending it. A defect in the base class itself is fixed in the base class.

## Prefixes

| Prefix | Kind | Rule |
| --- | --- | --- |
| `o-` | object: a layout pattern | treat as a constant once written |
| `u-` | utility: one declaration, one purpose | treat as a constant; its declarations are `!important` |
| `_` | hack: a temporary fix | not reused; record what removes it |

A class whose look changes with state (a skip link, a disclosure) is a component, not a `u-`
utility, whatever it does.

## Hiding content

Ask: does the hidden content ever receive focus or become visible?

**Never.** Use the screen-reader utility. It is immutable, so its declarations are `!important`.
Never put it on an element that can receive focus: a `:focus` rule could beat it only with its
own `!important` and enough specificity or later source order, a second contest.

```css
.u-sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip-path: inset(50%) !important;
  white-space: nowrap !important;
  border-width: 0 !important;
}
```

**Yes, on focus.** Use a stateful component, such as this skip link: hidden until it receives
focus, then a visible, fixed control.

```css
.skip-link {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.skip-link:focus-visible {
  box-sizing: border-box; /* max-inline-size includes the padding */
  position: fixed;
  inset-block-start: var(--space-md);
  inset-inline-start: var(--space-md);
  z-index: 1000;
  inline-size: auto;
  block-size: auto;
  max-inline-size: calc(100vw - 2 * var(--space-md)); /* fits a 320 CSS px viewport at 400% zoom */
  padding-block: var(--space-sm);
  padding-inline: var(--space-md);
  margin: 0;
  overflow: visible;
  clip-path: none;
  white-space: normal;
  background-color: #1a1a1a;
  color: #ffffff;
  font-size: var(--text-base);
  outline: 3px solid #ffbf47;
  outline-offset: 2px;
}

@media (forced-colors: active) {
  .skip-link:focus-visible {
    background-color: Canvas;
    color: LinkText;
    outline-color: Highlight;
  }
}
```

- Do not hide it with `display: none`, `visibility: hidden` or `font-size: 0`: these take it out
  of the accessibility tree or the tab order. Do not hide it with off-screen coordinates
  (`top: -40px`, `left: -9999px`, `translateY(-100%)`): the focused control can land outside a
  zoomed or narrow viewport.
- Use no `!important` in either rule. The focus rule restores every property the base rule set
  to hide it.
- Use an `outline` or a border for the focus indicator. Forced-colours mode removes
  `box-shadow` and replaces author colours; name system colours (`Canvas`, `CanvasText`,
  `LinkText`, `Highlight`) in a `@media (forced-colors: active)` rule.
- Use `rem` or the scale for its text and padding, so it grows with the reader's text size.

## Contrast

Text against its background needs a contrast ratio of at least 4.5:1, or 3:1 for large text
(24px, or 18.66px bold). A control's boundary and a focus indicator need 3:1 against what is
next to them (WCAG 2.2, success criteria 1.4.3 and 1.4.11). State the pairs you checked.

## Semantic HTML first

Style the native element (`button`, `a`, `details`, `dialog`, `label`) before you add an ARIA
role to a `div` and style that.
