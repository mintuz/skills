---
name: pr
description: WHEN producing a reviewer-first pull request title/body, sizing or splitting changes, or creating a pull request with gh; NOT for commit messages, pushing branches, CI repair, conflict resolution, or merge monitoring; returns an evidence-backed review unit, finished description, or verified pull request.
---

# Pull Request

Turn the complete base-to-head change into a **reviewer brief**: one coherent reason to change, the evidence needed to assess it, and a proportionate verification story.

Load only the references whose conditions fire:

| Condition | Context pointer |
| --- | --- |
| Sizing was requested or the comparison may contain multiple review units | Read [pr-sizing.md](pr-sizing.md) before deciding the review units. |
| Drafting or revision was requested | Read [pr-description.md](pr-description.md) before writing. |
| Creation was requested | Read both [pr-description.md](pr-description.md) and [pr-creation.md](pr-creation.md); creation includes a finished title/body. |

The creation branch starts with committed, pushed work. Use `core:ship-pr` when the request also includes committing, pushing, repairing checks, handling conflicts, or waiting through merge.

## 1. Establish the comparison

Read repository instructions and pull request templates. Resolve the repository, head branch, exact base branch, requested branch above, linked issue or specification and its current state, and any stack relationship.

Inspect the complete comparison, adapting commands to the resolved base:

```bash
git status --short --branch
git diff <base>...HEAD --stat
git diff <base>...HEAD --name-status
git diff <base>...HEAD
git log <base>..HEAD --format='%h %s%n%b'
```

Treat the diff and executed checks as evidence. Use commits and linked work as intent context, and reconcile any claim that the diff does not support.

**Complete when:** the base, head, requested output, repository rules, linked authority, and every changed area are known.

## 2. Build the reviewer brief

Map each changed area to:

- its observable outcome and motivation;
- the implementation boundary a reviewer should inspect;
- dependencies on other areas or pull requests;
- validation already executed, including exact results;
- user, data, deployment, compatibility, and rollback risk where applicable.

Give every changed area one role in the brief. Separate generated files from authored behavior and distinguish verified results from proposed checks.

**Complete when:** every changed area is accounted for, every material claim has diff or verification evidence, and every relevant risk has a mitigation or explicit gap.

## 3. Choose the review unit

Assess whether the comparison tells one coherent review story. When sizing or splitting was requested, or the comparison contains independently mergeable reasons to change, apply the sizing reference selected above.

For a stack, derive each unit and its dependency order from the actual diff. For one pull request, state why its coupled areas belong together.

**Complete when:** every changed area belongs to exactly one proposed review unit, each unit has one reason to exist, and every dependency edge has an explicit order.

## 4. Produce the requested artifact

For a title/body, apply the description reference selected above to the review unit. Return finished Markdown with facts, commands, and results filled in; omit sections that carry no reviewer information.

For creation, apply the creation reference selected above only after the title/body is final. Keep publication mechanics within that branch.

**Complete when:** the requested plan or description has no placeholders and covers its entire review unit; if creation was requested, `gh pr view` confirms one open pull request with the intended base, head, title, body, and draft state.
