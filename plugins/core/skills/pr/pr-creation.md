# Creating a Pull Request with `gh`

Use this branch when the title/body are final and the branch is already committed and pushed. Publication beyond creation belongs to `core:ship-pr`.

## 1. Verify preconditions

Resolve the exact base, head, remote, and requested draft state, then run:

```bash
gh auth status
git status --short --branch
git log <base>..HEAD --oneline
git diff <base>...HEAD --check
git rev-parse HEAD
git rev-parse @{upstream}
gh pr list --head <head> --state open
```

The worktree may contain unrelated local work, but the pull request description must represent the committed base-to-head comparison. The local and upstream SHAs must match. Reuse the single open pull request for the head when one exists.

**Complete when:** authentication works, at least one head commit exists, local HEAD equals its upstream, the finished body reports the verification state truthfully, and the head has zero or one open pull request.

## 2. Create

Save the finished Markdown body to a temporary file, then create a ready-for-review pull request unless the user or repository policy requires a draft:

```bash
gh pr create \
  --base <base> \
  --head <head> \
  --title "<title>" \
  --body-file <body-file>
```

Add `--draft`, `--reviewer`, `--label`, `--assignee`, or `--milestone` only when the request or repository policy supplies those values.

When an open pull request already exists, update it only when the request includes revision; otherwise return its URL and current metadata.

**Complete when:** `gh pr create` or the existing pull request yields one URL for the intended head.

## 3. Verify

```bash
gh pr view <url> \
  --json url,state,isDraft,baseRefName,headRefName,headRefOid,title,body
```

Compare every returned field with the request, final reviewer brief, and local HEAD. Correct editable metadata with `gh pr edit`; report an uneditable mismatch with the safest concrete resolution.

**Complete when:** GitHub reports one open pull request with the intended base, head SHA, title, body, and draft state.

## Failure branches

- **No commits between base and head:** resolve the comparison; there is no review unit to create.
- **Missing upstream or SHA mismatch:** hand off commit/push work to `core:ship-pr`.
- **Authentication failure:** report the failing account and the exact `gh auth login` action required.
- **Multiple open pull requests:** stop with their URLs; selecting or closing one requires explicit direction.
