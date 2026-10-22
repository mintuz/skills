# Prototype

A prototype, also called a spike, is throwaway code that finds the best version of something before the real build: a library, a layout, an algorithm, a feature, a complete product or a bug fix. Use it when the user asks to spike, prototype or compare approaches, or when a "which approach" fork needs an experiment before the build. The output is a decision and its evidence, not shippable code. In each variant, speed beats polish; the rigour goes into the comparison.

Before step 1, check the route:

- The spec or the request already fixes the approach, so no question is open: do not prototype. Tell the user why, and run Implement, or Bug fix for a defect.
- Every open question is visual, and the design must reach a bar in the product: run Design loop.
- The code must match an agreed mock-up or design export: run Match design.
- The root cause of a bug is not confirmed: run Bug fix steps 1 to 3 first. A prototype compares fixes, not causes.

## Start

1. **Name the outcome, the open questions and the mode.** Write the entry point (product, feature, change or bug fix), the outcome as something that a user or a check can observe, and each open question. Then choose the mode:
   - **One decision:** exactly one question is open, the variants differ only in its answer, and the result picks one variant. Example: "react-markdown, or marked with DOMPurify?". Do steps 5 to 7, then step 14.
   - **Whole versions:** several questions are open, or the best result can combine parts of several variants. Example: the start flow, the results view and the late-join rule of a new feature. Do steps 8 to 14.
2. **Start from the existing evidence.** When the user names a spike or prototype branch, a findings branch or a report, read it first and continue on that branch.
3. **Find the integration point.** When the result must fit existing behaviour, for example an existing layout algorithm or a virtualised list, name that behaviour. For a feature or a change in an existing app, the running app is the integration point. Run each variant inside it, not beside it in a separate project, so that the evidence proves the fit. A new product has no integration point.
4. **Keep the code throwaway.** Build separately from production code. Use the lightest stack that shows the idea, for example plain HTML, CSS and JavaScript with CDN dependencies for a new product. Use fake data and stubbed services. Write no tests, no abstractions and no polish. Add a simpler variant that the user did not ask for when one exists, for example pure CSS before JavaScript, a platform feature, or a deletion (principle-exhaust-the-design-space).

## One decision

5. **Build labelled variants behind one switcher.** Build on one prototype branch or in one scratch folder. Put each variant behind one switcher, for example buttons or a query parameter, and label each variant on screen.
6. **Observe each variant on the real surface.** For a visual decision, capture a screenshot of each variant. For a behavioural or timing decision, log the timing or the output of each variant on the same input. The observation is the test (principle-observe-dont-infer).
7. **Recommend one direction.** Report the variants, the evidence, the trade-offs, short code examples of each variant at the integration point, and one recommendation with what the user gains and loses. When the evidence settles the decision, decide and report it (Autonomy in the SKILL.md). Then go to step 14.

## Whole versions

Several throwaway variants run through `arena`, which picks one base and grafts the best parts of the others into it. Short `gauntlet-loop` rounds then improve only that base. Read `gauntlet-loop` before step 10 and `arena` before step 11.

8. **Fix the budget.** Write as specific values: the number of variants (two to four), the limit for each variant (time, turns or tokens), and the round limit (the arena round plus at most two gauntlet rounds, unless the user sets another limit). Reaching the budget is a reason to stop, not evidence that the bar is met.
9. **Name the directions.** Write one line for each variant that names its direction, so that each variant commits to its own shape.
   - **Product:** the variants differ in concept or core flow. Each one is a thin end-to-end slice of the core journey.
   - **Feature or change:** the variants differ in flow, interaction or data shape. Each one runs at the integration point from step 3.
   - **Bug fix:** the variants differ in where and how the fix lands, for example at the source, at the boundary, or by removing the state that allows the defect. Each one runs against the same reproduction.

   When the look of a product or feature variant is open, also give it a `creative-seed` label, `<run-id>/<variant>`. Put this line in its builder brief: "Load `creative-seed`, run its script with the label `<label>`, and derive the look from the printed string."
10. **Set the bar and get it confirmed.** Follow step 1 of `gauntlet-loop` (principle-fix-the-bar-first). The bar says what makes a version good enough to decide on, not good enough to ship:
    - **Product, feature or change:** the core journey works end to end on the real surface, with named criteria that a critic can check, a fixed capture protocol (viewport or device, theme, seed data), and a materiality threshold.
    - **Bug fix:** one reproduction that fails on the base, the existing tests, and criteria such as the smallest change at the root cause.

    For a product, a feature or a change, ask the user to confirm or amend the bar, the budget and the directions in one message before round 1. For a bug fix, the reproduction and the tests are the bar: state the bar, the budget and the directions, and continue without asking.
11. **Build each variant through `arena`, in its own worktree.** Use the confirmed bar as arena's rubric and the directions as its candidates.
    - Give each variant its own worktree from `scripts/worktree.sh` on a prototype branch. For a product with no repository, give each variant its own scratch folder.
    - Give builders a faster, cheaper model when the host offers one, and mix providers. Keep the strongest model for the judge and the critics.
    - Each builder captures its variant on the capture protocol, drives the core journey or runs the reproduction and the tests, and reports the artifact and the evidence, not a verdict (principle-observe-dont-infer).
12. **Pick a base and write the keep list.** Arena's judge, which built no variant, scores each variant against the bar. Arena picks one base and grafts the best parts of the others into it. Pick the base yourself; the user does not choose between variants. Write the keep list beside the base, with one row for each part of each variant:

    | Part | Source variant | Evidence | Decision | Why | Destination |
    | --- | --- | --- | --- | --- | --- |
    | Empty state with a sample item | C | capture `C/02-empty.png` | keep | new users reached the first task without help | first-run screen |
    | Drag to reorder | A | the journey capture needs a hidden gesture | reject | B's move buttons do the same job in plain sight | none |

    When the variants converge, record the consensus. Done when every variant has a score for each criterion, and every row, kept or rejected, has its source variant, its evidence and its reason.
13. **Converge through `gauntlet-loop` rounds.** From round 2, improve only the base. A fresh critic gives each round's verdict (WIN, LOSE or UNJUDGEABLE) against the bar (principle-judge-with-fresh-eyes), and the builder repairs only the single largest gap. Skip this step when the base already wins. When the user rejects something, record it as a constraint in the bar before the next round. Stop on a WIN, on gaps below the threshold, or at the round limit. Report the rounds used against the budget.

## Hand over

14. **Hand over the decision, not the code.** State plainly that the prototype is throwaway: its branches are never merged or shipped. Give the prototype branch, worktree or scratch path.
    - **One decision:** after the decision, update the prototype branch to show the chosen variant.
    - **Whole versions:** report the outcome, the bar, each variant with its direction and evidence, the judge's scores, the base and why, the keep list, the ledger of rounds and the budget used. After the evidence of each losing variant is in the report, abandon the variant with `worktree.sh abandon`, and put the recovery commit in the keep list. Keep the base until the real build has ported the keep list.

    Then run the next playbook. The real build rebuilds the chosen direction and each kept part in production code, with tests.
    - **Product, or a feature without a spec:** run Spec with the decision or the keep list and the captures as its input, then Implement on that spec.
    - **Feature or change with a spec:** run Implement. Put the decision or the keep list in each brief, and run `architect` first when the shape of the code is open.
    - **Bug fix:** run Bug fix from step 4. Commit a test that fails for the reported reason, then rebuild the chosen fix and the kept parts in production code, and continue to Ship.
