# Implement

Build a spec, a user story, a branch or the fixes from a review, and end with one PR.

1. **Read the inputs.** Read the spec, its user stories and any reference PR. Use a reference PR only for the purpose that the user names, for example icons or missing context.
2. **State the claims.** For each unit, write the claim and its done criterion (principle-state-the-claim-first, principle-define-done). For performance work, capture the baseline with the scenario that you will measure again.
3. **Plan the units.** Make one unit for each user story or independent action. Name the files that each unit owns and the units that it depends on. When there are more than two units, draw the dependency order.
4. **Branch.** Create the branch from a current base (principle-update-the-base-deliberately).
5. **Delegate.** Spawn one `adam-agent` for each unit with a cold brief. Run independent units in parallel. Start a dependent unit only after the unit that it needs is integrated. Each brief names the skills to load: `tdd`, `yagni`, `reducer` and the domain skills for the unit.
6. **Integrate.** Merge each result into the branch. Read every diff. Run the tests after each integration. After each unit's check passes on the branch, run `worktree.sh release` for that unit. Done when the check for each unit passes on the integrated branch and no worktree from an integrated unit remains.
7. **Check scope against the base revision.** Run `scripts/scope-diff.sh <base>` on the integrated branch, as Scope in the SKILL.md describes. Confirm that no existing test, behaviour or feature is removed without approval.
8. **Prove it on the real surface.** Run the app, the CLI or the script. For UI, capture screenshots. For performance, measure the baseline scenario again and compare.
9. **Get a second opinion.** Run `double-check` across the full implementation with a model from a different provider. Fix each problem that it proves.
10. **Ship.** Continue with Ship in the SKILL.md.
