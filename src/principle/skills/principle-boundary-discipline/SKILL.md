---
name: principle-boundary-discipline
description: "WHEN placing validation or separating adapters from domain logic; NOT for redundant checks on proven stable internal values; protects real trust and invariant boundaries."
---

# Boundary discipline

Validate where trust changes; let established invariants simplify the interior.

1. Trace every entry and mutation path: network, configuration, storage, plugins, unsafe construction and shared state after suspension or reentrancy. A type annotation alone does not establish validity.
2. Parse untrusted representations into domain values and return useful errors at that boundary. Revalidate persisted versions and invariants that mutation or concurrent work can invalidate.
3. Remove internal checks only when all construction and access paths preserve the invariant. Keep legitimate runtime guards for states the contract permits.
4. Keep framework wiring thin and domain decisions in pure, testable functions. Expose domain concepts rather than leaking private wire, storage or framework representations; keep general mechanisms internal and special policy at the edge.

Done: each guard has an actual boundary or changing invariant to protect, and accepted, rejected and invalidated inputs have focused checks. Stable immutable domain values need no repeated parsing.
