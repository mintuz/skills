---
name: expectations
description: WHEN setting repository working agreements or changing behavior under strict TDD; NOT for test-framework mechanics or standalone documentation; enforces red-green-refactor, verification, and durable-learning gates.
---

# Expectations

Use one working agreement for every behavior change: establish the observable outcome, then move through **red → green → refactor**. Apply the repository's own conventions wherever they are stricter.

## 1. Establish the outcome

Read the requirements, relevant code, tests, callers, and project guidance before editing. Separate known constraints from assumptions and resolve repository evidence first. Ask the user when an unresolved choice would change observable behavior, scope, or risk.

**Complete when:** the intended behavior, affected surfaces, applicable conventions, and any unresolved choice are explicit.

## 2. Go red

Write the smallest test that expresses the next behavior through a public boundary. Run it and confirm that it fails because the behavior is absent. Production edits begin only after this failure is observed.

**Complete when:** the focused test fails for the intended behavioral reason rather than setup, syntax, or an unrelated defect.

## 3. Go green

Make the minimum production change that satisfies the red test. Reuse existing patterns, keep the increment small, maintain coverage for changed behavior, and satisfy strict type rules when the project uses them. Run the focused test and its nearest related tests.

**Complete when:** the new behavior and its local regression surface pass without speculative production code.

## 4. Refactor deliberately

After every green, assess whether a behavior-preserving change would improve clarity, remove duplicated knowledge, or simplify structure. Refactor only when that value is concrete, preserve public behavior, and rerun the affected tests.

**Complete when:** the assessment is explicit, every valuable refactor is finished, and the affected tests remain green.

## 5. Close the change

Run the proportionate full test suite and static analysis. Review the final diff against the requested scope and update any project documentation affected by the behavior. Explain significant decisions and trade-offs, and identify any deviation from these agreements with its reason.

For every significant change, ask: **"What do I wish I'd known at the start?"** When the answer reveals durable project knowledge, invoke `core:learn`; that skill owns the significance threshold, placement, and format.

**Complete when:** tests and static analysis pass, every changed file is intentional, affected documentation is current, and `core:learn` is complete for each qualifying insight or the change is explicitly judged non-qualifying. Create a requested commit only after this gate.
