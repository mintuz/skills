# Forgejo and Gitea commands for babysit

`tea api <endpoint>` authenticates and fills `{owner}` and `{repo}`. If it returns 404, add `-r <owner>/<repo>`. Never search the filesystem for a token.

| Operation | Command |
| --- | --- |
| Access | `tea logins list` |
| Find the open PR | `tea api '/repos/{owner}/{repo}/pulls/<base>/<branch>'`. Use the result only if `state` is `open`. |
| Create the PR | `tea pr create --base <base> --head <branch> --title <title> --description-file <file>` |
| Merge methods | `tea api '/repos/{owner}/{repo}'`: `allow_merge_commits`, `allow_squash_merge`, `allow_rebase`. `default_merge_style` is the default. |
| Labels | List: `tea labels ls`. Apply: `tea pr edit <n> --add-labels <label>` |
| Arm the merge | `tea` has no auto-merge. Merge from the loop at green: confirm that the PR's `head.sha` equals the head SHA, then run `tea pr merge <n> --style <method>`. |
| Check status | `tea api '/repos/{owner}/{repo}/commits/<sha>/status?page=<page>&limit=50'`. Read `state` and each `statuses[].context` with its `status`. Page until you have read `total_count` contexts. |
| PR state | `tea api '/repos/{owner}/{repo}/pulls/<n>'`: `state`, `merged`, `merge_commit_sha`, `head.sha`. Conflict: `mergeable` is `false`. |
| Failing log | `tea actions runs list --branch <branch> -o json`: keep the run whose commit is the head SHA. `tea actions runs view <run-id> --jobs -o json`: pick the job that matches the failing check. Then `tea actions runs logs <run-id> --job <job-id>`. |
| Re-run | No `tea` command. Use the forge's web UI if you have browser access. |
| Stacked PRs | `tea pr ls --limit 50 -o json -f index,base`. Step `--page` until a page is empty. |
