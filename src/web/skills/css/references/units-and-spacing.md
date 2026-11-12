# Units and spacing

## `rem` or `px`

Ask: should this value grow when the reader raises the browser's default text size?

| Use `rem` | Why |
| --- | --- |
| `font-size` | the reader's text-size preference must apply |
| Margins and gaps between blocks of text | larger text needs proportional space |
| Padding around text in a control | the hit area stays in proportion to its label |
| Media queries | larger text leaves less room, so the layout must switch sooner |
| Any other spacing that should scale | proportions hold at every text size |

| Use `px` | Why |
| --- | --- |
| Border widths | a border should not thicken because text grew |
| `border-radius`, box shadows | visual detail, not content |
| Horizontal padding of a wide text block | scaling it takes line width from the text |
| Other fixed visual details | they should not scale |

A media query in `rem` or `em` resolves against the browser's initial font size, so it follows the
reader's setting whatever the root element says.

## Line height

A child inherits a unitless `line-height` as a number and multiplies its own font size by it. A
length (`24px`, `1.5rem`) is inherited as the parent's computed value and stops fitting when the
child's font size differs.

## The scale

Hold spacing and type sizes as `rem` custom properties, and use them through `var()`:

```css
:root {
  --space-xs: 0.25rem; /* 4px */
  --space-sm: 0.5rem; /* 8px */
  --space-md: 1rem; /* 16px */
  --space-lg: 1.5rem; /* 24px */
  --space-xl: 2rem; /* 32px */

  --text-sm: 0.875rem; /* 14px */
  --text-base: 1rem; /* 16px */
  --text-lg: 1.25rem; /* 20px */
}
```

Add a new step to the scale, not to the component. A number with no step behind it (`top: 37px`)
is a magic number.

`html { font-size: 62.5%; }` makes `1rem` equal `10px`. Third-party components that expect a 16px
root then render at the wrong size, some screen readers use the root size, and every `rem` in the
codebase changes meaning.

## Spacing belongs to the parent

Outer margin on a component adds space the component cannot see, and every context then needs an
override. The layout that holds the components owns the space between them:

```css
.card-grid {
  display: grid;
  gap: var(--space-lg);
}

/* a stack in flow layout: one direction, set by the parent */
.stack > * + * {
  margin-block-start: var(--space-md);
}
```

A spacing utility on the element in the markup (`class="card u-mb-lg"`) is the other option.

A `0` value, a `:last-child` reset and a context override are undoing styles: each leaves the cause
in place.

Set spacing margins in one direction, from the parent, as the stack rule does. Do not write a
global `* + *` rule: it puts a margin on every element on the page, components included.

## Margin collapse

Margins collapse in flow layout only.

| Rule | Detail |
| --- | --- |
| Only vertical | horizontal margins never collapse |
| Only adjoining | nothing between them: block siblings, a parent and its first or last child, or an empty block's own top and bottom margins |
| Two positive margins | collapse to the larger |
| Negative margins | the largest positive plus the most negative; two negatives collapse to the most negative |
| Parent and child | their margins can merge |

These stop a collapse, for the relationship they affect:

- padding or border between the two margins;
- content or a fixed height between them;
- `overflow: hidden`, `auto` or `scroll` on the parent, or `display: flow-root`. A new block
  formatting context stops parent-and-child collapse. Siblings inside the parent still collapse
  with each other. `overflow: clip` creates no formatting context; add `display: flow-root` when
  you need one;
- flex or grid layout: the items' margins never collapse; they add up;
- floated or absolutely positioned elements: their margins never collapse.

## Layout algorithms

| Algorithm | Started by |
| --- | --- |
| Flow | the default for block and inline content |
| Flexbox | `display: flex` |
| Grid | `display: grid` |
| Positioned | `position: absolute` or `fixed` |

The same property behaves differently under each. Use flow for documents, flexbox for one axis and
grid for two.

- `z-index` applies to positioned elements and to flex and grid items. On a block in flow layout
  with `position: static` it does nothing. Add `position: relative` to give it a stacking context.
- In a flex column, `margin: 20px 0` on each item gives 40px between items, not 20px.
- An image in flow layout sits on the text baseline and leaves a gap below it. Remove the gap with
  `img { display: block; }`.
