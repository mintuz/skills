---
name: commit-messages
description: WHEN writing git/conventional commits; NOT for PR text; returns concise, why-first commit lines with proper type/scope.
---

# Commit Messages

Write an evidence-backed [Conventional Commit](https://www.conventionalcommits.org/)
for one logical change.

## 1. Establish the evidence

Use the staged diff and facts the user supplied. Every type, scope, effect, issue
number, and metric must trace to that evidence. If the change or motivation is
missing, stop and ask for the staged diff or a short change-and-motivation summary.

## 2. Keep the commit atomic

One commit contains changes with one intent that should be reverted together. A
fix and its focused regression test belong together. File count, directories,
or multiple implementation types alone do not justify a split.

Split unrelated intents or changes that should be independently revertible. For
each proposed commit, group the affected changes and give its exact message. Keep
the index unchanged unless the user explicitly asks you to alter it.

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

Follow the repository's scope convention. When none is supplied, use the
smallest owning area supported by the evidence; omit the scope when no single
area owns the change.

Write the subject in lowercase imperative mood with no trailing period. Aim for
50 characters and never exceed 72. Be specific about the outcome.

Add a body only when it carries motivation or context that the header cannot.
Explain why the change was needed, not what the diff mechanically does, and wrap
it at 72 characters.

Add issue references, claims, and metrics only when the evidence supplies them.
For a breaking change, add `!` to the header and a `BREAKING CHANGE:` footer that
states the old contract, new contract, and migration action.

## Return

- Enough evidence: return the complete ready-to-use message without a tutorial.
- Multiple logical changes: state in one line how their intents differ; do not
  merely list messages. Then return one exact message per commit without
  mutating the index.
- Missing evidence: briefly state what is missing and why a trustworthy, specific
  message cannot be written yet, then ask only for the minimum facts needed.
