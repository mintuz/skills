# PR Evidence Gathering

Use GitHub CLI to ground status updates with concrete evidence of work shipped.

## Fetching Recent PRs

If `gh` cannot run, or the user supplies a PR list, use the supplied list and do not describe running `gh`.

After getting the GitHub username and the reporting window, set `SINCE` and `UNTIL` to the first and last day of the window as `YYYY-MM-DD`. Run one search by creation date and one search by merge date, because `--created` misses older PRs merged in the window. Remove duplicates by URL, because PR numbers repeat across repositories. `gh search prs` returns 30 results by default, so set `--limit` above the expected PR count. Then fetch the changed files for each PR:

```bash
SINCE=2026-09-01
UNTIL=2026-09-14
gh search prs --author <github-username> --created "$SINCE..$UNTIL" --limit 100 --json title,url,createdAt,state,number,repository
gh search prs --author <github-username> --merged-at "$SINCE..$UNTIL" --limit 100 --json title,url,createdAt,state,number,repository
gh pr view <number> --repo <owner/repo> --json files,additions,deletions,mergedAt
```

`gh search prs` does not return `files`, `additions`, `deletions`, or `mergedAt`. Use `gh pr view` for those fields.

## Processing PR Data

Skim the `files` field to understand what changed:

- **Component work:** New UI components, refactors, styling
- **API changes:** Endpoints, data models, integrations
- **Infrastructure:** CI/CD, tooling, configuration
- **Docs:** README updates, inline documentation, guides

## Weaving into Updates

A merged PR is merged work. Call it shipped only when deployment evidence is supplied. State an impact only when evidence supports it. Report a reverted PR as reverted, with the reason.

Transform PR data into outcome-first bullets:

| PR Title | Update Bullet |
|----------|---------------|
| "Add FAQ component" (deployed, support tickets down) | "Shipped FAQ component → reduced support load on X page (link)" |
| "Fix auth redirect bug" (merged, linked to 3 user-reported issues, no deployment evidence) | "Merged auth redirect fix, linked to 3 user-reported issues; not yet deployed (link)" |
| "Refactor Button styles" (merged; files show 4 variant style files merged into `Button.styles.ts`) | "Merged 4 Button variant style files into one (link)" |

## Identifying Glue Work

PRs often reveal invisible contributions:

- **Reviews given:** GitHub search has no review-date filter, and `--updated` filters the PR's last update, not the review. Run `gh search prs --reviewed-by <username> --updated ">=$SINCE" --limit 100 --json number,url,repository` with no upper bound, then keep only PRs whose `submittedAt` in `gh pr view <number> --repo <owner/repo> --json reviews` falls inside the window
- **Unblocking others:** PRs that enabled teammates' work
- **Incident response:** Hotfixes, rollbacks, monitoring additions
- **Enablement:** Tooling, docs, test infrastructure

## Tips

- Link directly to PRs in the update for evidence
- Group related PRs into a single outcome bullet
- Note PRs that are in-progress for "Next 2 Weeks" section
- State reviews given for another team as review support for that team, with the team name and the number of reviews. Do not claim an effect, such as unblocking, without evidence
