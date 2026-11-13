---
name: lens-review
description: "USE WHEN reviewing uncommitted work, a branch diff or a pull request through several installed skills, each run as its own review lens; NOT WHEN you need one cold second opinion (double-check), a verdict against a specification (acceptance-review) or the built-in fixed-lens /code-review. Runs each lens in an isolated read-only agent, has a separate agent try to refute every finding, and returns one severity-ranked report."
---

# Lens review

Review one diff through several lenses. A lens is one installed skill, loaded by one read-only sub-agent that judges only that skill's concern. You are the orchestrator: resolve the diff, compose the roster, run the lenses, have each finding verified, and write one report.

Read these before the step that needs them:

| Reference | Read before |
| --- | --- |
| [`references/lenses.md`](references/lenses.md) | Step 3: the built-in lens, the default and detected lenses, and the lens brief |
| [`references/workflow.md`](references/workflow.md) | Step 4: how to run the lenses and verifiers on each host |
| `babysit` forge reference: [GitHub](../babysit/references/github.md) or [Forgejo and Gitea](../babysit/references/forgejo.md) | Step 1 for a PR target, and step 7 |

## Invocation

`/lens-review [target] [modifiers] [lens...]`. In Codex, use `$lens-review` with the same tokens.

| Token | Meaning |
| --- | --- |
| *(no target)* | Review the current branch: the diff from the merge base with the default branch, plus uncommitted changes |
| `wip` | Review only the uncommitted changes, staged and unstaged, against `HEAD` |
| `#123`, `123` or a PR URL | Review that pull request (PR) |
| `<skill-name>` | Add that installed skill as a lens |
| `only <names...>` | Use exactly the named lenses: no built-in, default or detected lens |
| `-<name>` | Remove that lens from the roster |
| `thorough` | Run every detected lens, and use three verifiers for each finding |
| `post` | Post the report to the PR as a comment. Needs a PR target |

Examples: `/lens-review`, `/lens-review #482 thorough`, `/lens-review wip only react-testing xstate`, `/lens-review 57 post`.

If a token is not a token in this table and does not name an installed skill, stop before any lens runs. Report the token, list near matches from the installed skills, and ask the user. Do not substitute a near match by yourself. In the same message, show the diff command from step 1 and the roster from step 3, including the lenses it leaves not covered, so the user answers with the full plan.

## 1. Resolve the diff

- **Branch** (no target): run `git diff $(git merge-base <default-branch> HEAD)`. This includes committed and uncommitted changes to tracked files. Run `git status --porcelain` and include untracked files. Say that uncommitted changes are included.
- **`wip`**: run `git diff HEAD`, and include untracked files from `git status --porcelain`.
- **PR**: use the forge's *PR details* and *PR diff* rows. Record the PR title, body, base branch and head SHA.
- **Stacked branch**: if stack metadata names an immediate parent branch, diff against that parent, not against the default branch.

If the diff is empty or the target does not resolve, stop and report that. Do not review.

## 2. Scout inline

Do not use sub-agents for this step.

1. Sort the changed files into production, test, configuration and documentation.
2. Read the project's `CLAUDE.md` or `AGENTS.md`, its package or build manifests, and any glossary or decision records. Record the stack and the local conventions.
3. Record the change's claim: the PR title and body, the commit messages, or the intent that the user stated. The lenses judge the diff against this claim.

## 3. Compose the roster

1. Apply [`references/lenses.md`](references/lenses.md): the built-in `quality` lens, the stack defaults, and the detected lenses.
2. Apply the user's tokens: `only`, added names and `-<name>` removals. With `only`, record each omitted lens as not covered.
3. Keep 3–6 skill lenses. If detection finds more, keep the lenses most relevant to the diff and record the others as not covered. With `thorough`, run them all.
4. Tell the user, in one line, the roster and the scale: the number of lens nodes, plus one verifier for each unique finding (three with `thorough`).
5. If the roster has more than 8 lens nodes, ask the user before you launch, unless they gave `thorough`. Otherwise, launch without asking.

## 4. Run the lenses

Run every lens node in parallel, in its own context. Brief each one with the lens brief in `references/lenses.md`. Lens nodes do not modify files. Follow the section of [`references/workflow.md`](references/workflow.md) for the host:

