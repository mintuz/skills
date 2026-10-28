# Web capture

Prefer the project's verified launch/drive/capture commands. Otherwise use the
host's available real-browser capability, including Playwright MCP, a host-native
browser tool, an installed browser runner or Chrome DevTools Protocol (CDP).
Discover the actual tool names; do not assume another host exposes identical APIs.

Record route, browser/OS, viewport, theme, fixture and interaction state. Inspect
accessibility/focus state when it matters. Navigation, click, hover, keyboard,
resize, screenshot, console and network inspection are useful capabilities; no
particular MCP registration is required.

If no interactive capability is available, an existing local Chrome headless or
cached Playwright Chromium can capture a reachable state. Serve local HTML over
HTTP rather than a file URL. The following is a command template: resolve all
angle-bracket slots from the current project before running it.

```sh
"<existing-chrome-executable>" \
  --headless=new --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=1 --virtual-time-budget=6000 \
  --window-size=<width>,<height> --screenshot=<evidence-path>.png <http-url>
```

`--virtual-time-budget` advances page time and can remove a timed target before
capture. Choose the capture phase deliberately; do not infer target visibility
from the command succeeding.

On macOS, a plain Chrome headless `--window-size` width below 500px can lay out at
500px and crop the image. Use CDP `Emulation.setDeviceMetricsOverride` or an iframe
harness at the requested width. Confirm `window.innerWidth` in the page/frame.
PNG dimensions alone do not establish the layout viewport.

Use an existing cached Chromium executable with its own supported flags. The
Playwright CLI uses different options, such as `--viewport-size`; do not mix them.
Use `pnpm exec playwright` only if the project already exposes that dependency.
Do not use `npx playwright` to install missing tooling implicitly. Report a missing
capture capability rather than modifying the machine without authority.

Capture before auto-dismiss and at the relevant animation phase. For an unknown
phase, capture during and after the transition. Confirm the target exists at
non-zero size before drawing a conclusion. Keep diagnostic screenshots outside
scratch cleanup and never use a logged-in user profile for an isolated run.

Prefer synthetic data and disposable accounts. Inspect and redact shareable
capture derivatives; keep necessary originals access-controlled under the
project's retention policy. Never publish credentials, customer data or whole
unreviewed bundles. Apply the parent skill's single Isolation and evidence rule
for shared-instance authority, serial inspection and protection of foreign state.
