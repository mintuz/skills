---
name: web-design
description: WHEN choosing, refining, or reviewing a web UI's visual direction, hierarchy, spacing, typography, color, components, interaction states, or visual accessibility; NOT for style implementation or visual defect reproduction; produces an observable, accessible design contract.
---

# Web Design

Turn intent into a **design contract**: the hierarchy, visual system, states, and acceptance checks a reviewer can observe without reading the implementation.

## Choose the branch

| Request | Route |
| --- | --- |
| Choose or refine visual direction, including for an implementation | Follow all four steps; implementation remains with the matching companion skill |
| Review a mockup, screenshot, specification, or existing UI | Follow all four steps read-only; report evidence and a corrective design contract |
| Match a supplied reference or design system | Treat it as the baseline, then check real content, responsive behavior, states, and accessibility |
| A runnable UI looks wrong or differs from a reference | Use `web:eyes` for a repeatable visual checkpoint, then follow this skill if the intended direction is unresolved |
| The direction is settled and only implementation remains | Use `web:css`, `web:tailwind`, or `web:react` according to the code boundary |

## 1. Establish the design contract

Read the repository instructions, request, existing design system, tokens, components, real content, and supplied artifacts. Inspect the current rendered state when a design decision depends on it.

For every surface in scope, identify:

- the user goal, primary visual anchor, and intended reading order;
- the tone and existing visual language to preserve or deliberately change;
- supported viewports, content extremes, and interaction states;
- fixed product, brand, platform, and accessibility requirements;
- which supplied details are requirements and which are inspiration.

**Complete when:** every in-scope surface has a named visual anchor, reading order, source of truth, state inventory, content and viewport bounds, and explicit constraints.

## 2. Shape one visual system

Preserve the existing system unless the request explicitly changes it. Make decisions in this order so each layer reinforces the layers above it:

| Layer | Design contract |
| --- | --- |
| Hierarchy | Give each surface one dominant anchor; group related content through proximity and aligned edges; use scale, weight, and position before adding color or containers. |
| Layout and spacing | Use the established spacing scale; make section gaps larger than internal gaps; constrain reading measure; define how the composition reflows at each supported boundary. |
| Typography | Reuse the established family and text roles; assign a small type hierarchy with legible line height; keep supporting text quiet and legible. |
| Color | Assign semantic roles to the existing palette; reserve emphasis for primary actions and status; pair color-coded meaning with text or an icon. |
| Components and depth | Reuse component patterns and tokens; keep control labels visible and feedback close to its control; keep radius, border, shadow, and icon treatments consistent; use spacing and surface contrast before extra decoration. |
| States and motion | Specify every applicable default, hover, focus, active, disabled, loading, empty, error, and success state; keep feedback close to its cause and respect reduced-motion preferences. |
| Accessibility | Meet [WCAG 2.2 AA](https://www.w3.org/TR/WCAG22/): visible and unobscured focus, text and non-text contrast, meaning independent of color, reflow at 320 CSS px, and targets at least 24 by 24 CSS px or covered by a documented exception. |

Prefer one strong decision over several competing accents. When content overlays imagery, specify the treatment that preserves contrast across the image's full range.

**Complete when:** every layer has one coherent decision, every decision uses an existing token or names a necessary addition, and all state and accessibility requirements reinforce the hierarchy.

## 3. Write the observable specification

Describe the result as observable relationships rather than implementation:

- the visual anchor and reading order for each surface;
- layout, spacing, type, color, component, and state decisions;
- responsive changes at each supported boundary;
- exact before-and-after deltas for a refinement or review;
- acceptance checks for real content, interaction states, and accessibility.

Use measurements when they make a result checkable; prefer existing token names when the system already defines them. For a review finding, state the evidence, affected layer, user consequence, and corrective decision.

**Complete when:** every requirement from step 1 maps to a design decision and acceptance check, every review finding has evidence and a correction, and every unresolved choice is named.

## 4. Assess and hand off

For a static artifact, assess every acceptance check visible in it. For a runnable UI, use `web:eyes` to compare the same content, viewport, and state; let `web:css` own cascade and layout rules, `web:tailwind` own utility and token APIs, and `web:react` own component behavior and state.

Check narrow and wide viewports, short and extreme content, applicable interaction states, keyboard focus, zoom and reflow, contrast, target size, color independence, and reduced motion. Mark each acceptance check **pass**, **fail**, **not applicable**, or **unverified**, and name unavailable evidence.

**Complete when:** every acceptance check has a status, every failure has an owning implementation boundary, and every design decision is explicit.
