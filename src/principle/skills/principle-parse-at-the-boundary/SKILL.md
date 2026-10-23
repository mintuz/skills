---
name: principle-parse-at-the-boundary
description: "WHEN data enters from network, storage, configuration or plugins, or a validated value is relied on after suspension or mutation; NOT for choosing concurrent-writer ownership or re-checking proven stable internal values; parses where trust changes and revalidates invariants that can change."
---

# Parse At The Boundary

Validate where trust changes; let established invariants simplify the interior.

1. Trace every entry and mutation path: network, configuration, storage, plugins, unsafe construction, and shared state after suspension or re-entrancy. A type annotation or cast alone does not establish validity.
2. Parse untrusted representations into domain values at that boundary and return useful errors there. Put each invariant at its owning boundary.
3. Decide what each parser does with unknown fields and unknown enum values. When the producer can add members, ignore unknown fields and parse an unknown enum value into an explicit unknown case, so interior matching stays exhaustive. Treat an unknown permission, authorisation or lifecycle state as neither granted nor successful. When the input can set privileged fields, accept only listed fields and drop or reject the rest.
4. Revalidate what can change after parsing. Parse or migrate persisted data written under older schemas; types cannot make stored invalid states valid retroactively. Re-establish invariants that mutation, callbacks or concurrent work can invalidate.
5. Remove an internal check only when every construction and access path preserves its invariant. Keep legitimate runtime guards for states the contract permits, such as a documented absent or empty value.

Distinct from: `principle-type-system-discipline` (types permit invalid combinations; compile-time distinctions), `principle-model-the-domain` (choosing the states and transitions to parse into), `principle-keep-the-core-pure` (domain logic lands in an adapter), `principle-hide-representations` (a private shape crosses a module boundary).

Done: accepted, rejected and invalidated inputs have focused checks; each remaining guard protects a real boundary or changing invariant; stable immutable domain values are not re-parsed; an internal check was removed only when every construction and access path preserves its invariant, and legitimate runtime guards stay.
