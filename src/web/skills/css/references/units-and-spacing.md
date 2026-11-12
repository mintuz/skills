# Units and spacing

Read this when you choose a unit, set a type size or line height, write a media query, or add
space between components.

## `rem` or `px`

Ask: should this value grow when the reader raises their browser's default text size?

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

A media query in `rem` (or `em`) resolves against the browser's initial font size, so it follows
the reader's setting whatever the root element says.

## Line height

Write `line-height` without a unit: `line-height: 1.5`, not `24px` or `1.5rem`. A child inherits
the number and multiplies its own font size by it; a length is inherited as the parent's computed
value and stops fitting when the child's font size differs.

## The scale

Hold spacing and type sizes as custom properties in `rem`, and use them through `var()`:

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

.card {
  padding: var(--space-md);
  font-size: var(--text-base);
}
```

When a request names a size in pixels, find the scale step that equals it and use the step. Add a
step only when none fits, and add it to the scale, not to the component. A number with no step
behind it (`top: 37px`) is a magic number.

Do not set `html { font-size: 62.5%; }` to make `1rem` equal `10px`. Third-party components that
expect a 16px root render at the wrong size, some screen readers use the root size, and every
`rem` in the codebase silently changes meaning.

## Spacing belongs to the parent

A component sets no margin outside its own box. Outer margin adds space the component cannot see,
and every context then needs an override.

```css
/* Wrong: the card decides how far it sits from its neighbours */
.card {
  margin-bottom: var(--space-lg);
}
```

The layout that holds the components owns the space between them:

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

When a component already has an outer margin, delete the declaration. Do not set it to `0`, do
not add a `:last-child` reset, and do not add a context override such as `.sidebar .card
{ margin-bottom: 0; }`: each of these is an undoing style that leaves the cause in place.

Use one direction for spacing margins, set by the parent: the stack rule above uses
`margin-block-start` on every child except the first. Do not write a global `* + *` rule: it puts
a margin on every element on the page, components included, through the broadest selector there
is.

## Margin collapse

Margins collapse in flow layout only.

| Rule | Detail |
| --- | --- |
| Only vertical | horizontal margins never collapse |
| Only adjoining | nothing between them: block siblings, a parent and its first or last child, or an empty block's own top and bottom margins |
| Two positive margins | collapse to the larger |
| Negative margins | the largest positive plus the most negative; two negatives collapse to the most negative |
| Parent and child | their margins can merge |

What stops a collapse, for the relationship it affects:

- padding or border between the two margins;
- content or a fixed height between them;
- `overflow: hidden`, `auto` or `scroll` on the parent, or `display: flow-root`: a new block
  formatting context stops parent-and-child collapse, and siblings inside the parent still collapse
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

The same property behaves differently under each. Choose the algorithm the layout needs: flow for
documents, flexbox for one axis, grid for two.

- `z-index` applies to positioned elements and to flex and grid items. On a block in flow layout
  with `position: static` it does nothing; add `position: relative` to give it a stacking
  context.
- In a flex column, `margin: 20px 0` on each item gives 40px between items, not 20px.
- An image in flow layout sits on the text baseline and leaves a gap below it. Remove it with
  `img { display: block; }`.
