# Creating Pull Requests from the Command Line

Reference for `gh pr create` on GitHub and `tea pr create` on Forgejo or Gitea. Identify the host from the remote URL before choosing the tool: `gh` does not work against a Forgejo or Gitea host.

For PR description templates, see [pr-description.md](pr-description.md).

## Prerequisites

1. **Committed changes**: all changes committed locally.
2. **Branch pushed**: your branch pushed to the remote.
3. **CLI authenticated**: on GitHub run `gh auth status`; on Forgejo/Gitea run `tea whoami`.

## Basic Command

```bash
gh pr create --title "PR title" --body "PR description"
```

When the request names the branch, pass `--head <branch>`. Without it, `gh` and `tea` use the checked-out branch, which can differ.

## Recommended Workflow

### 1. Verify Branch State

```bash
# Check current branch and uncommitted changes
git status

# Verify commits are ready
git fetch origin && git log origin/main..HEAD --oneline

# Ensure branch is pushed
git push -u origin HEAD
```

### 2. Create PR with HEREDOC

Pass multi-line bodies through a HEREDOC. Choose the template from [pr-description.md](pr-description.md) by PR size:

```bash
gh pr create --title "Your PR title" --body "$(cat <<'EOF'
# Paste the template from pr-description.md here.
# Choose the template by the size category in pr-sizing.md.
EOF
)"
```

### 3. Draft Status

Apply the draft rule in SKILL.md; body text alone does not change the PR state. On GitHub, `--draft` sets draft state. On Forgejo and Gitea, a `WIP:` title prefix sets draft state, and `tea pr create --draft` adds that prefix. Without the flag or prefix, the host opens the PR as ready for review.

### 4. Labels

Pass only labels that exist in the repository; list them with `gh label list` (or `tea labels` on Forgejo/Gitea). If the repository's labels are unknown and you cannot list them, pass no `--label` and say why.

### 5. Common Options

```bash
# Create as draft PR
gh pr create --draft --title "Feature name" --body "..."

# Assign reviewers
gh pr create --reviewer username1,username2 --title "..." --body "..."

# Add labels
gh pr create --label "enhancement" --label "needs-review" --title "..." --body "..."

# Link to milestone
gh pr create --milestone "v2.0" --title "..." --body "..."

# Specify base branch (if not main/master)
gh pr create --base develop --title "..." --body "..."

# Open in browser after creation
gh pr create --web --title "..." --body "..."
```

## Forgejo and Gitea with `tea`

Use `tea pr create` (alias `tea pulls create`). The same prerequisites and draft rule apply; flag names differ from `gh`:

| Purpose | `gh pr create` | `tea pr create` |
| ------- | -------------- | --------------- |
| Title | `--title` | `--title` |
| Body | `--body` or `--body-file` | `--description` |
| Base branch | `--base` | `--base` (default: repository default branch) |
| Head branch | `--head` | `--head` (default: current branch) |
| Draft | `--draft` | `--draft` (prepends `WIP: ` to the title; Gitea treats WIP-prefixed PRs as drafts) |
| Labels | `--label a --label b` | `--labels a,b` |
| Assignees | `--assignee` | `--assignees a,b` |
| Milestone | `--milestone` | `--milestone` |
| Reviewers | `--reviewer` | Not available at creation; request reviews in the web UI afterwards |

```bash
tea pr create \
  --base develop \
  --head feat/search-index \
  --draft \
  --title "Add search index rebuild command" \
  --description "$(cat <<'EOF'
## Summary

WIP: adds `search reindex`; incremental mode is not implemented yet.

## Testing

- Automated: `make test` passed
- Manual testing: not performed
EOF
)"
```

If the host is Forgejo or Gitea and `tea` is not installed, do not fall back to `gh`: give the `tea` command and state that `tea` must be installed and logged in first.

## Full Example

Uses the medium PR template from [pr-description.md](pr-description.md):

```bash
# Push branch first
git push -u origin feature/user-auth

# Create PR with full options
gh pr create \
  --title "Add JWT authentication" \
  --body "$(cat <<'EOF'
## Summary

Implements JWT-based authentication for all API endpoints, replacing session-based auth.

## Changes

- Add `AuthMiddleware` for token validation
- Create `/auth/login` and `/auth/logout` endpoints
- Add refresh token rotation
- Update API documentation

## Context

Moving to JWT improves scalability for our microservices architecture and enables stateless authentication.

Closes #123
Related to #100

## Testing

### Automated

- `npm test`: passed
- Integration tests: not performed

### Manual Testing

Steps for reviewers to verify:

1. Login with valid credentials → receive tokens
2. Access protected endpoint with token → success
3. Access with expired token → 401 response
4. Refresh token → new access token issued

## Screenshots

N/A - API changes only

## Checklist

- [ ] Code follows project conventions
- [ ] Self-reviewed changes
- [ ] No secrets committed
- [ ] Documentation updated
EOF
)" \
  --reviewer alice,bob \
  --label "enhancement" \
  --label "auth"
```

## After Creation

The command prints the PR URL. Follow-up commands:

```bash
# View PR in browser
gh pr view --web

# Check PR status
gh pr status

# List your open PRs
gh pr list --author @me
```

## Troubleshooting

### "no commits between main and HEAD"

The branch has no new commits. Commit your changes and check you are on the correct branch.

### "pull request already exists"

A PR already exists for this branch. View it with `gh pr view`; modify it with `gh pr edit`.

### Authentication errors

Re-authenticate with `gh auth login` on GitHub or `tea login add` on Forgejo/Gitea.

### PR opened as ready when it should be a draft

The body said draft or WIP but `--draft` was not passed. On GitHub run `gh pr ready --undo` (draft PRs must be available for the repository's plan). On Forgejo/Gitea edit the title to start with `WIP:`.

### Wrong base branch

Pass `--base` with the correct target branch, as in `gh pr create --base develop` under [Common Options](#5-common-options).
