# Review

A deep review of a PR, branch or diff. This playbook is read-only. Change code only after the user approves the findings, then continue with Implement.

1. **Fix the evidence set.** Fetch the PR, check out its branch and read its spec or issue. Done when the diff, the spec and the base revision are named.
2. **Load the skills.** Load `yagni`, `reducer`, `blast-radius` and the domain skills for the changed files. When a spec exists, also load `acceptance-review`.
3. **Load the review principles.** Load principle-attack-the-premise, principle-derive-from-one-owner, principle-earn-every-element, principle-foundational-thinking, principle-gaps-are-not-passes, principle-keep-the-core-pure and principle-never-weaken-a-check. Write each name in the plan; a count such as "the seven principles" does not name them. Add other principles when the diff needs them.
4. **Split by lens.** When the diff is large, spawn one `adam-agent` for each lens: simplicity, scope, blast radius, and bugs and security. Done when every changed file has a reviewer.
5. **Check scope against the base revision.** List each feature that the spec does not ask for. Run `scripts/scope-diff.sh <base>`, as Scope in the SKILL.md describes, and read the diff for each other behaviour that it removes or weakens. Report each removal as a removal without approval, unless the spec or the user approves it.
6. **Map the blast radius.** Name the callers, state and user journeys that the change can break, and the check that proves each one safe.
7. **Get a second opinion.** Run `double-check` on the findings with a model from a different provider. Remove each finding that it disproves. Mark each disagreement.
8. **Report.** Give the verdict first. Group the findings in this order: bugs, scope, complexity, then minor points. For each finding, give the file and line, the evidence, the principle and the simplest fix. Add a diagram of the blast radius.
