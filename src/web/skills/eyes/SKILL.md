---
name: eyes
description: WHEN users express dissatisfaction with visual appearance or behaviour, or when UI iteration needs screenshots to check the result; NOT for unattended automated visual-regression or end-to-end suites; captures screenshots with the best available capture tool and collaborates on fixes with a structured feedback loop.
---

# Eyes - Visual Feedback Loop

Capture screenshots and collaborate with users on visual refinements. Treat specific feedback and explicit implementation approval in the current request as already supplied. Whenever you block on a missing fact or decline a request, state the reason so the user can act on it.

Take screenshots with the capture tool ladder below. Use this skill even when Playwright MCP is unavailable.

## Scope

An interactive loop with a person, for a reported defect or for visual iteration you drive yourself: capture the current state, agree the change with the user, confirm the result with that same user.

Unattended automated test suites are out of scope. Decline a request to build an unattended visual regression suite, choose its snapshot tool, define its baseline update process, or set its pixel diff threshold. Choosing a capture tool for an interactive session stays in scope (see the ladder). Design no part of the suite, not even as a sketch or an aside. Redirect to a real-browser end-to-end testing workflow, such as Playwright or Cypress visual comparisons, not to `web:frontend-testing` (DOM tests in a test runner; declines visual work). Offer the in-scope help instead: capture and compare a specific state whenever someone wants to see a visual change.

## Workflow

1. **Collect the reproduction facts** — Collect the facts the requested comparison needs: route, viewport, browser, operating system, theme, data, interaction state, expected result, and observed result. When the request already supplies the change and the state, ask for nothing the comparison does not need. Ask the reporter for every fact still missing; for a reported defect, also ask for a screenshot or reproduction steps. Explain why: a capture of a guessed state can neither confirm nor rule out the reported defect. Do not guess a state.

2. **Capture the reported state** — Reproduce the route, viewport, theme, data, and interaction state with the first available ladder tool, and name the rung used. Match the reported browser and operating system; report any mismatch as a proof gap. For a viewport narrower than 500px in Chrome headless, use an iframe harness or CDP device emulation (rung 2); never trust a plain `--window-size` capture at that width. For focus- or interaction-dependent states, record an accessibility snapshot or equivalent state evidence. Report unavailable evidence as a proof gap.

3. **Check that the capture can show the defect** — A capture counts as evidence only when the target can appear in it. Capture the phase the report names: for a settled-state defect, wait until the animation or transition finishes; for a defect during movement, capture at the reported point in the transition; when the phase is unknown, capture both during and after the transition. Capture before any auto-dismiss removes the target. Confirm the target is present in the image at non-zero size. When the target cannot appear (a hidden tab, a collapsed container, a zero-sized element, an unmounted component), put the page into a state that shows it and capture again. Discard a capture that fails these checks: it proves nothing.

4. **Gather specific feedback** — If the user has not already specified the intended result, ask: "Looking at this screenshot, what specifically would you like changed?"

5. **Separate competing causes** — When the symptom has more than one plausible cause, list the candidates and name the evidence that separates them, such as console or network messages, the computed style the element resolves to, or the declaration that owns the property. Confirm one cause before proposing a change.

6. **Propose changes with specifics**:
   - Bad: "I'll fix the spacing"
   - Good: "I'll increase the gap between cards from 16px to 24px and add 32px padding to the container"

7. **Confirm before implementing** — When the current request does not already authorize implementation, use the user-question tool to get explicit approval.

8. **Verify with comparison** — After the change, recreate the same route, viewport, theme, data, and interaction state, capture a new screenshot, record the same state evidence, and apply the step 3 check. Keep any unavailable runtime proof explicit.

## Capture Tool Ladder

Try each tool in order. Use the first one that works.

### 1. Playwright MCP

Preferred. Use the Playwright MCP tools listed below.

### 2. Local Chrome headless

Use this when Playwright MCP is unavailable.

Serve local HTML over HTTP first; a `file://` URL misbehaves in preview tabs.

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

`--virtual-time-budget` fast-forwards page time, so a timed element can appear or disappear before the capture. Set the budget to the phase you need.

WARNING: on macOS a `--window-size` width below 500 lays out the page at 500px and crops it, so a narrow mobile viewport captured this way is a lie. For a narrow viewport, use an iframe harness page sized to the target width, or CDP `Emulation.setDeviceMetricsOverride`. Confirm the emulation by reading `window.innerWidth` inside the page (inside the frame for an iframe harness). PNG dimensions do not prove the layout width: Chrome writes the requested window size into the image even when it clamps the layout.

### 3. Cached Playwright chromium build

Run a chromium build already cached under `~/Library/Caches/ms-playwright` directly, with the same flags as rung 2. The Playwright CLI takes different options, such as `--viewport-size`; do not mix the two forms.

Use `pnpm exec playwright` when Playwright is already a local dependency. Do not use `npx playwright` to obtain a build: when Playwright is absent, npx installs it, which needs network access and the user's permission.

## Playwright MCP Tools

Tools for the visual feedback loop:

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

Load these when implementing visual changes:

- **`web:css`** — CSS architecture, spacing, units, and selector patterns
- **`web:web-design`** — Visual hierarchy, typography, color, and component polish

## Before/After Comparison

After implementing changes:

1. Take a new screenshot of the same element/page
2. Present both screenshots side by side
3. Ask: "Does this match what you were looking for?"
4. If not, repeat the feedback loop
