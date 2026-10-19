# PR Evidence Gathering

Ground status updates in PR evidence from the GitHub CLI.

## Fetching Recent PRs

If `gh` cannot run, or the user supplies a PR list, use the supplied list and do not describe running `gh`.

Once you have the GitHub username and reporting window:

1. Set `SINCE` and `UNTIL` to the window's first and last day as `YYYY-MM-DD`.
2. Run one search by creation date and one by merge date; `--created` misses older PRs merged in the window.
3. Set `--limit` above the expected PR count; `gh search prs` returns 30 results by default.
4. Remove duplicates by URL; PR numbers repeat across repositories.
5. Fetch each PR's changed files with `gh pr view`; `gh search prs` does not return `files`, `additions`, `deletions`, or `mergedAt`.

```bash
SINCE=2026-09-01
UNTIL=2026-09-14
gh search prs --author <github-username> --created "$SINCE..$UNTIL" --limit 100 --json title,url,createdAt,state,number,repository
gh search prs --author <github-username> --merged-at "$SINCE..$UNTIL" --limit 100 --json title,url,createdAt,state,number,repository
gh pr view <number> --repo <owner/repo> --json files,additions,deletions,mergedAt
```

## Processing PR Data

Skim `files` to classify the change:

- **Component work:** New UI components, refactors, styling
- **API changes:** Endpoints, data models, integrations
- **Infrastructure:** CI/CD, tooling, configuration
- **Docs:** README updates, inline documentation, guides

## Weaving into Updates

State an impact only when evidence supports it. Report a reverted PR as reverted, with the reason. Write outcome-first bullets:

| PR Title | Update Bullet |
|----------|---------------|
| "Add FAQ component" (deployed, support tickets down) | "Shipped FAQ component → reduced support load on X page (link)" |
| "Fix auth redirect bug" (merged, linked to 3 user-reported issues, no deployment evidence) | "Merged auth redirect fix, linked to 3 user-reported issues; not yet deployed (link)" |
| "Refactor Button styles" (merged; files show 4 variant style files merged into `Button.styles.ts`) | "Merged 4 Button variant style files into one (link)" |

## Identifying Glue Work

PRs reveal invisible contributions:

- **Reviews given:** GitHub search has no review-date filter, and `--updated` filters the PR's last update, not the review. Run `gh search prs --reviewed-by <username> --updated ">=$SINCE" --limit 100 --json number,url,repository` with no upper bound, then keep only PRs whose `submittedAt` in `gh pr view <number> --repo <owner/repo> --json reviews` falls inside the window
- **Unblocking others:** PRs that enabled teammates' work
- **Incident response:** Hotfixes, rollbacks, monitoring additions
- **Enablement:** Tooling, docs, test infrastructure

## Tips

- Link directly to PRs
- Group related PRs into one outcome bullet
- Put in-progress PRs in the "Next 2 Weeks" section
- State reviews given for another team as review support for that team, with the team name and review count. Do not claim an effect, such as unblocking, without evidence
