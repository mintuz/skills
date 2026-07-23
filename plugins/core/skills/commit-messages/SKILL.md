---
name: commit-messages
description: WHEN writing or reviewing Git/Conventional Commit messages or deciding commit boundaries; NOT for pull request text; returns atomic, why-first messages with repository-compatible type, scope, body, and breaking-change metadata.
---

# Commit Messages

Treat each commit as an atomic explanation: the header names the outcome, and the optional body preserves why it was necessary.

## 1. Establish the change set

Read the repository's commit conventions, then inspect the staged diff and recent commit history when available. Otherwise use the diff or change description the user supplied.

Map every change to one logical intent. Split changes when they have different reasons, Conventional Commit types, release effects, or revert boundaries. Keep inseparable implementation, tests, and documentation together. Order prerequisite refactors before behavior that depends on them.

**Complete when:** every change belongs to exactly one independently understandable commit and the commit order is explicit.

## 2. Choose the header

Use the repository's established types and scopes first. Otherwise use:

| Type | Intent |
| --- | --- |
| `feat` | Add user-visible behavior |
| `fix` | Correct user-visible behavior |
| `docs` | Change documentation only |
| `style` | Change formatting without behavior |
| `refactor` | Change code structure without behavior |
| `perf` | Improve performance |
| `test` | Add or correct tests |
| `build` | Change dependencies or the build system |
| `ci` | Change continuous integration |
| `chore` | Maintain the repository without changing product or test behavior |

Format the header as:

```text
type[(scope)][!]: imperative description
```

- Use `feat` for a feature and `fix` for a bug fix.
- Add a stable noun scope only when one codebase area owns the change.
- Add `!` immediately before `:` for a breaking change.
- Write a specific, lowercase, imperative description with no final period.
- Follow the repository's length limit; otherwise aim for 50 characters and keep the header within 72.

**Complete when:** the header identifies the change's primary intent, matches repository convention, and contains no vague terms such as `stuff`, `changes`, or `update code`.

## 3. Preserve the why

Add a body only when the header cannot preserve relevant motivation, constraints, trade-offs, or non-obvious effects. Start it after a blank line, wrap at 72 characters when repository style requires it, and avoid narrating the diff.

Add issue references and other trailers after another blank line. Represent a breaking change with `!`, a `BREAKING CHANGE: description` footer, or both; include migration guidance when consumers must act.

```text
feat(api)!: require email for authentication

Email is now the stable login identifier across identity providers.

BREAKING CHANGE: clients must send `email` instead of `username`.
```

**Complete when:** every non-obvious reason and required consumer action is present once, and the body and footers add information beyond the header.

## 4. Return the result

For one atomic commit, return the complete ready-to-paste message in a single code block. For a mixed change set, recommend the split and return each commit in order with its change boundary and complete message. When reviewing an existing message, identify the violated rule and provide the corrected message. When the user asks only for guidance, answer from the rules above without inventing a change set.

**Complete when:** every proposed commit has a final message with no placeholders, every mapped change is represented exactly once, and any split can be staged without mixing intents.

## Examples

```text
fix(auth): prevent redirect loop after session expiry

Clear the saved redirect when the session expires so login does not
return the user to the protected route.
```

```text
refactor(validation): share request schemas

Keep route validation rules in one place so fixes cannot drift between
handlers.
```
