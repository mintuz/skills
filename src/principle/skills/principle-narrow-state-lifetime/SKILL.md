---
name: principle-narrow-state-lifetime
description: "WHEN mutable state outlives or outreaches the work that needs it, such as module globals, long-lived fields or reset hooks; NOT concurrent writers sharing one invariant, or tracing layers; scopes each value to its use with explicit inputs."
---

# Narrow State Lifetime

Shrink mutable state toward request-owned values and explicit inputs, so each value lives no longer and reaches no wider than the work that uses it.

1. For each mutable value, name the work that needs it: a request, an operation, a screen or the whole process. Find where it is set, who reads it and when it stops mattering.
2. Move per-work values into that work. Prefer returned values over mutation, locals over fields, fields over module state and module state over globals. Pass inputs explicitly rather than reading them from shared context.
3. When a fix resets, clears or locks a long-lived value so it behaves as if it were short-lived, treat that as the symptom. Shorten the value's lifetime instead.
4. Preserve shared resources, such as clients, pools and caches, under explicit owners whose lifetime matches the resource. Do not push them into request scope.
5. Exercise overlapping work with different inputs, a failure followed by a fresh run, and abandoning work midway where that can happen. Shorter or flatter code is not evidence.

Distinct from: `principle-separate-before-serializing-shared-state` (concurrent writers share mutable state), `principle-minimize-reader-load` (an existing path is hard to trace through layers), `principle-derive-from-one-owner` (the same fact is computed or stored twice).

Done: each mutable value lives no longer or wider than its use, its inputs are explicit, and shared resources have a named owner.
