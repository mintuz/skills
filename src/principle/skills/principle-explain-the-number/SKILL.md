---
name: principle-explain-the-number
description: "WHEN reporting or acting on a measurement, count or evaluation result; NOT for assigning causal meaning without evidence; explains units, method, provenance and uncertainty."
---

# Explain the number

A number is useful only when its meaning and limits travel with it.

1. Name the quantity, units, source identity, input scope, exclusions and method. State what completed correct work was counted.
2. Match the evidence to the number's class:
   - **Deterministic count or calculation:** preserve the reproducible query or formula and source revision, and report coverage and freshness limits. Repeated trials and runtime limiters are unnecessary for a fixed count.
   - **Experimental or evaluation result:** compare equivalent completed work and conditions. Rule out errors, skipped work, cache differences, inactive code, uneven tuning and measurement overhead. Record run count and spread; test whether the difference survives relevant repetitions.
   - **Causal speed or capacity claim:** additionally find the limiting resource or path using a profile or counters from the run, then map it to source. Ask why the result is not twice as good; a source-reading guess is a hypothesis, not a measured limiter.
3. Separate component improvements from end-to-end impact. An evaluation result is bounded by its scenarios, trials and models; do not generalize beyond them.

For a performance benchmark, follow the full procedure in `benchmark-checklist`.

Distinct from: `principle-prove-it-works` (whether a result works at all), `principle-label-the-evidence` (status and evidence level of non-numeric claims).

Done: the number carries its class's evidence and the conclusion it supports: query and revision (deterministic); equivalent conditions, run count and spread (experimental or evaluation); plus a measured limiter (causal speed or capacity). If the method or limiter is unresolved, report the observation with that uncertainty, not an improvement.
