---
name: eyes
description: WHEN users express dissatisfaction with visual appearance or behaviour, or when UI iteration needs screenshots to check the result; NOT for automated end-to-end test suites; captures screenshots with the best available capture tool and collaborates on fixes with a structured feedback loop.
---

# Eyes - Visual Feedback Loop

Capture screenshots and collaborate with users on visual refinements. Always confirm before making changes.

Use the capture tool ladder below to take the screenshots. Do not skip this skill when Playwright MCP is unavailable.

## Workflow

1. **Capture current state** — Capture the current page or element with the first available tool in the capture tool ladder, to better understand the users questions or requirements.

2. **Gather specific feedback** — Ask what needs adjustment: "Looking at this screenshot, what specifically would you like changed?"

3. **Propose changes clearly** — Describe intended modifications with specifics:
   - Bad: "I'll fix the spacing"
   - Good: "I'll increase the gap between cards from 16px to 24px and add 32px padding to the container"

4. **Confirm before implementing** — Use AskUserQuestion to get explicit approval. Never modify code without confirmation.

5. **Verify with comparison** — After changes, capture a new screenshot to confirm the fix has been made.

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

WARNING: on macOS a `--window-size` width below 500 lays out the page at 500px and crops it. A narrow mobile viewport captured this way is a lie. For narrow viewports, use an iframe harness page sized to the target width, or CDP `Emulation.setDeviceMetricsOverride`.

Read the PNG header dimensions before you trust a narrow-viewport verdict.

### 3. Cached Playwright chromium build

Use a chromium build already cached under `~/Library/Caches/ms-playwright`, with the same flags as rung 2.

`npx playwright` is NOT a fallback in a non-interactive run. It prompts to install and then fails.

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
