---
name: principle-build-the-lever
description: "WHEN repetitive work or a difficult check benefits from a rerunnable tool; NOT when an existing command or a direct small edit already suffices; builds the smallest useful lever."
---

# Build the lever

Make work repeatable when that saves effort or makes its result independently checkable.

1. Look for an existing command, query, codemod or check that covers the task. Reuse it with recorded inputs and invocation when sufficient; a new file is not proof of usefulness.
2. For an uncovered repeated transformation, complete one representative unit to establish the recipe. Build the smallest tool and compare its output with that expected result. Use structure-aware edits where plain text replacement could change unrelated content.
3. Exercise exceptions, failure handling and rerun safety before applying across the owned scope. Preserve unrelated work and expose skipped or uncertain units for review.
4. Keep the tool when its review or reuse outlives this task, with a reproducible invocation and result check. A one-off can earn a tool if it is the economical way to prove the result; a framework is unnecessary.

Prefer a deterministic pass over manual fan-out. If delegation is authorized and useful, share one stable recipe, verification contract and write boundary; delegation is optional.

Done: the work and its checks are reproducible with the existing or new lever, or the direct method is justified by lower total effort and equivalent confidence.
