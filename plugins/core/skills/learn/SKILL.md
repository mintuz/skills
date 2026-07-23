---
name: learn
description: WHEN a significant change reveals durable project knowledge for CLAUDE.md, especially a gotcha, recurring constraint, reusable practice, or architectural decision; NOT for already-documented, obvious, trivial, or one-off details; decides significance, placement, and format, then records the lesson.
---

# Learn

Turn **"What do I wish I'd known at the start?"** into a future-facing lesson. Process each candidate independently. Completion is binary: record it once or explicitly judge it non-qualifying.

## 1. Extract the lesson

Read the relevant implementation, tests, task history, and applicable `CLAUDE.md` guidance. State the candidate as knowledge a future developer can act on:

> When [context], [action or constraint], because [non-obvious reason].

Use the task history as evidence; write the durable rule rather than a recap of this task.

**Complete when:** every candidate identifies its recurring context, required action or decision, and non-obvious reason.

## 2. Apply the significance gate

A candidate qualifies only when it is project-specific, likely to recur, actionable, and meets at least one of these signals:

- saves substantial rediscovery, roughly 30 minutes or more;
- prevents a class of bugs or repeated failure;
- reveals a non-obvious behavior, dependency, edge case, or constraint;
- preserves architectural or domain rationale and its trade-offs;
- captures reusable setup, tooling, testing, or implementation practice.

An obvious standard practice, task-local implementation detail, trivial change, or exact duplicate is non-qualifying. When existing guidance is incomplete or inaccurate, update that single source instead of adding a second rule.

**Complete when:** every candidate is either qualifying with at least one significance signal or non-qualifying with a concrete reason.

## 3. Give the lesson one home

Read every `CLAUDE.md` whose scope covers the affected code, from the repository root to the nearest applicable descendant. Place the lesson in the narrowest file whose future readers need it:

- update the existing rule when it already owns the subject;
- otherwise use the most relevant existing section;
- add the smallest descriptive heading beside related guidance only when no section fits.

Keep the rule, rationale, conditions, and caveats together. Repository-wide knowledge belongs in the root file; area-specific knowledge belongs in that area's file.

**Complete when:** one file and section own the lesson, with no duplicate or contradiction in any applicable `CLAUDE.md`.

## 4. Record the lesson

Match the target file's voice, heading depth, terminology, and formatting. Use the branch that fits:

- **Gotcha or constraint:** condition → failure mode → remedy.
- **Decision:** context → choice → rationale and trade-offs.
- **Practice or setup:** trigger → action → reason or verification.

Lead with the actionable rule and keep its reason adjacent. Add the smallest concrete example only when prose cannot make correct use clear.

When documentation edits are in scope, edit `CLAUDE.md` directly. When the user requested a proposal, return the target path, section, and exact Markdown instead.

**Complete when:** a future reader can tell when the lesson applies, what to do, and why.

## 5. Verify the integration

Re-read the changed section in context and search the applicable guidance for equivalent or conflicting rules. Report each candidate as either:

- `Recorded: [CLAUDE.md path] → [section]`
- `Non-qualifying: [reason]`

**Complete when:** every candidate is accounted for exactly once, each recorded lesson is consistent and discoverable, and the final diff contains only the necessary guidance change.
