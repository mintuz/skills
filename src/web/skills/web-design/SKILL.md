---
name: web-design
description: WHEN refining UI layout, typography, color, or polish; NOT code implementation; provides concise principles for intentional, legible design.
---

# Web Design

Aim for clear hierarchy, generous spacing, and restrained styling.

## Scope and Inputs

- Give design decisions, not implementation code: state the visual and state specification, and leave the component source, utility classes, and engineering choices to the engineer. Say so when a request asks for them.
- When a request conflicts with legibility or access, keep its intent: name each part you refuse, give the reason, and state the substitute treatment that delivers the same intent.
- Choose and name the values that are yours to choose: sizes, weights, spacing, radii, and breakpoints. A value you select is a decision, not an invention, so state it instead of deferring it to later testing.
- Never invent a product or brand fact, such as a brand colour, a surface colour, a price, or a measured result.
- When a decision needs a fact you were not given: name each blocking fact, state the constraint it must satisfy, give the decision as a condition, and say what to change if the condition fails. Never certify a result you cannot measure.

## Visual Hierarchy & Focus

- Group related elements by proximity and aligned edges, not as scattered, evenly spaced elements competing for attention.
- Build hierarchy with weight and size before colour: `font-weight: 600` and size changes beat random accent colours.
- Reduce noise: use spacing, background tints, or subtle dividers instead of heavy outlines and extra borders.

## Layout & Spacing

- Use a consistent 4px or 8px scale.
- Make vertical rhythm obvious: larger gaps between sections than between labels and inputs.
- Set max widths for readability (e.g. `max-width: 1280px` for pages, `68-70ch` for text blocks).
- Size containers from their content: avoid fixed heights, and lose no content as text grows, because translated strings run longer and readers enlarge text up to 200%. Truncate only when the complete text stays available through a clearly marked control.
- As available width falls, reduce the column count; state the minimum comfortable width for one column instead of compressing every column.
- Pad clickable areas generously (12–16px vertical, 16–24px horizontal) so touch targets feel confident.

## Typography

- Use one font family; create contrast with weight, size, and letter-spacing.
- Name the concrete sizes and line heights you choose (e.g. `32/40`, `24/32`, `18/28`, `16/24`, `14/20`) and reuse them; never refer to “a small type scale” without its values.
- Letter-space uppercase labels; de-emphasise metadata with colour, not excessive shrinking.

```css
.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 12px;
  color: #6c7280;
}
```

## Colour & Contrast

- Start with neutrals; let one accent colour carry primary actions. Use softened greys instead of pure black or white.
- Build palettes by lightening and darkening one hue: low-saturation tints for surfaces, bolder shades for actions.
- Give text on tints at least 4.5:1 contrast for normal text and at least 3:1 for large text (24px and larger, or 18.66px and larger when bold). Add a subtle border where a tinted panel touches a white background.
- Pair colour meaning (success/info/warn/danger) with an icon or text so colour-blind users are covered.

## Depth, Shape & Elevation

- Prefer soft, diffuse shadows for elevation (slight offset, low-opacity blur); avoid harsh, opaque drop shadows.
- Keep radii consistent (e.g. 8–12px across inputs, cards, modals); match inner elements to the parent radius.
- Separate stacked surfaces with a light border or a faint shadow, not both.

## Components That Feel Designed

- Buttons: one clear primary, a low-emphasis secondary (ghost/text), and a destructive variant, all with consistent padding and radius. Set emphasis by the task, not the consequence: when destruction is the main task of the screen, the destructive action carries the primary weight; otherwise give it the lowest emphasis that still leaves it findable, so it never competes with the primary action.
- Forms: pair every input with a clear label (never placeholder-as-label), show inline validation close to the field, and use generous vertical spacing.
- Lists/tables: increase row height, soften alternating backgrounds, and highlight the primary cell with weight or colour.
- Icons: keep stroke weight consistent; pair icons with labels unless the meaning is universal; balance visual weight with padding.

## States, Feedback & Empty Space

- For each distinct control pattern, specify a visibly distinct treatment for every applicable state: hover, active, focus, loading, disabled, error, empty, and success. Note where one control departs from its pattern. Listing state names, or stating only that the states must differ, is incomplete.
- Show loading with skeletons or subtle shimmer, not spinners alone; give friendly empty states a short “what to do next.”
- Clarify errors with colour, icon, and text; reserve red for errors and use calmer hues for neutral info.
- Treat whitespace as a design tool, not wasted space.

## Compositional Polish

- Keep gaps, radii, shadows, and border colours consistent across the entire UI.
- Replace visual clutter (dividers, lines, boxes) with spacing and alignment; let one strong anchor (title or primary action) lead.
- Put a dark or light overlay behind text on images to keep it legible.

## Delivery Check

Before replying, confirm:

- A primary action that is not itself destructive stays visually distinct from red error or destructive meaning.
- Every applicable state of each control pattern has its visible treatment specified.
- Every action has a named emphasis (primary, secondary, or low) and every destructive action is marked.
- Radius, spacing, and comfortably sized touch targets are given as named values on one consistent system, and every named value fits the declared scale.
- Every piece of required copy, such as the empty state's next step, is present rather than implied.
- Every refused request is paired with the replacement that keeps its intent.
