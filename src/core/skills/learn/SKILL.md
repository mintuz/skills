---
name: learn
description: WHEN preserving a durable project learning, gotcha, or decision in repository instructions; NOT for trivial or one-off details; finds the authoritative instruction file and writes the smallest safe rule.
---

# Preserve a Project Learning

Capture the reusable rule, not the incident that revealed it.

## 1. Find the authority

Read the repository's instruction hierarchy and the relevant nearby section.
Follow pointers and generated-file notices to their owning source; the target may
be `AGENTS.md`, `CLAUDE.md`, or another local instruction file. Amend an existing
rule when it already owns the meaning.

Complete when the authoritative file, target section, and any overlapping rule
are identified.

## 2. Distil the lesson

Keep a learning only when it is verified and at least one is true:

- it prevents a recurring class of bugs or security failures;
- it records a non-obvious invariant, constraint, or approved operating path;
- it preserves architectural rationale that the repository does not express;
- it would save meaningful investigation time on a future task.

Write only the durable mechanism or rule. Exclude incident chronology,
speculation, transient state, and implementation details unlikely to recur.
Strip credentials, personal or customer data, and sensitive topology; refer to
the owning secret or environment manager instead of a live value. Preserve the
approved path. Explicitly label every supplied security bypass as a temporary,
unsafe diagnostic that must not become repository guidance. Keep the durable
patch on the approved path only; name the excluded setting or tool outside the
proposed patch so the prohibition is unambiguous, while omitting its value and
all secrets.

Complete when every claim is evidence-backed, reusable, non-sensitive, and not
already documented.

## 3. Make the smallest patch

Match the target file's voice and structure. Prefer one imperative sentence or
bullet in an existing section. Add a heading, rationale, checklist, or example
only when the learning cannot be applied correctly without it. Do not duplicate
nearby guidance.

If the user requested a proposal, return the exact patch and state that files
remain unchanged. If the user authorized an edit, apply only that patch and
report the file changed.

Complete when the authoritative instructions contain one safe, discoverable,
non-duplicated rule and no unrelated documentation changed.
