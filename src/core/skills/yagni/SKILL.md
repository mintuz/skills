---
name: yagni
description: WHEN changing production code under this codebase's working agreements, or when a task risks overengineering—extra abstractions, speculative design, or test sprawl; NOT for removing complexity from existing code; enforces TDD, minimum sufficient execution, hard scope boundaries, and documentation practices.
---

# YAGNI

Finish the current task or spec with the minimum sufficient approach. Do not over-engineer or widen scope. If you cannot prove a design is necessary, do not ship it (`principle-subtract-before-you-add`, `principle-foundational-thinking`).

TDD is the one exception to "prove it first": write the failing test before the production code, because the test defines the behaviour the code owes. Restraint limits a test's size, never its existence.

## Workflow

1. Read the requirement and the relevant code before changing anything; never change code and then guess the intent. For a bug, find every caller of the code you plan to change; when every caller shares the accepted contract, fix the shared function once instead of guarding each caller (`principle-fix-root-causes`).
2. When the requirement is ambiguous or incomplete, name the facts you need, ask for them, and plan no work that depends on an unconfirmed answer. You may name the options you see; the user chooses. Never fill a missing requirement with your own assumption (`principle-never-block-on-the-human`).
3. Before executing, state a minimal plan: the goal; the non-goals, including what is explicitly out of scope; the acceptance criteria; and what stays untouched (`principle-define-done`).
4. Default to one agent. Split off only independent subtasks, and only when splitting materially helps (`principle-guard-the-context-window`).

## Failure Modes

Each ends in work larger than the requirement: fixing the surface without the intent; piling patches, compatibility layers, dual implementations, or copies on a problem one root-cause fix would solve; over-designing for rare cases; starting from a wrong premise; guessing or searching where you should have read the code directly; using "add tests" as cover to expand scope, add abstractions, or look thorough.

## Action Boundaries

1. State the Workflow step 3 plan before executing; everything below depends on that boundary. Wait for agreement only where the requirement is ambiguous or a material choice is open.
2. Get user confirmation before any irreversible operation. Losing uncommitted work counts as irreversible (`principle-preserve-unrelated-work`).
3. Execute these reversible operations without asking:
   - `git revert`, and branch switches that carry your changes across;
   - `git restore` **only** when the target has no uncommitted changes you would lose;
   - moving files into a backup directory inside the repository, once you have confirmed the destination path does not exist;
   - test runs, diffs, plan generation, and read-only analysis.
4. Stop and rewrite a smaller plan when you catch yourself:
   - adding abstractions, frameworks, or configuration layers the task does not need (`principle-subtract-before-you-add`);
   - designing ahead for possible future use (`principle-foundational-thinking`);
   - stacking constraints to satisfy existing constraints;
   - touching many unrelated files (`principle-preserve-unrelated-work`);
   - creating a second implementation to keep old logic alive (`principle-migrate-callers-then-delete-legacy-apis`).
5. A request for extra mechanism is not by itself an accepted requirement. When the user asks for work no accepted behaviour needs, leave it out of the plan, name it as a non-goal, and say why. Ask the user to raise it as a separate requirement if they still want it.

## Testing

Tests serve the acceptance of the current change, nothing else.

1. Write one failing test for the next behaviour change (added, altered, or removed behaviour), then the minimum code that makes it pass. **If you find yourself changing behaviour without a failing test, stop and write the test first.**
2. Exception: while tests are green, you may refactor production code without adding behaviour, then re-run the tests as the regression check.
3. Run the related existing tests before adding anything. If one already fails for the behaviour you are about to build, that is your red: do not write a second test for it.
4. When no existing test is your red, extend a related test that does not yet express the required behaviour, provided it can carry that behaviour without taking on a second responsibility. Otherwise add one focused test.
5. Per behaviour (not per file or module), cover one main path and, where the behaviour can fail meaningfully, one critical failure path.
6. Do not expand test scope for completeness, backfill unrelated modules, or test boundaries the requirement did not ask for.
7. Do not introduce new test frameworks or infrastructure.
8. Do not write snapshot matrices, parametrised grids, or end-to-end suites.
9. Do not let green tests justify more abstraction.

Ask of each test:

- Which accepted requirement does it verify?
- Is it simpler than the implementation?

Test code longer or more complex than the implementation signals overengineering: look for a smaller test that still fails first.

## Code Change Principles

- Every change must leave tests, type checks, and static analysis passing, including any applicable strict mode such as TypeScript strict mode. Report any failure you cannot fix rather than working around it (`principle-never-weaken-a-check`, `principle-gaps-are-not-passes`).
- After every green, assess refactoring; refactor only when it adds value now.
- Follow the codebase's existing patterns and conventions.
- Keep changes small and incremental.
- Commit when the work is complete and the plan allows it. If the plan puts git history out of scope, leave the changes uncommitted and say so.

## Documentation

At the end of every significant change, ask: **"What do I wish I'd known at the start?"** Correct CLAUDE.md and AGENTS.md when your change makes them wrong. `core:learn` owns the procedure for deciding whether to record an answer and how (`principle-encode-lessons-in-structure`). Whenever you write or propose a rule:

- Write the reusable rule, not the incident that revealed it: the action and the condition that makes it necessary. For a fixed fault, write it so a reader can detect the fault and follow the approved repair.
- Amend the rule that already owns the subject; otherwise add one imperative sentence or bullet in the section that owns it, in that file's voice. Add a heading or code example only when a reader cannot apply the rule without it.
- Decline a template, a Context/Issue/Solution breakdown, a retrospective, or a verification checklist in the instruction file, however the user asks, with this reason: the instruction file carries the rule alone, and a reader can apply it without them. Put your reasoning in your reply, not in the file.
- When you propose the text rather than apply it, say the files stay unchanged.

## Communication

- State the trade-offs and reasoning behind significant design decisions.
- Flag any deviation from these guidelines, with the justification.

## Pre-Completion Checklist

Confirm every item before reporting the task done:

- The work matches the plan: goal met, non-goals still out, untouched areas untouched.
- Every behaviour change started from a failing test.
- The solution is the minimum approach, not the maximum.
- You read the relevant code directly instead of guessing.
- You changed only the minimum set of files.
- Related existing tests, type checks, and static analysis pass.
- New tests lock only the behaviour this change altered, or existing behaviour the user explicitly asked to cover, and their count is low.
- Tests introduced no new dependencies or directory structures.
- The diff is small: no extra files, no leftover debug code.
- You did no extra work purely to look complete.

## Relationship to Other Skills

- `core:reducer` removes mechanism from an existing system; this skill keeps mechanism out of new work. When a task only removes mechanism from working code and adds no behaviour, say `core:reducer` owns it and write no removal plan of your own. State only the limits that still hold: name the module or modules the change stays inside, say the rest stay untouched, and keep behaviour identical. Re-run the existing tests afterwards as the regression check, not as proof of equivalence. Add no test for the removal itself. Name any affected behaviour the existing tests do not cover, because that gap must close before the removal is safe.
- `web:tdd` drives the Red-Green-Refactor cycle in detail; this skill sets the scope limits inside that cycle.
