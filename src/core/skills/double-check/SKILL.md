---
name: double-check
description: "WHEN finished work, review findings or a done claim needs a second opinion from another model; NOT for routine checks while building or a spec acceptance verdict; briefs a fresh reviewer cold, labels its provider and closes each finding only on evidence."
---

# Double-check

Get a second opinion from a reviewer that did not build the work (`principle-judge-with-fresh-eyes`). The calling workflow sets the target, the reviewer's provider and the authority to edit. When a spec exists, run `acceptance-review` for the criterion-by-criterion verdict, and report it separately.

## 1. Choose the reviewer

- **Cross-provider review:** a model from a different provider from the model that built the work. Use this mode when it is available.
- **Same-provider review:** a fresh agent from the same provider. Use it only when no other provider is available and neither the user nor the calling workflow requires one. Label the verdict "same-provider review".

When the user or the calling workflow requires a different provider and none is available, do not substitute a same-provider review. Report the missing second opinion as a gap (`principle-gaps-are-not-passes`).

## 2. Brief the reviewer cold

Give the reviewer the artifact and its state (commit range, diff or file), the requirement that it must meet, and the claims to test, riskiest first. Write each claim as a question. Leave out your rationale and the answer that you expect.

Ask for each finding in this form, with evidence labelled as `principle-label-the-evidence` describes:

| Location | Claim | Evidence | Status |
|---|---|---|---|
| file and line, or other locator | what is wrong | what shows it | confirmed, refuted or unverifiable |

Tell the reviewer to report unverifiable findings, not to drop them.

## 3. Resolve each finding

- Close a finding only on evidence that defeats it, for example a file and line, a test run or a document. The author's confidence, the reviewer's silence and a withdrawal without evidence leave it open.
- When the user defers a finding, keep it open and report it as disclosed residual risk.
- Follow the calling workflow's authority to edit. In a read-only review, report each confirmed finding with its fix and ask the user to approve the change; do not make it.

## 4. Repeat on the fixes

After fixes, run another round on the new state. Stop when the reviewer reports no confirmed issues other than nits. After about four rounds, or sooner when a round repeats the last disagreement, take the disagreement to the user with the evidence on each side.

## 5. Give the verdict

- Name the reviewer mode.
- Give no clean verdict while the highest-risk claim is only inferred. Name the check that would establish it.
- List minor points (nits) separately. They do not block an approval.
- List each unverifiable or deferred finding as open.
