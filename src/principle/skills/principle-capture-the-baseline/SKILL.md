---
name: principle-capture-the-baseline
description: "WHEN about to change something whose result you will verify or compare; NOT for read-only investigation or syncing a git base; records pre-change evidence so the check reads old value versus new value."
---

# Capture the baseline

Capture the pre-change state before changing it, so the result reads as old value versus new value.

1. Before the first edit, run the check you will use afterwards against the unchanged artifact. Record the result with its revision, inputs, environment and conditions. Confidence from reading the code does not replace this measurement.
2. Use the same harness, inputs and conditions after the change, so any difference comes from the change and not from the method.
3. For a fix or refactor, record current behaviour, including the failing reproduction and the behaviour you intend to keep. Passing tests show only what they assert; they are not a record of prior output.
4. If the change has already happened, produce the baseline from the unmodified base revision, for example in a separate worktree or build, and preserve the uncommitted work. If no baseline can be produced, report the comparison as missing its baseline.

Distinct from: `principle-state-the-claim-first` (writing the claim before working), `principle-prove-it-works` (verifying the result after the change), `principle-update-the-base-deliberately` (starting from or syncing with a git base).

Done: baseline evidence from the unchanged state predates the change, or its absence is reported.
