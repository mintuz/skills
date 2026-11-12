# GitHub commands for babysit

| Operation | Command |
| --- | --- |
| Access | `gh auth status` |
| Find the open PR | `gh pr list --head <branch> --state open --json number,url,baseRefName,headRefOid` |
| Create the PR | `gh pr create --base <base> --head <branch> --title <title> --body-file <file>` |
| Merge methods | `gh repo view --json mergeCommitAllowed,squashMergeAllowed,rebaseMergeAllowed` |
| Labels | List: `gh label list`. Apply: `gh pr edit <n> --add-label <label>` |
| Arm the merge | `gh pr merge <n> --auto --<method>`. If the repository refuses auto-merge, merge from the loop at green: `gh pr merge <n> --<method> --match-head-commit <sha>` |
| Check status | `gh pr checks <n> --json name,state,bucket`. First confirm that `headRefOid` equals the head SHA. |
| PR state | `gh pr view <n> --json state,headRefOid,mergeable,mergeStateStatus,mergeCommit`. Conflict: `mergeable` is `CONFLICTING`. Behind: `mergeStateStatus` is `BEHIND`. |
| Failing log | `gh run list --branch <branch> --commit <sha>` gives the run ID. Then `gh run view <run-id> --log-failed`. |
| Re-run | `gh run rerun <run-id> --failed` |
| Stacked PRs | `gh pr list --base <branch>` |
