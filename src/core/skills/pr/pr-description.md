# PR Description Writing

## Analyzing Commits

Look for:

- Patterns in commit messages (types, scopes)
- Logical groupings of changes
- Breaking change indicators (`!`, `BREAKING CHANGE`)
- Issue references (`#123`, `Fixes #456`)

## GitHub Issue Linking

When commits reference issues, enrich the description with:

- Issue titles for "Closes #X" links
- Related work from issue searches
- Verification that referenced issues are still open

## Templates

### Small PR (1-3 files, up to 100 lines)

```markdown
## Summary

[1-2 sentences on what this does and why]

## Changes

- [One bullet per change the evidence shows; one bullet is enough]

## Testing

- Automated: [command and result, or `Not performed`]
- Manual testing: [what was checked, or `Not performed`]

[If UI change: screenshot, or state that it is still required]
```

### Medium PR (4-15 files, 101-500 lines)

```markdown
## Summary

[Brief description of what this PR does and why (2-3 sentences max)]

## Changes

- [Bullet points of key changes]
- [Focus on user-visible or architectural changes]
- [Group related changes together]

## Context

[Why is this change needed? What problem does it solve?]

Closes #123

## Testing

### Automated

- [command that ran]: [passed or failed]
- [check the evidence names but did not run]: `Not performed`

### Manual Testing

[`Not performed`, or the steps that were run]

Steps for reviewers to verify:

1. [Step one]
2. [Step two]
3. [Expected result]

## Screenshots

[Before/after or demo - required for UI changes]

## Checklist

- [ ] Code follows project conventions
- [ ] Self-reviewed changes
- [ ] No secrets committed
- [ ] Documentation updated (if needed)
```

### Large PR (16+ files or 501+ lines) or Breaking Changes

```markdown
## Summary

[What this PR does - keep it brief]

**Risk Level**: [Low | Medium | High]

## Changes

### [Area 1]

- [Changes in this area]

### [Area 2]

- [Changes in this area]

## Context

[Why is this change needed?]

Relates to #123

## Architecture

[If significant: brief explanation of design decisions]

## Breaking Changes

[If any - be explicit about what breaks and how to migrate]

### Migration Steps

1. [Step one]
2. [Step two]

### Rollback Plan

[How to revert if needed]

## Testing

### Automated

- [command that ran]: [passed or failed]
- [check the evidence names but did not run]: `Not performed`

### Manual Testing

[`Not performed`, or the steps that were run]

1. [Detailed steps]
2. [Expected outcomes]

### Risk Areas

- **[Area]**: [What could go wrong and how it was mitigated]

## Screenshots

[Before/after comparisons]

## Deployment Notes

[Any special deployment considerations]

## Checklist

- [ ] Code follows project conventions
- [ ] Self-reviewed changes
- [ ] No secrets committed
- [ ] Documentation updated
- [ ] Breaking changes documented
- [ ] Rollback plan verified
```

## Section Writing Guidelines

### Summary

- Lead with user impact or business value
- One paragraph max
- Avoid implementation details
- Use present tense: "Adds..." not "Added..."

### Changes

- List only changes the diff or the supplied evidence shows; add no bullet for a test, doc, or file change the evidence does not name
- Do not pad the list to fill the template
- Highlight what changed, not how (reviewers read the diff)
- Group by component/area when there are many changes
- Use verb phrases: "Adds...", "Fixes...", "Updates..."
- Summarise meaningfully rather than listing every file

### Context

- Explain the why: the motivation for the change
- Link relevant issues, tickets, or discussions
- Mention alternatives considered, briefly
- Include relevant constraints or decisions

### Testing

- Record each check with its real status: passed, failed, or `Not performed`
- Never record a test outcome as an unchecked box; reserve checkboxes for actions the author still has to take
- Name each check by the command that ran; label it unit, integration, or E2E only when the evidence says which
- Include manual testing steps when not obvious
- Note areas that need extra review attention

### Screenshots

- Always required for UI changes (screenshots or GIFs)
- Show before/after for modifications
- Annotate if helpful
- Use GIFs for interaction changes

### Migration

- Include only for breaking changes
- Be explicit about steps
- Include the rollback procedure
- Note any downtime or data impact

## Unknown Facts

When a section needs a fact the evidence does not give (risk level, rollback plan, deployment notes, external usage), write a marked placeholder such as `[Author: add rollback plan]`. Do not invent a value. Keep the section: reviewers use the placeholder to see what is still missing.

## Tone

Professional, not formal. State risks and limitations honestly.
