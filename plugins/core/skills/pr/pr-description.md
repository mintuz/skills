# PR Title and Description

Write a **reviewer brief** from the outcome, motivation, and review boundaries; leave line-level implementation detail to the diff.

## Title

Name the observable outcome in imperative form, following repository conventions. Use a stable area or product noun when it improves scanning. Keep stack position, issue numbers, and draft status in GitHub metadata or the body unless repository convention puts them in titles.

## Adaptive template

Start with the core sections and add conditional sections only when they carry reviewer information:

```markdown
## Summary

[Observable outcome and why it matters in one short paragraph.]

## Changes

- [Meaningful behavior or implementation boundary]

## Validation

- `[exact command]` — [result and what it proves]
```

Add these where the change demands them:

```markdown
## Context

[Constraints, linked issue/specification, prior decisions, or stack relationship.]

## Risk and rollback

- **Risk:** [failure mode and affected surface]
- **Mitigation:** [evidence or safeguard]
- **Rollback:** [safe recovery]

## Deployment or migration

[Ordering, compatibility window, data handling, downtime, or consumer action.]

## Screenshots

[Before/after images or interaction recording for visual changes.]

## Review focus

1. [Highest-risk boundary]
2. [Next dependency in review order]
```

Link issues with the repository's intended keyword: use a closing keyword only when merging this pull request should close the issue.

## Evidence rules

- Summarize behavior and boundaries instead of listing files or commits.
- Report checks in observed terms: command, result, and coverage. Label unexecuted work as a reviewer step or verification gap.
- Name risks proportionately. Breaking behavior includes affected consumers, migration, deployment order, and rollback.
- Give visual changes inspectable evidence. State the concrete capture gap when the environment prevents it.
- Describe a stack with the preceding pull request or branch, dependency reason, and review order.
- Match the repository template when one exists; retain every required field.

## Quality gate

Before returning the title/body, verify that:

- every changed area appears in the summary, changes, validation, or risk story;
- every factual claim agrees with the base-to-head diff and executed checks;
- conditional sections are present for material UI, migration, deployment, compatibility, data, security, or rollback concerns;
- the title and first paragraph explain one coherent reason to merge; and
- every placeholder is resolved, every heading carries reviewer information, every reported result was observed, and repository-required checkboxes have truthful states.
