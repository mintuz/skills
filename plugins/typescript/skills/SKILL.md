---
name: typescript
description: WHEN writing or reviewing TypeScript or defining types and runtime schemas; NOT for JavaScript-only work; applies strict, schema-first, immutable patterns and verifies them with project checks.
---

# TypeScript Best Practices

Work from each trust boundary inward: validate runtime data once as it enters the application, then rely on strict TypeScript inside.

## 1. Inspect the local contract

Read the applicable repository instructions, `tsconfig.json`, package manifests, existing schemas and type helpers, affected callers, and nearby tests. Reuse the project's runtime schema library and established patterns.

Classify every changed data source and shape:

- **Boundary data:** API responses, user input, database results, files, environment configuration, queues, webhooks, or shared cross-system contracts.
- **Internal data:** values created and consumed entirely inside checked TypeScript.

**Complete when:** every changed data source and shape is classified and the existing project mechanism for its type, validation, and verification is known.

## 2. Design from the boundary inward

For boundary data, accept `unknown`, validate it at entry with a runtime schema, and derive the TypeScript type from that schema. Reuse an existing schema when it already owns the contract. Use a schema for domain values with runtime constraints even when they are created internally.

For internal data without runtime constraints, use a plain type. Keep one source of truth for each shape.

Read [schemas.md](references/schemas.md) before changing a trust boundary, validated domain value, shared contract, or schema-backed test factory.

**Complete when:** every changed boundary rejects invalid input before trusted code receives it, and every changed shape has one authoritative schema or type.

## 3. Implement explicit contracts

Apply these rules to every changed TypeScript surface:

- Use `strict: true` and preserve stricter existing compiler checks. Replace `any` with a specific type or `unknown` plus narrowing.
- Use `type` for data and unions; reserve `interface` for behavior contracts such as ports and adapters.
- Prefer runtime validation or narrowing to assertions. When an assertion is unavoidable, state the invariant that makes it safe.
- Declare function return types and mark data `readonly` where mutation is not part of the contract.
- Return new arrays and objects instead of mutating inputs.
- Use an options object for three or more parameters and descriptive options instead of positional booleans.
- Prefer early returns for guard conditions and a discriminated result for expected recoverable failures.
- Brand primitive domain identifiers only when otherwise interchangeable values can be mixed accidentally.

Load the reference that matches the changed branch:

- [types-interfaces.md](references/types-interfaces.md) for declarations, `unknown`, assertions, or compiler strictness.
- [immutability.md](references/immutability.md) for data updates, function signatures, control flow, or result types.
- [utilities.md](references/utilities.md) for branded or utility types and the code-smell audit.

**Complete when:** every applicable rule is satisfied, or an exception names the invariant and why the project cannot express it more safely.

## 4. Verify the contract

Run the repository's smallest relevant typecheck, then focused lint and tests for the changed behavior. Exercise valid and invalid boundary inputs when runtime validation changed.

Audit the changed files for `any`, unexplained assertions, ignored compiler errors, accidental mutation, duplicated shapes, and unvalidated boundary data.

**Complete when:** relevant checks pass and every changed boundary has verification evidence, or each unavailable check and unresolved risk is reported explicitly.

## Report

Summarize the contracts changed, schemas and types reused or added, checks run with results, and any documented exceptions.
