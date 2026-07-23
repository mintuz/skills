# PR Sizing and Splitting

Use **review-unit coherence** as the decision: one pull request should have one reason to exist and one reviewable verification story.

## Size signals

Use counts as attention signals; coherence decides the review unit:

| Signal | Small | Medium | Large |
| --- | ---: | ---: | ---: |
| Authored files | 1–3 | 4–15 | 16+ |
| Changed lines | Under 100 | 100–500 | Over 500 |
| Description | Summary, changes, validation | Add context and focused review guidance | Add risk, rollout, and rollback detail |

Count generated output separately from authored changes; review its generator and reproducibility.

## Coherence gate

Keep one pull request when the changed areas:

- deliver one observable outcome;
- share one motivation and acceptance boundary;
- must land together to keep the repository valid; and
- can be verified and rolled back as one unit.

Recommend a split when the comparison contains independent features, tickets, refactors, release risks, reviewer groups, or rollback boundaries. Prefer these cuts:

1. **Prerequisite then behavior:** preparatory refactor or schema work before the feature that consumes it.
2. **Independent concern:** one feature, fix, or infrastructure change per unit.
3. **Dependency layer:** a minimal ordered stack when later units depend on earlier ones.

Each unit must build on its stated base and include the tests and documentation needed to review that unit.

## Coupled exceptions

Keep a large unit intact when repository validity requires the areas to land together, such as an atomic migration, inseparable generated artifacts, tightly coupled API and consumer changes, or initial project bootstrap. Name the coupling and compensate with focused review order, risk, deployment, and rollback guidance.

## Return the decision

For one pull request, report:

```markdown
**Decision:** Keep as one PR — [single reason to exist]
**Size:** [small | medium | large] — [authored files and changed lines]
**Coupling:** [why the areas belong together]
**Review order:** [area → area]
```

For a split, report:

```markdown
**Decision:** Split into [N] PRs — [independent reasons]

1. **[Title]**
   - Base: [branch or preceding PR]
   - Scope: [changed areas]
   - Outcome: [independently reviewable result]
   - Verification: [checks]
```

Account for every changed area exactly once and state every stack dependency.
