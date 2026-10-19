---
name: principle-fix-the-bar-first
description: "WHEN comparing, racing, iterating on or reviewing candidates, existing or new; NOT for a gate that has already failed or for choosing which checks to run; records the selection criteria before evaluation and holds them after results."
---

# Fix the bar first

Decide how candidates will be judged before you see how any of them perform.

1. Before generating, comparing, racing, iterating on or reviewing candidates, record the bar: a few concrete, gradeable criteria for success on this task, any thresholds, and the selection rule (first pass, rank all or best-of).
2. Derive the criteria from the request, requirements or a supplied reference, never from a candidate. A draft, diff or proposal cannot define the bar it is judged against: when no independent bar exists, withhold the verdict and ask for one.
3. Do not change criteria, weights, thresholds or the selection rule after seeing results. A preference that appears after results is a candidate for a future bar, recorded before the next evaluation runs, not a reason to re-score finished ones.
4. When results were seen before any bar existed, ground the bar in sources written independently of the results and state that limitation in the verdict.

Distinct from: `principle-never-weaken-a-check` (an existing gate fails), `principle-judge-with-fresh-eyes` (who gives the verdict), `principle-exhaust-the-design-space` (whether to generate alternatives), `principle-define-done` (a completion criterion for one deliverable).

Done: criteria were recorded before evaluation began and were not altered after results.
