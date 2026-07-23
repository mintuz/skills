---
name: eyes
description: WHEN a rendered web UI looks wrong, behaves visually wrong, or differs from a reference; NOT for visual direction without a runnable UI or code-only styling guidance; uses Playwright evidence to agree and verify visual fixes.
---

# Eyes

Run an **evidence loop**: capture the current state, agree on an observable visual delta, obtain approval, then capture the same state after the change.

## Choose the branch

| Report | Evidence |
| --- | --- |
| Appearance defect or refinement | The affected page or element at the reported viewport |
| Hover, focus, animation, or interaction defect | The exact interaction state before and after the trigger |
| Responsive defect | The failing width plus the nearest supported widths on either side |
| Difference from a reference | Both renders at matching viewport, content, and UI state |

## 1. Capture the visual checkpoint

Use Playwright MCP to reproduce the report:

- reach the page with `browser_navigate`;
- set the relevant viewport with `browser_resize`;
- enter the reported state with `browser_click`, `browser_hover`, and `browser_wait_for`;
- capture the page or affected element with `browser_take_screenshot`;
- use `browser_snapshot` when structure, semantics, or focus order matters;
- use `browser_console_messages` when runtime behavior may explain the visual state.

Use `browser_install` if Playwright reports that its configured browser is unavailable. Record the URL, viewport, target element, content, interaction state, and wait condition so the checkpoint can be repeated.

**Complete when:** the issue is visible in a screenshot at a repeatable checkpoint, or the exact reproduction gap is named.

## 2. Agree on the visual delta

Present the screenshot and describe the observed state. If the intended result is unclear, ask what specifically should change. Translate the answer into observable terms: target, property, current value or behavior, intended value or behavior, viewport, and interaction state.

Propose the smallest specific change. Prefer “increase the card gap from 16px to 24px” over “fix the spacing.”

Use `web:web-design` when the visual direction itself needs refinement. Use `web:css` when the approved result requires style or layout implementation.

**Complete when:** every reported problem has one observable before/after delta and one specific proposed change.

## 3. Obtain approval and implement

Use AskUserQuestion to request explicit approval of the proposed change. Keep the code unchanged until the user approves that proposal.

After approval, implement only the agreed delta and run the smallest relevant code checks.

**Complete when:** the implementation matches the approved proposal and its relevant checks pass.

## 4. Verify the same checkpoint

Repeat the URL, viewport, target, content, interaction, and wait condition from step 1. Capture the after screenshot, inspect any relevant accessibility snapshot or console messages, and present the before and after screenshots side by side.

Ask whether the result matches the agreed delta. A rejected result returns to step 2 with the new screenshot as the current state.

**Complete when:** every approved delta is visible in a matched before/after comparison and the user confirms the result; name any unavailable verification.