- **Claude Code**: the `Workflow` script. A user who invokes this skill has opted in to the workflow.
- **No workflow tool** (for example OMP): sub-agents launched in one message.
- **Codex**: fresh threads or sub-agents.
- **No sub-agents**: each lens in sequence, labelled `sequential (degraded): not independent`.

## 5. Verify and merge

1. Retry a lens that returns nothing or malformed output once. Then record it as lost and list it under Not covered. A lost lens is not a clean result.
2. Merge findings that share a file, line and claim. Record which lenses agree. Agreement is a signal, not proof.
3. Give each unique finding to a fresh verifier. Send the claim, its evidence and the base and head refs. Never send the lens's brief or reasoning.
4. Tell the verifier to try to refute the finding against the code. It returns `confirmed`, `refuted`, or `unverifiable` when it cannot decide either way. With `thorough`, use three verifiers and take the majority. A tie is `unverifiable`.

Give each verifier these review checks:

- Does the problem exist at that `file:line` at the head ref?
- Is it a rule of that lens's skill, not a matter of taste?
- Did this diff introduce it? If the problem is only in unchanged code, it is pre-existing and out of scope, unless the diff makes it worse.

After verification:

- If two confirmed findings make incompatible suggestions for the same code, report a conflict with both arguments. Do not choose a winner.
- If a finding contradicts an explicit local convention from step 2, report it as a conflict. Do not enforce the lens over the convention.

## 6. Report

```markdown
## Lens review: <target> — <the change's claim in one line>

**Roster:** <lenses run> · **Scale:** <n lens nodes; m findings verified: c confirmed, r refuted, u unverifiable> · **Runtime:** <workflow | sub-agents | Codex threads | sequential (degraded)>

| Lens | Verdict | Confirmed findings |
| --- | --- | --- |
| <lens> | ✅ / ⚠️ / ❌ | <n> |

**Recommendation:** APPROVE | REQUEST CHANGES | NEEDS DISCUSSION

### Confirmed findings
<severity> **[<lens or lenses>] <title>** — `<file>:<line>`
Problem. Why it matters. Suggested fix.

### Conflicts            (only when present; both arguments)
### Unverifiable claims  (each one, with what blocked the check)
### Clean                (what the lenses inspected and found sound)
### Not covered          (omitted lenses, lost nodes, scope that no lens could judge)
```

- Rank confirmed findings by severity, then by the number of lenses that agree, then by confidence.
- When several lenses report the same claim, show it once and name each lens.
- Count refuted findings in the scale line. Do not list them.
- Recommendation: any confirmed `critical` finding gives REQUEST CHANGES. Otherwise, an unresolved conflict gives NEEDS DISCUSSION. Otherwise, give APPROVE and list the minor findings.

## 7. Post the report

Do this step only when the user gave `post`.

1. If the target is not a PR, do not post and do not create a PR. Tell the user that the report stays local.
2. Pick the forge from the remote, then confirm access before you post: `gh auth status` for GitHub, `tea logins list` for Forgejo or Gitea. If access fails, stop and report it.
3. Write the report to a file outside the worktree. Start it with `## lens-review` and name the roster.
4. Post the file with the *Comment on the PR* row. Never put the report text in a shell argument.
5. Post a comment only. Never approve the PR or submit a review state, even if the user asks or the recommendation is APPROVE. Tell the user that the approval is theirs to give.

## Boundaries

- `double-check` gives independence: one cold reviewer, preferably from another provider. This skill gives breadth through your own skills, but every lens shares the host model's blind spots. Run `lens-review` first and `double-check` last on high-stakes work.
- `acceptance-review` decides whether a change meets a specification. This skill does not give an acceptance verdict.
- The built-in `/code-review` uses fixed issue classes. This skill uses the installed skills that you choose.
- `babysit` takes the reviewed branch to green CI and merge.

## Done

- You showed the roster and scale before launch.
- Each lens node loaded one skill and judged only its concern.
- Each reported finding survived a verifier, with `file:line` evidence.
- The report shows conflicts, unverifiable claims, clean areas and gaps in coverage.
- You posted only with the `post` token, and only as a comment.
