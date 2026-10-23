---
name: typescript
description: WHEN writing or reviewing TypeScript, defining types/schemas, or building type-safe apps; NOT for JavaScript-only files, framework architecture choices, or bundler configuration; outputs strict, schema-first, production-ready code.
---

# TypeScript Best Practices

Schema-first design, strict type safety, and immutable patterns.

## Core Principles

1. **Type safety at all boundaries**: runtime validation (schemas) plus compile-time safety (TypeScript) (`principle-parse-at-the-boundary`).
2. **Schema-first at trust boundaries**: where data enters the system, define the schema first and derive the type from it (`principle-type-system-discipline`).
3. **Immutability at the boundary**: never mutate a value a caller owns or a value you have already returned. Local mutation is allowed inside the function that created the value, if the value cannot escape before the function returns.
4. **Explicit types**: no implicit `any`; strict mode enabled.
5. **Behaviour over implementation**: focus on contracts and outcomes.

## Rules for Hard Cases

### No schema library is available

A trust boundary still needs a runtime check. When the dependency set is frozen, add no dependency and do not skip the check. Write a decoder that accepts `unknown`. Narrow each field with `typeof`, `Array.isArray`, or a type predicate. Report an invalid value through the failure path the function already contracts, such as a Result variant or a `null` return (`principle-parse-at-the-boundary`).

### Building a collection in a hot path

Create the accumulator inside the function, append with `push` or assign by key, and return it under a `readonly` type. Do not build a growing collection with `[...accumulator, item]` or `{ ...accumulator, [key]: value }` inside a loop: each step copies the growing accumulator, so the loop becomes quadratic.

### The request or a reused helper mutates in place

When a request says "update it in place", or a helper that you must reuse writes into its argument, still return a new value. Mutate the caller's value only when the caller's contract requires it, for example a documented mutable API or a measured hot path. Give a mutating helper only a value that you created. Keep the helper's behaviour unchanged for its other callers. When you return a new value against the request's wording, say so in your answer, and state why neither exception applies.

### External data that is not fully documented

Validate every field the source documents. Type each undocumented part as `unknown`; do not guess its field names. State in your answer what the validator does not check, and why, so a reader sees how far validation reaches without reading the code.

### An assertion the type system cannot avoid

Never use `as` to state a fact you have not checked, including a shape that a document, contract, or upstream promise describes. Narrow a value you have just checked with a user-defined type predicate, or with one assertion placed immediately after the check. Name the checked condition in the predicate name or in a comment on the assertion (`principle-type-system-discipline`, `principle-observe-dont-infer`).

## Reference Guides

| Guide                                                 | Read for                                                                                                                                           |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| [schemas.md](references/schemas.md)                   | Schema-first patterns; when a schema is required vs optional; trust boundary identification; test data factories with schema validation; schema examples (API responses, business validation) |
| [types-interfaces.md](references/types-interfaces.md) | Type vs interface; `any` vs `unknown`; type assertions; strict mode and tsconfig.json settings                                                     |
| [immutability.md](references/immutability.md)         | Immutability patterns (spread operators); `readonly`; forbidden array methods; options objects vs positional parameters; boolean parameter anti-patterns; Result types; early returns |
| [utilities.md](references/utilities.md)               | Branded types for domain concepts; built-in utility types (`Pick`, `Omit`, `Partial`, etc.); custom utility types; code smell tables               |
| [patterns.md](references/patterns.md)                 | Worked examples: schema-first at trust boundaries; internal types without schemas; schema with test factory; Result type; branded types; immutable array operations; options object |

## Decision Trees

### Should I use a schema?

```
Does data come from outside the application?
├── Yes → Schema required
└── No → Does it have validation rules (format, range, enum)?
    ├── Yes → Schema required
    └── No → Is it shared between systems?
        ├── Yes → Schema required
        └── No → Type is fine
```

### Should I use `type` or `interface`?

```
Am I defining a behavior contract for dependency injection?
├── Yes → interface
└── No → type
```

### Should I use `any` or `unknown`?

```
Never use any.
Always use unknown for truly unknown types.
```

### Options object or positional parameters?

```
How many parameters?
├── 1-2 → Positional is fine
└── 3+ → Use options object
```

## Summary Checklist

Before committing TypeScript code, verify:

- [ ] Strict mode enabled in tsconfig.json
- [ ] No `any` types (use `unknown` instead)
- [ ] Runtime validation at all trust boundaries (API, user input, files), by schema, or by a hand-written decoder when no schema library is available
- [ ] Where a schema library supplies the validator, the type is derived from the schema (for example `z.infer`) rather than declared a second time
- [ ] `type` for data, `interface` only for behaviour contracts
- [ ] All data structures use `readonly` where appropriate
- [ ] No mutation of caller-owned or already-returned values; any mutation stays inside the function that created the value
- [ ] Functions with 3+ params use options objects
- [ ] No boolean positional parameters
- [ ] Every operation that can fail reports the failure through its own contract (a Result variant, a `null` return, or a documented throw)
- [ ] Early returns instead of nested conditionals
- [ ] Test factories validate with schemas
- [ ] Branded types for domain concepts that shouldn't mix (`principle-type-system-discipline`)
- [ ] Explicit return types on functions
