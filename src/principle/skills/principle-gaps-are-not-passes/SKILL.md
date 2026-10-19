---
name: principle-gaps-are-not-passes
description: "WHEN a check was skipped, unavailable, timed out or returned no result before a verdict; NOT for choosing which checks to run; reports each gap and gives a verified, not verified or inconclusive verdict."
---

# Gaps are not passes

A check that did not run proves nothing; report it as a gap, never as a pass.

1. Give the verdict as verified, not verified or inconclusive. Inconclusive is not a pass. Report a negative result rather than hiding it.
2. List every required check or slice that was skipped, unavailable, unconfigured, timed out, crashed or returned no result. Each leaves its claim unproven, even when every other check passed. A result that lacks the revision or method it was asked to record is also a gap.
3. Report null results with their bounds: a search that found nothing shows absence only within what it searched.
4. Report verified results, missing coverage and uncertainty without manufacturing unavailable evidence. Never fill a gap with an expected result, a stale run or an estimate.

Distinct from: `principle-label-the-evidence` (labelling claims that do have evidence), `principle-scale-verification` (choosing which checks to run), `principle-never-weaken-a-check` (a failing gate tempts a looser check).

Done: the verdict is verified, not verified or inconclusive, and every gap and null result is listed.
