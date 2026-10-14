---
name: principle-fix-root-causes
description: "WHEN debugging a reproducible defect or distinguishing competing causes; NOT for removing legitimate guards or widening authorized scope; repairs the evidenced cause and rechecks the failure."
---

# Fix root causes

Fix the mechanism that produces the failure, not just the surface that exposes it.

1. Reproduce the failure and capture the actual error, state and execution path. Separate observations from hypotheses; use bounded instrumentation when the decisive fact is missing.
2. Trace the symptom to its owning state or contract. Compare plausible causes with an experiment that distinguishes them. A restart failure makes persisted state worth inspecting; clearing a disposable fixture is evidence, not proof or permission to delete user data.
3. Apply the narrow repair within the authorized scope. Preserve guards that enforce valid contracts or handle legitimate absent/error states. A guard that only hides a broken invariant needs a causal repair, not blanket removal of defensive code.
4. Search for the same mechanism and affected callers. Fix owned instances when authorized; report broader findings separately. Preserve data and unrelated work.
5. Leave a regression check that exposes the cause, then repeat the original failing sequence and relevant caller/lifecycle cases. If diagnosis required a deep search, propose a cheap signal that would reveal this failure earlier.

Done: evidence explains the failure and the repair survives the original check, or the unresolved cause and next discriminating observation are explicit. Never label a workaround or static check as runtime proof.
