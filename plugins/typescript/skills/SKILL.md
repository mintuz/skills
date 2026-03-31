---
name: typescript
description: "WHEN writing TypeScript, defining types/schemas in .ts/.tsx files, or building type-safe apps with Zod; NOT for plain JavaScript without types; generates schema-first validation with z.infer, creates discriminated unions and branded types, defines strict interfaces and type guards, and enforces immutable patterns with readonly."
---

# TypeScript Best Practices

Production-grade TypeScript development with schema-first design, strict type safety, and immutable patterns.

## Core Principles

1. **Type Safety at All Boundaries** - Runtime validation (schemas) + compile-time safety (TypeScript)
2. **Schema-First Development** - Define schemas before types, derive types from schemas
3. **Immutability** - No data mutation, always create new values
4. **Explicit Types** - No implicit any, strict mode enabled
5. **Behavior over implementation** - Focus on contracts and outcomes

## Quick Reference

| Topic                                                                  | Guide                                                 |
| ---------------------------------------------------------------------- | ----------------------------------------------------- |
| Schema-first development, when to use schemas vs types, test factories | [schemas.md](references/schemas.md)                   |
| Type vs interface, any vs unknown, assertions, strict mode             | [types-interfaces.md](references/types-interfaces.md) |
| Immutability patterns, readonly, forbidden methods, error handling     | [immutability.md](references/immutability.md)         |
| Branded types, utility types, code smells reference                    | [utilities.md](references/utilities.md)               |
| Common TypeScript patterns with examples                               | [patterns.md](references/patterns.md)                 |

## Inline Example: Schema-First Pattern

```typescript
import { z } from "zod";

// 1. Define schema at trust boundary
const UserSchema = z.object({
  id: z.string().brand<"UserId">(),
  email: z.string().email(),
  role: z.enum(["admin", "member"]),
});

// 2. Derive type from schema
type User = z.infer<typeof UserSchema>;

// 3. Validate at boundary, trust internally
function parseUser(raw: unknown): User {
  return UserSchema.parse(raw);
}
```

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
- [ ] Schemas at all trust boundaries (API, user input, files)
- [ ] Types derived from schemas using `z.infer`
- [ ] Using `type` for data, `interface` only for behavior contracts
- [ ] All data structures use `readonly` where appropriate
- [ ] No array mutations (push, pop, splice, etc.)
- [ ] Functions with 3+ params use options objects
- [ ] No boolean positional parameters
- [ ] Result types for operations that can fail
- [ ] Early returns instead of nested conditionals
- [ ] Test factories validate with schemas
- [ ] Branded types for domain concepts that shouldn't mix
- [ ] Explicit return types on functions
