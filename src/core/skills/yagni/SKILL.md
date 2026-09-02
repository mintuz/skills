---
name: yagni
description: WHEN changing production code under this codebase's working agreements, or when a task risks overengineering—extra abstractions, speculative design, or test sprawl; NOT for removing complexity from existing code; enforces TDD, minimum sufficient execution, hard scope boundaries, and documentation practices.
---

# YAGNI

Finish the current task or spec with the minimum sufficient approach. Do not over-engineer or increase scope of the task..

If you cannot prove a design is necessary, do not ship it. TDD is the one exception to "prove it first": write the failing test before the production code, because the test is what defines the behaviour the code owes. Restraint applies to the size of a test, never to its existence.

## Workflow

1. Understand the requirement and read the relevant code before you change anything. Do not change code and then guess the intent. For a bug, find every caller of the code you plan to change. Put the fix where the accepted contract lives. When every caller shares that contract, fix the shared function once instead of guarding each caller.
2. Ask clarifying questions when the requirement is ambiguous or incomplete. Name the facts you need and wait for them. Do not fill a missing requirement with your own assumption. You may name the options you can see, but ask the user to choose, and plan no work that depends on an unconfirmed answer. A wrong premise cannot be fixed by correct reasoning later.
3. Produce a minimal plan before you execute. The plan states:
   - the goal;
   - the non-goals, including what is explicitly out of scope;
   - the acceptance criteria, which are the definition of done;
   - what stays untouched.
4. Default to one agent. Split only the remaining independent subtasks, and only when splitting materially helps. Parallel work multiplies the scope you have to hold in your head.

## Failure Modes

Each of these ends the same way: work that is larger than the requirement.

1. You did not understand the intent. You only fixed the surface.
2. You could have made one clean root-cause fix, but you piled on patches, compatibility layers, dual implementations, and copies.
3. You over-designed for rare cases, which makes everyday maintenance expensive.
4. You started from a wrong premise. No amount of correct reasoning fixes a wrong starting point.
5. You should have read the code directly, but you used search or guesswork instead.
6. You used "add tests" as cover to expand scope, add abstractions, or look thorough.

## Action Boundaries

1. State the plan from Workflow step 3 before you execute it. Everything below depends on that boundary being explicit. Wait for the user's agreement only where the requirement is ambiguous or a material choice is open.
2. Get user confirmation before any irreversible operation. Losing uncommitted work counts as irreversible.
3. These are reversible. Execute them without asking:
   - `git revert`, and branch switches that carry your changes across;
   - `git restore` **only** when the target has no uncommitted changes you would lose;
   - moves of files into a backup directory inside the repository, once you have confirmed the destination path does not already exist;
   - test runs, diffs, plan generation, and read-only analysis.
4. Stop and rewrite a smaller plan when you catch yourself:
   - adding abstractions, frameworks, or configuration layers the task does not need;
   - designing ahead for possible future use;
   - stacking more constraints to satisfy existing constraints;
   - touching many unrelated files;
   - creating a second implementation to keep old logic alive.
5. A request to build extra mechanism is not by itself an accepted requirement. When the user asks for work that no accepted behaviour needs, leave it out of the plan, name it as a non-goal, and say why. Ask the user to raise it as a separate requirement if they still want it.

## Testing

Tests serve the acceptance of the current change. Nothing else.

1. Write one failing test for the next behaviour change, then write the minimum code that makes it pass. This covers behaviour you add, alter, or remove. **If you find yourself changing behaviour without a failing test, stop and write the test first.**
2. Refactoring is the exception: while the tests are green, you may change production code that adds no behaviour, then re-run the tests as the regression check that none changed.
3. Run the related existing tests before you add anything. If one of them already fails for the behaviour you are about to build, that is your red — do not write a second test for it.
4. When no existing test is your red, extend a related test that does not yet express the required behaviour, provided it can carry that behaviour without taking on a second responsibility. If none can, add one focused test.
5. Cover one main path and, where the behaviour can fail meaningfully, one critical failure path. That is per behaviour, not per file or per module.
6. Do not expand test scope for completeness, backfill unrelated modules, or test boundaries the requirement did not ask for.
7. Do not introduce new test frameworks or infrastructure.
8. Do not write snapshot matrices, parametrised grids, or end-to-end suites.
9. Do not let green tests justify more abstraction.

Ask two questions of each test you write:

- Which accepted requirement does this test verify?
- Is it simpler than the implementation?

Test code that is longer or more complex than the implementation is a signal of overengineering. Look for a smaller test that still fails first.

## Code Change Principles

- Every code change must leave the tests, the type checks, and the static analysis passing, including any applicable language strict mode such as TypeScript strict mode. Report any failure you cannot fix rather than working around it.
- Assess refactoring after every green, and refactor only when it adds value now.
- Respect the existing patterns and conventions of the codebase.
- Keep changes small and incremental.
- Commit when the work is complete and the plan allows it. If the plan puts git history out of scope, leave the changes uncommitted and say so.

## Documentation

At the end of every significant change, ask: **"What do I wish I'd known at the start?"**

Record the answer when it would save a future developer more than 30 minutes, prevent a class of bugs, or reveal something the code does not show on its face — a non-obvious constraint, an architectural trade-off, a domain rule, an edge case, or a tool setup gotcha. Record nothing when an existing rule already covers it. Keep project docs current: correct CLAUDE.md and AGENTS.md when your change makes them wrong.

Write the reusable rule, not the incident that revealed it. Give the action and the condition that makes it necessary. When the change fixed a fault, write the rule so that a reader can detect the fault and then follow the approved repair. In a repository instruction file such as CLAUDE.md or AGENTS.md, amend the rule that already owns the subject when one exists. Otherwise add one imperative sentence or bullet in the section that owns the subject, in that file's voice. Add a heading or a code example only when a reader cannot apply the rule without it; for an architectural trade-off, name the alternative you rejected instead.

Decline a template, a Context/Issue/Solution breakdown, a retrospective, or a verification checklist in that file, however the user asks for it, and give this reason: the instruction file carries the rule alone. Put your reasoning in your reply to the user, not in the file. When you propose the text rather than apply it, say that the files stay unchanged. `core:learn` sets out this procedure in full.

## Communication

- State the trade-offs and the reasoning behind significant design decisions.
- Flag any deviation from these guidelines, with the justification.

## Pre-Completion Checklist

Confirm every item before you report the task as done:

- The work matches the stated plan: the goal is met, the non-goals are still out, and what was to stay untouched is untouched.
- Every behaviour change started from a failing test.
- The solution is the minimum approach, not the maximum.
- You read the relevant code directly instead of guessing.
- You changed only the minimum set of files needed.
- The related existing tests, type checks, and static analysis all pass.
- New tests only lock the behaviour this change altered, or existing behaviour the user explicitly asked to cover, and their count is low.
- The tests introduced no new dependencies or directory structures.
- The diff is small, with no extra files and no leftover debug code.
- You did no extra work purely to look complete.

## Relationship to Other Skills

- `core:reducer` removes mechanism from an existing system. This skill keeps mechanism out of new work. When a task only removes mechanism from code that already works, and adds no behaviour, say that `core:reducer` owns it. Write no removal plan of your own. State only the limits that still hold: name the module or modules the change stays inside and say the rest stay untouched, and keep the behaviour identical. Re-run the existing tests afterwards as the regression check, not as proof of equivalence. Add no test for the removal itself. Name any affected behaviour the existing tests do not cover, because that gap must be closed before the removal is safe.
- `web:tdd` drives the Red-Green-Refactor cycle in detail. This skill sets the scope limits that apply inside that cycle.
