---
name: typescript
description: WHEN writing or reviewing TypeScript, defining types/schemas, or building type-safe apps; NOT for JavaScript-only files, framework architecture choices, or bundler configuration; outputs strict, schema-first, production-ready code.
---

# TypeScript Best Practices

Production-grade TypeScript development with schema-first design, strict type safety, and immutable patterns.

## Core Principles

1. **Type Safety at All Boundaries** - Runtime validation (schemas) + compile-time safety (TypeScript)
2. **Schema-First at Trust Boundaries** - Where data enters the system, define the schema before the type, and derive the type from the schema
3. **Immutability at the boundary** - Never mutate a value a caller owns or a value you have already returned. Local mutation is allowed inside the function that created the value, if the value cannot escape before the function returns.
4. **Explicit Types** - No implicit any, strict mode enabled
5. **Behavior over implementation** - Focus on contracts and outcomes

## Rules for Hard Cases

### No schema library is available

A trust boundary still needs a runtime check. Do not add a dependency when the dependency set is frozen. Do not skip the check. Write a decoder that accepts `unknown`. Narrow each field with `typeof`, `Array.isArray`, or a type predicate. Report an invalid value through the failure path the function already contracts, such as a Result variant or a `null` return.

### Building a collection in a hot path

Create the accumulator inside the function. Append to it with `push`, or assign to it by key. Return it under a `readonly` type. Do not build a growing collection with `[...accumulator, item]` or `{ ...accumulator, [key]: value }` inside a loop. Each step copies an accumulator that keeps growing, so the loop becomes quadratic.

### External data that is not fully documented

Validate every field the source documents. Type each undocumented part as `unknown`. Do not guess its field names. Then say in your answer what the validator does not check, and why. A reader must see how far the validation reaches without reading the code.

### An assertion the type system cannot avoid

Never use `as` to state a fact you have not checked. Never assert a shape because a document, a contract, or an upstream promise describes it. Narrow a value you have just checked with a user-defined type predicate, or with one assertion placed immediately after the check. Name the checked condition, in the predicate name or in a comment on the assertion.

## Quick Reference

| Topic                                                                  | Guide                                                 |
| ---------------------------------------------------------------------- | ----------------------------------------------------- |
| Schema-first development, when to use schemas vs types, test factories | [schemas.md](references/schemas.md)                   |
| Type vs interface, any vs unknown, assertions, strict mode             | [types-interfaces.md](references/types-interfaces.md) |
| Immutability patterns, readonly, forbidden methods, error handling     | [immutability.md](references/immutability.md)         |
| Branded types, utility types, code smells reference                    | [utilities.md](references/utilities.md)               |
| Common TypeScript patterns with examples                               | [patterns.md](references/patterns.md)                 |

## When to Use Each Guide

### Schemas

Use [schemas.md](references/schemas.md) when you need:

- Schema-first development patterns
- Decision framework: when schema is required vs optional
- Trust boundary identification
- Test data factory patterns with schema validation
- Examples of schema usage (API responses, business validation)

### Types and Interfaces

Use [types-interfaces.md](references/types-interfaces.md) when you need:

- Type vs interface guidance
- The any vs unknown decision
- Type assertion best practices
- Strict mode configuration
- tsconfig.json settings

### Immutability

Use [immutability.md](references/immutability.md) when you need:

- Immutability patterns (spread operators)
- Readonly modifiers
- Forbidden array methods reference
- Options objects vs positional parameters
- Boolean parameter anti-patterns
- Result types for error handling
- Early return patterns

### Utilities

Use [utilities.md](references/utilities.md) when you need:

- Branded types for domain concepts
- Built-in utility types (Pick, Omit, Partial, etc.)
- Custom utility types
- Code smell reference tables

### Patterns

Use [patterns.md](references/patterns.md) when you need:

- Schema-first examples at trust boundaries
- Internal type examples without schemas
- Schema with test factory patterns
- Result type for error handling
- Branded types for domain safety
- Immutable array operations
- Options object pattern

## Quick Reference: Decision Trees

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
- [ ] Using `type` for data, `interface` only for behavior contracts
- [ ] All data structures use `readonly` where appropriate
- [ ] No mutation of caller-owned or already-returned values; any mutation stays inside the function that created the value
- [ ] Functions with 3+ params use options objects
- [ ] No boolean positional parameters
- [ ] Every operation that can fail reports the failure through its own contract (a Result variant, a `null` return, or a documented throw)
- [ ] Early returns instead of nested conditionals
- [ ] Test factories validate with schemas
- [ ] Branded types for domain concepts that shouldn't mix
- [ ] Explicit return types on functions
