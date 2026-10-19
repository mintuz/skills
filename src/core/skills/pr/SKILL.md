---
name: pr
description: WHEN drafting PR descriptions, sizing/splitting work, or opening pull requests on GitHub or Forgejo/Gitea; NOT for commit messages; provides reviewer-first templates and gh or tea pr steps.
---

# Pull Request Skills

## Philosophy

- **Reviewer-first**: optimise for the reviewer, not the author.
- **Context over detail**: explain why; link to how.
- **Scannable**: busy reviewers skim.
- **Actionable**: clear testing steps, obvious risks.
- **Honest**: flag complexity; never hide it.

## Scope

Covers PR descriptions, PR sizing, and PR creation on GitHub (`gh`) and on Forgejo or Gitea (`tea`).

Commit messages are out of scope. When a request also asks for a commit message, draft the PR content and direct the author to the `commit-messages` skill for the commit message.

## Gathering Context

Run `git fetch origin` first. Compare against the remote-tracking branch `origin/main`: local `main` can be behind the remote. On a fork, fetch the remote that owns the base branch (often `upstream`) and compare against that remote's branch instead. When the repository's default branch is not `main`, substitute it; `git remote show origin` prints it as `HEAD branch` on any host.

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

Before choosing a template or drafting a description, run `git diff origin/main...HEAD --stat` and compare the file and line totals with the author's account of the change.

Stop when the totals contradict that account, or when the diff includes bulk generated or vendored content the author did not mention (e.g. `dist/`, `vendor/`, `node_modules/`, lockfiles). Report the totals and the mismatch, and ask the author to confirm those files belong in the PR or to remove them. Do not draft the description until the author answers: a description that presents unmentioned bulk content as intentional hides the mismatch from reviewers. A diff that touches several source directories for one coherent change is not a mismatch; report the scope and continue.

If you cannot run the command, size the PR and draft from the facts you have, and say the size is unverified. Do not refuse to draft because the stat is missing.

## Guides

| Guide | Use for |
| ----- | ------- |
| [pr-sizing.md](pr-sizing.md) | Size categories (small/medium/large); signs a PR should be split; splitting strategies; when large PRs are acceptable |
| [pr-description.md](pr-description.md) | Commit analysis and issue linking; templates for small, medium, and large PRs; section guidelines (summary, changes, testing, etc.) |
| [pr-creation.md](pr-creation.md) | `gh pr create` (GitHub) and `tea pr create` (Forgejo/Gitea) syntax and options; HEREDOC for multi-line bodies; draft PRs, reviewers, labels, and milestones; troubleshooting |

**Draft rule:** pass `--draft` whenever the title or body calls the PR a draft, WIP, or not ready.
