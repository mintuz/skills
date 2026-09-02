---
name: web-design
description: WHEN refining UI layout, typography, color, or polish; NOT code implementation; provides concise principles for intentional, legible design.
---

# Web Design

Focus on clear hierarchy, generous spacing, and restrained styling to make interfaces feel intentional.

## Scope and Inputs

- Give design decisions, not implementation code. State the visual and state specification; leave the component source, the utility classes, and the engineering choices to the engineer, and say so when a request asks for them.
- When a request conflicts with legibility or access, keep the intent behind the request. Name each part you refuse, give the reason, and state the substitute treatment that delivers the same intent.
- Choose and name the values that are yours to choose, such as sizes, weights, spacing, radii, and the widths at which the layout changes. A design value you select is a decision, not an invention, so state it instead of deferring it to later testing.
- Do not invent a fact that belongs to the product or the brand, such as a brand color, a surface color, a price, or a measured result.
- When a decision needs a fact you were not given, name each fact that blocks the decision, state the constraint that fact must satisfy, give the decision as a condition, and say what to change if the condition fails. Do not certify a result you cannot measure.

## Visual Hierarchy & Focus

- Group related elements by proximity and aligned edges; avoid scattered, evenly-spaced elements that compete for attention.
- Add hierarchy with weight before color: `font-weight: 600` and size changes beat random accent colors.
- Reduce noise: fewer borders; use spacing, background tints, or subtle dividers instead of heavy outlines.

## Layout & Spacing

- Use a consistent scale (4px or 8px).
- Make vertical rhythm obvious: larger gaps between sections than between labels/inputs.
- Set max widths for readability (e.g. `max-width: 1280px` for pages, `68-70ch` for text blocks).
- Size containers from their content. Avoid fixed heights, and do not lose content as text grows, because translated strings run longer and readers enlarge text up to 200%. Truncate only when the complete text stays available through a clearly marked control.
- Reduce the column count as the available width falls; state the minimum comfortable width for one column instead of compressing every column.
- Pad clickable areas generously (12–16px vertical, 16–24px horizontal) so touch targets feel confident.

## Typography

- Pick one font family; use weight/size/letter-spacing for contrast instead of juggling many fonts.
- Name the concrete sizes and line heights you choose (e.g., `32/40`, `24/32`, `18/28`, `16/24`, `14/20`) and reuse them; do not refer to “a small type scale” without giving its values.
- Use letter-spacing for uppercase labels; use color to de-emphasize metadata instead of shrinking excessively.

```css
.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 12px;
  color: #6c7280;
}
```

## Color & Contrast

- Start with neutrals; let a single accent color carry primary actions. Avoid pure black/white—use softened grays for warmth.
- Build palettes by lightening/darkening the same hue; use low-saturation tints for surfaces and bolder shades for actions.
- Ensure contrast for text on tints: meet at least 4.5:1 for normal text and at least 3:1 for large text, which is 24px and larger, or 18.66px and larger when bold. Add a subtle border when a tinted panel touches a white background.
- Use color for meaning (success/info/warn/danger) plus an icon or text so color-blind users are covered.

## Depth, Shape & Elevation

- Prefer soft, diffuse shadows for elevation; combine slight offset with low opacity blur. Avoid harsh, opaque drop shadows.
- Keep radii consistent (e.g., 8–12px across inputs, cards, modals). Match inner elements to the parent radius.
- Separate stacked surfaces with either a light border or a faint shadow but not both.

## Components That Feel Designed

- Buttons: one clear primary, a low-emphasis secondary (ghost/text), and a destructive variant. Use consistent padding and radius. Set emphasis by the task, not by the consequence: when destruction is the main task of the screen, the destructive action carries the primary weight; when it is not, give it the lowest emphasis that still leaves it findable, so it never competes with the primary action.
- Forms: pair clear labels with inputs; avoid placeholder-as-label; show inline validation close to the field; use generous vertical spacing.
- Lists/tables: increase row height, soften alternating backgrounds, and highlight the primary cell with weight/color.
- Icons: keep stroke weight consistent; pair icons with labels unless the meaning is universal. Balance visual weight with padding.

## States, Feedback & Empty Space

- Give every applicable state—hover, active, focus, loading, disabled, error, and success—a visibly distinct treatment; naming states without specifying their treatment is incomplete.
- Use skeletons or subtle shimmer for loading instead of spinners alone; provide friendly empty states with a short “what to do next.”
- Clarify errors with color, icon, and text; reserve red for errors and use calmer hues for neutral info.
- Give content room to breathe—whitespace is a design tool, not wasted space.

## Compositional Polish

- Use consistent gaps, radii, shadows, and border colors across the entire UI to create harmony.
- Replace visual clutter (dividers, lines, boxes) with spacing and alignment; let one strong anchor (title or primary action) lead.
- When stacking elements on images, add a dark or light overlay to keep text legible.

## Delivery Check

- Keep a primary action that is not itself destructive visually distinct from red error or destructive meaning.
- Specify the visible treatment of every applicable hover, active, focus, loading,
  disabled, error, empty, and success state for each distinct control pattern, and
  note where one control departs from its pattern. Do not list state names alone.
  Do not state only that the states must differ.
- Name the emphasis of every action — primary, secondary, or low emphasis — and mark
  which actions are destructive.
- Preserve a consistent radius and spacing system with comfortably sized touch targets, and give the system as named values.
- Check that every value you named fits the scale you declared, and that every
  applicable state and every piece of required copy, such as the empty state's next
  step, is present rather than implied.
- Check that every request you refused is paired with the replacement that keeps
  the intent behind it.
