---
name: principle-prove-it-works
description: "WHEN selecting evidence before claiming a result works; NOT ritual testing of every statement; verify the claim against the identified artifact."
---

# Prove It Works

Name the claim, artifact revision or installed build, environment and observable result. Choose the smallest direct check that could falsify it: actual data, process identity, persisted effect or user journey.

Use existing repeatable checks when sufficient. Add a script only when reuse or reliability earns it. Preserve commands, inputs and relevant output so another reader can reproduce the conclusion.

Keep evidence levels distinct: static inspection, build, unit, integration, browser, simulator, physical device and production. A passed lower-level check does not establish an unobserved higher-level claim. Stale screenshots, timestamps, clicks and self-reports do not prove current behavior.

When a check fails, test both observation-method faults and system faults; neither is the default culprit. Bind observations to the intended process/build and state. Report verified results, missing coverage and uncertainty without manufacturing unavailable evidence.
