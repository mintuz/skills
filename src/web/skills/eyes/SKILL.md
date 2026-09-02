---
name: eyes
description: WHEN users express dissatisfaction with visual appearance or behaviour, or when UI iteration needs screenshots to check the result; NOT for unattended automated visual-regression or end-to-end suites; captures screenshots with the best available capture tool and collaborates on fixes with a structured feedback loop.
---

# Eyes - Visual Feedback Loop

Capture screenshots and collaborate with users on visual refinements. Treat specific feedback and explicit implementation approval in the user's current request as already supplied. Whenever you block on a missing fact or decline a request, state the reason, so the user can act on it.

Use the capture tool ladder below to take the screenshots. Do not skip this skill when Playwright MCP is unavailable.

## Scope

This skill runs an interactive loop with a person. It applies to a defect someone reports and to visual iteration you drive yourself. Capture the current state. Agree the change with the user. Confirm the result with that same user.

This skill does not cover unattended automated test suites. Decline a request to build an unattended visual regression suite, to choose its snapshot tool, to define its baseline update process, or to set its pixel diff threshold. Choosing a capture tool for an interactive session stays in scope; the ladder below covers that choice. Design no part of the suite, not even as a sketch or an aside. Redirect the request to a real-browser end-to-end testing workflow, such as Playwright or Cypress visual comparisons. Do not redirect it to `web:frontend-testing`, which covers DOM tests in a test runner and declines visual work. Offer the in-scope help instead: capture and compare a specific state whenever someone wants to see a visual change.

## Workflow

1. **Collect the reproduction facts** — Collect the facts the requested comparison needs: route, viewport, browser, operating system, theme, data, and interaction state, plus the expected result and the observed result. When the request already supplies the change and the state, do not ask for facts the comparison does not need. Ask the reporter for every fact you still need. When someone reports a defect, ask that person for a screenshot of it, or for the steps that reproduce it. Tell the reporter why you need these facts: a capture of a guessed state can neither confirm nor rule out the reported defect. Do not guess a state.

2. **Capture the reported state** — Reproduce the route, viewport, theme, data, and interaction state with the first available tool in the capture ladder. Name the ladder rung you used. Match the reported browser and operating system. When you cannot match them, report the difference as a proof gap. For a viewport narrower than 500px in Chrome headless, use an iframe harness or CDP device emulation, as rung 2 explains. Never trust a plain `--window-size` capture at that width. For focus- or interaction-dependent states, record an accessibility snapshot or equivalent state evidence. Report unavailable evidence as a proof gap.

3. **Check that the capture can show the defect** — A capture counts as evidence only when the target can appear in it. Capture the phase the report names. For a defect in the settled state, wait until the animation or transition has finished. For a defect during the movement, capture at the reported point in the transition. When the phase is unknown, capture during the transition and after it. Capture before any auto-dismiss removes the target. Confirm the target is present in the image and rendered at non-zero size. When the target cannot appear — a hidden tab, a collapsed container, a zero-sized element, or a component that is not mounted yet — put the page into a state that shows it. Capture again. Discard a capture that fails these checks, because it proves nothing.

4. **Gather specific feedback** — If the user has not already specified the intended result, ask: "Looking at this screenshot, what specifically would you like changed?"

5. **Separate competing causes** — When the symptom has more than one plausible cause, list the candidates. Name the evidence that separates them, such as console or network messages, the computed style the element resolves to, or the declaration that owns the property. Confirm one cause before you propose a change.

6. **Propose changes clearly** — Describe intended modifications with specifics:
   - Bad: "I'll fix the spacing"
   - Good: "I'll increase the gap between cards from 16px to 24px and add 32px padding to the container"

7. **Confirm before implementing** — When the current request does not already authorize implementation, use the user-question tool to get explicit approval.

8. **Verify with comparison** — Recreate the same route, viewport, theme, data, and interaction state after the change. Capture a new screenshot. Record the same state evidence. Apply the same capture check as step 3. Keep any unavailable runtime proof explicit.

## Capture Tool Ladder

Try each tool in order. Use the first one that works.

### 1. Playwright MCP

Preferred. Use the Playwright MCP tools listed below.

### 2. Local Chrome headless

Use this when Playwright MCP is unavailable.

Serve local HTML over HTTP first. A `file://` URL misbehaves in preview tabs.

```bash
python3 -m http.server <port>
```

Then capture the screenshot:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=1 --virtual-time-budget=6000 \
  --window-size=W,H --screenshot=out.png <url>
```

`--virtual-time-budget` fast-forwards page time. A timed element can therefore appear or disappear before the capture. Set the budget to the phase you need.

WARNING: on macOS a `--window-size` width below 500 lays out the page at 500px and crops it. A narrow mobile viewport captured this way is a lie. For a narrow viewport, use an iframe harness page sized to the target width, or CDP `Emulation.setDeviceMetricsOverride`. Confirm that the emulation worked by reading `window.innerWidth` inside the page, or inside the frame for an iframe harness. The PNG dimensions do not prove the layout width, because Chrome writes the requested window size into the image even when it clamps the layout.

### 3. Cached Playwright chromium build

Run a chromium build already cached under `~/Library/Caches/ms-playwright` directly, with the same flags as rung 2. The Playwright CLI takes different options, such as `--viewport-size`, so do not mix the two forms.

Use `pnpm exec playwright` when Playwright is already a local dependency. Do not reach for `npx playwright` to obtain a build. When Playwright is absent, npx installs it, which needs network access and the user's permission.

## Playwright MCP Tools

Use these Playwright MCP tools for the visual feedback loop:

- `browser_navigate` — Navigate to a URL
- `browser_take_screenshot` — Take a screenshot of the current page
- `browser_snapshot` — Capture accessibility snapshot of the current page (useful for understanding structure)
- `browser_click` — Perform click on a web page
- `browser_hover` — Hover over element on page
- `browser_wait_for` — Wait for text appearance/disappearance or specified duration
- `browser_console_messages` — Returns all console messages (useful for debugging)
- `browser_resize` — Resize the browser window (useful for responsive testing)
- `browser_install` — Install the browser specified in the config

## Related Skills

When implementing visual changes, load these skills for guidance:

- **`web:css`** — CSS architecture, spacing, units, and selector patterns
- **`web:web-design`** — Visual hierarchy, typography, color, and component polish

## Before/After Comparison

After implementing changes:

1. Take a new screenshot of the same element/page
2. Present both screenshots side by side
3. Ask: "Does this match what you were looking for?"
4. If not, repeat the feedback loop
