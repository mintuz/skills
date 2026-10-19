---
name: principle-hide-representations
description: "WHEN a private wire, storage or framework representation crosses a module boundary; NOT for internal types that never leave their module; exposes domain concepts and keeps special-case policy at the edge."
---

# Hide Representations

Expose domain concepts across a boundary, not how data travels, is stored or is framed.

1. List what crosses the module's public surface: parameters, return values, errors, events and re-exports. Flag any wire payload, database row, ORM entity, SDK object or framework type.
2. Translate at the edge. Map the private representation to a domain type on the way in and back on the way out, and convert library errors into domain errors. Never re-export transport, storage, framework or wire types through the public surface.
3. Keep general mechanisms inside and special-purpose policy at the edge. When one caller, partner or tenant needs different behaviour, its own adapter supplies that policy; the shared mechanism gains no branch or flag naming it.
4. Check consumers against the domain type, so a representation change touches only the mapping.

Distinct from: `principle-keep-the-core-pure` (a domain decision lands in an adapter or handler), `principle-parse-at-the-boundary` (untrusted data enters and needs validating), `principle-type-system-discipline` (types permit invalid combinations or semantic mix-ups).

Done: consumers see only domain types, and general mechanisms carry no special-case policy.
