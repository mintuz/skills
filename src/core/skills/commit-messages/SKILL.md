---
name: commit-messages
description: WHEN writing git/conventional commits; NOT for PR text; returns concise, why-first commit lines with proper type/scope.
---

# Commit Messages

Write an evidence-backed [Conventional Commit](https://www.conventionalcommits.org/)
for one logical change.

## 1. Establish the evidence

The evidence is the staged diff and facts the user supplied. Every type, scope,
effect, issue number, and metric must trace to it. If the change itself is
missing, stop and ask for the staged diff or a short summary of what changed. If
only the motivation is missing, write the header and omit the body.

## 2. Keep the commit atomic

One commit holds changes with one intent that should be reverted together. A fix
and its focused regression test belong together. File count, directories, or
multiple implementation types alone do not justify a split.

Split unrelated intents or changes that should be independently revertible. For
each proposed commit, group its changes and give its exact message. Leave the
index unchanged unless the user explicitly asks you to alter it.

## 3. Write the message

```text
type(scope)!: subject

optional body

optional footer
```

Choose the type from the observed intent:

- `feat`: new user-facing capability
- `fix`: user-facing defect correction
- `docs`, `style`, `refactor`, `perf`: documentation, formatting-only,
  behaviour-preserving restructuring, or measured performance work
- `test`: standalone test work; keep focused regression tests with their change
- `build`, `ci`: build/dependency or CI changes
- `chore`: evidenced maintenance outside source and tests
- `revert`: an evidenced revert of an earlier commit

Follow the repository's scope convention. When none is supplied, use the
smallest owning area the evidence supports; omit the scope when no single area
owns the change.

Write the subject in lowercase imperative mood with no trailing period. Aim for
50 characters; never exceed 72. Name the specific outcome.

Add a body only for motivation or context the header cannot carry. Explain why
the change was needed, not what the diff mechanically does. Wrap at 72
characters.

Add issue references, claims, and metrics only when the evidence supplies them.
When the user asks for an unsupported claim, leave it out, name it, and give the
reason.

For a breaking change, add `!` to the header and a `BREAKING CHANGE:` footer
stating the old contract, new contract, and migration action.

For a revert, use the `revert` type and name the reverted change in the subject,
reusing the reverted commit's subject wording unless it breaks the subject
rules. Add a footer naming the reverted commit hash, such as `Refs: <hash>`.
Give the observed problem as the motivation.

## Return

- Enough evidence: the complete ready-to-use message, no tutorial.
- Multiple logical changes: one line stating how their intents differ, not a
  bare list of messages. Then one exact message per commit, index unchanged.
- Missing evidence: name the parts of the message that would be guesswork, such
  as the type, the scope, or the effect. Ask only for the minimum facts needed.
  An instruction to answer without questions does not make a guess trustworthy.
