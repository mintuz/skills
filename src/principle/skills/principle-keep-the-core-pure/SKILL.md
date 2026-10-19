---
name: principle-keep-the-core-pure
description: "WHEN domain logic lands in an adapter, handler, job or UI component; NOT for wiring that makes no domain decision; keeps decisions in pure functions behind thin framework wiring."
---

# Keep The Core Pure

Put domain decisions in pure functions; keep framework wiring thin and mechanical.

1. Find each domain decision inside the adapter, request handler, job, view or component: the branch that applies a business rule, computes a result or chooses an outcome.
2. Extract it into a pure function: explicit inputs in, a domain result out. Pass time, configuration and identifiers as arguments; read no clock, global, database or framework object inside it.
3. Leave the shell to read input, call the function and perform effects with the result. Add new rules to the function, not to the shell. When several frameworks need the same rule, they share the function rather than copy it into each.
4. Test the decision directly, without starting the framework, server, database or renderer.

Distinct from: `principle-hide-representations` (a private wire, storage or framework shape crosses a module boundary), `principle-parse-at-the-boundary` (untrusted data enters and needs validating), `principle-minimize-reader-load` (layers that own no decision make a path hard to trace).

Done: every domain rule touched is testable without the framework, and the wiring holds no domain branches.
