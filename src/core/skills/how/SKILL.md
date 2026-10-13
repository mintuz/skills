---
name: how
description: WHEN explaining current code execution or state ownership; NOT for historical rationale or redesign; gives an evidence-grounded walkthrough
---

# How

Explain the current implementation as a path a reader can follow. Keep historical motivation for `why` and redesign for a separate authorized task.

1. Bound the question and inspect current source plus its relevant immediate callers, configuration and tests. State an interpretation when the referent is ambiguous. Handle a narrow module directly; optional independent exploration must earn its cost and follow host authorization, with no required subprocess, model or routing file.
2. Trace the concrete trigger through each meaningful boundary: inputs and transformations, state owner, effects and observable result. Include failure, cancellation, retry and teardown paths where they change the outcome. Name process/lifecycle ownership for app/extension flows and actor/resource ownership for reactive flows; use the implementation's actual architecture.
3. Anchor consequential statements to source locators. Distinguish source-derived behavior, test results and observed runtime. Resolve revision/build/environment mismatches before claiming what the current app does; an old screenshot cannot contradict an unobserved new build conclusively. Mark unknown paths instead of filling them with plausible details.
4. Answer at the question's scale: lead with the result, then the execution sequence, ownership and important gotchas. Add a small cited diagram only when it clarifies boundaries. Explain enough to predict behavior without producing annotated source or speculative rationale.
