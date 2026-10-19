---
name: principle-guard-the-context-window
description: "WHEN large outputs, repeated reads or a long task threaten the context window; NOT for writing handovers, resuming work or mandatory delegation on ordinary work; reads bounded slices and searches before loading full payloads."
---

# Guard the context window

Keep the active question small: load only the slice that answers it.

1. Scope the current phase and its stopping condition. Search filenames and symbols first, then read bounded excerpts or filtered logs; avoid repeatedly loading full payloads.
2. Note where each useful finding sits (path, line range, query) so a later question returns to that slice instead of reloading the whole payload. Preserve evidence pointers instead of copying raw private logs into every summary.
3. Discover the host's available tools. Use scoped searches and local summaries when sufficient. Delegation is optional and requires appropriate authorization and capabilities; it is not a prerequisite for managing context.

Distinct from: `principle-write-cold-handovers` (pausing or delegating needs a self-sufficient brief), `principle-refresh-before-resuming` (resumed work relies on recorded state), `principle-label-the-evidence` (findings need epistemic status and locators).

Done: no full payload was loaded twice, and each phase has a stopping condition.
