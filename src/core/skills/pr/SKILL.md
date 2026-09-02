---
name: pr
description: WHEN drafting PR descriptions, sizing/splitting work, or opening pull requests on GitHub or Forgejo/Gitea; NOT for commit messages; provides reviewer-first templates and gh or tea pr steps.
---

# Pull Request Skills

Guidelines for creating comprehensive pull request descriptions and submitting PRs efficiently.

## Philosophy

- **Reviewer-first** - Optimize for the person reviewing, not the author
- **Context over detail** - Explain why, link to how
- **Scannable** - Busy reviewers skim; make it easy
- **Actionable** - Clear testing steps, obvious risks
- **Honest** - Flag complexity, don't hide it

## Scope

This skill covers PR descriptions, PR sizing, and PR creation on GitHub (`gh`) and on Forgejo or Gitea (`tea`).

This skill does not write commit messages. If a request also asks for a commit message, draft the PR content and direct the author to the `commit-messages` skill for the commit message.

## Gathering Context

Before creating a PR, gather information about the changes. Run `git fetch origin` first. Compare against the remote-tracking branch `origin/main`, because local `main` can be behind the remote. On a fork, fetch the remote that owns the base branch (often `upstream`) and compare against that remote's branch instead. Replace `main` with the repository's default branch when it differs. `git remote show origin` prints it as `HEAD branch` on any host.

```bash
# Compare branch changes against main
git diff origin/main...HEAD

# List modified files
git diff origin/main...HEAD --name-only

# Review commit history
git log origin/main..HEAD --oneline

# Get detailed commit messages
git log origin/main..HEAD --format="%B---"

# Get files changed with stats
git diff origin/main...HEAD --stat
```

### Size sanity check

Run `git diff origin/main...HEAD --stat` before you choose a template or draft a description. Compare the file and line totals with the author's account of the change.

Stop when the totals contradict the author's account of the change, or when the diff includes bulk generated or vendored content the author did not mention (for example `dist/`, `vendor/`, `node_modules/`, or lockfiles). Report the totals and the mismatch to the author. Ask the author to confirm that those files belong in the PR or to remove them. Do not draft the description until the author answers. A description that presents unmentioned bulk content as intentional hides the mismatch from reviewers. A diff that touches several source directories for one coherent change is not a mismatch; report the scope and continue.

If you cannot run the command, size the PR from the facts you have. Draft the description. Say that the size is unverified. Do not refuse to draft because the stat is missing.

## Quick Reference

| Task | Guide |
| ---- | ----- |
| Sizing and splitting PRs | [pr-sizing.md](pr-sizing.md) |
| Writing PR descriptions | [pr-description.md](pr-description.md) |
| Creating PRs with `gh` (GitHub) or `tea` (Forgejo/Gitea) | [pr-creation.md](pr-creation.md) |

## When to Use Each Guide

### PR Sizing

Use [pr-sizing.md](pr-sizing.md) when you need:

- Size category definitions (small/medium/large)
- Signs a PR should be split
- Strategies for splitting large PRs
- Guidance on when large PRs are acceptable

### PR Description Writing

Use [pr-description.md](pr-description.md) when you need:

- Templates for small, medium, or large PRs
- Section writing guidelines (summary, changes, testing, etc.)
- Commands to gather context from git history

### PR Creation

Use [pr-creation.md](pr-creation.md) when you need:

- `gh pr create` and `tea pr create` command syntax and options
- HEREDOC pattern for multi-line bodies
- Draft PRs (pass `--draft` whenever the title or body calls the PR a draft or WIP), reviewers, labels, and milestones
- Troubleshooting common errors
