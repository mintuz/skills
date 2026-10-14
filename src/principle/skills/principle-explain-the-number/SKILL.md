---
name: principle-explain-the-number
description: "WHEN reporting or acting on a measurement, count or evaluation result; NOT for assigning causal meaning without evidence; explains units, method, provenance and uncertainty."
---

# Explain the number

A number is useful only when its meaning and limits travel with it.

1. Name the quantity, units, source identity, input scope, exclusions and method. State what completed correct work was counted.
2. For deterministic inventories or calculations, preserve the reproducible query or formula and source revision. Report coverage and freshness limits; repeated trials and runtime bottlenecks are unnecessary for a fixed count.
3. For performance or evaluation claims, compare equivalent completed work and conditions. Rule out errors, skipped work, cache differences, inactive code, uneven tuning and measurement overhead. Record run count and spread; test whether the difference survives relevant repetitions.
4. For causal speed or capacity claims, find the limiting resource or path using a profile or counters from the run, then map it to source. Ask why the result is not twice as good; a source-reading guess is a hypothesis, not a measured limiter.
5. Separate component improvements from end-to-end impact. An evaluation result is bounded by its scenarios, trials and models; do not generalize beyond them.

Done: keep the evidence beside the number and state which conclusion it supports. Where the method or limiter remains unresolved, report the observation with that uncertainty instead of declaring an improvement.
