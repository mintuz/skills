---
name: principle-observe-dont-infer
description: "WHEN relying on a name, label or mode to say what code does, such as a dry-run flag, a type guard or a renamed field; NOT for choosing the check that proves a finished result; observes the actual effect or marks it unproven."
---

# Observe, don't infer

A name states an intention; only an observed effect shows what happens.

1. Before relying on a mode, flag, function or field name, state the effect you are assuming it has.
2. Observe that effect directly. For a dry-run or test mode, check what it actually touches: files, network, git refs, browsers or external services. Some dry-runs still write or send. For a type guard or validator, read or exercise it and confirm it verifies every property its name promises; a lying guard hides the bug behind a name that says it is safe. For a renamed property or field, inspect the coding keys, schema or equivalent mapping before concluding that a stored or encoded key changed.
3. When you cannot observe the effect within your authority, mark it unproven. Carry it as an assumption into every conclusion that depends on it, and do not clear an action that relies on it.

Distinct from: `principle-prove-it-works` (claiming a finished result works), `principle-label-the-evidence` (writing up each claim's status and evidence level), `principle-parse-at-the-boundary` (untrusted data entering a trust boundary).

Done: each effect you relied on was observed, or is marked unproven.
