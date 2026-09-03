---
name: refactoring
description: WHEN you need a plan to refactor, restructure, or clean up working code and the test result is known, either green or a recorded failing set; NOT for new feature delivery or any behavior change; reversible-baseline safety with prioritized improvements.
---

# Refactoring

Refactoring is the third step of TDD. After GREEN, assess if refactoring adds
value. Refactoring improves the structure of code that already works; it never
changes observable behavior.

## When to Refactor

- Always assess after green
- Only refactor if it improves the code
- **Establish a reversible baseline with a known test result before refactoring**
- **Pin the behavior the refactor must preserve with a passing test first**

### Reversible Baseline

A refactor needs a state you can return to, so a broken slice costs one restore
instead of a debugging session. A commit is one way to record that state, not a
requirement. Refactoring uncommitted code is safe when the baseline is recorded
another way.

Use the user's authorised boundary:

- Commit the baseline only when the user asked for a baseline commit and the
  owned changes are the only changes present. A separate commit also keeps the
  git history readable.
- A request for one commit is a request for the refactor commit. Do not add an
  extra checkpoint commit for it.
- In every other case, record enough to restore the owned paths: their current
  content or diff, or a clean-tree restore point that already holds that
  content. Record the test commands you ran and their results as well. A list of
  path names alone restores nothing. Preserve unrelated worktree changes.
- Do not commit, stage, stash, or reset without an explicit request.
- If the suite is not fully green, record the exact set of failing tests in the
  baseline. That set must be unchanged after the refactor. Restore green first
  when you can. Fix those failures as a separate change, never inside the
  refactor.

**Workflow:**

1. GREEN: The suite passes, or the failing set is known and reproducible
2. BASELINE: Save the authorised reversible state and that test result
3. CHARACTERIZE: Pin any unpinned behavior the refactor must preserve
4. REFACTOR: Apply one structural slice
5. VERIFY: Run the named characterization and focused behavior tests, then the
   relevant regression suite; on failure, restore only that slice
6. COMMIT: Save the refactor separately when requested

### Characterization Tests

A green suite proves only the behaviors it asserts, not that the code is safe to
move. Characterize before you move code, and characterize only what matters.

1. Trace the call path the change touches. List what each caller can observe
   across the boundary you are about to move.
2. Keep the entries a caller relies on or that the task states as required.
   Discard incidental details that no caller can observe; pinning those freezes
   an implementation instead of a contract. Public signatures, error type, error
   object identity, ordering, cleanup timing, retry count and delay, and fan-out
   to multiple waiters are common examples of what does cross the boundary.
3. For each kept entry that no test asserts, write a test that asserts the
   current observable behavior.
4. Run those tests against the unchanged implementation. They must pass before
   you move any code.

A characterization test that fails means you do not yet understand the current
behavior. Stop and investigate before you refactor.

Characterization tests are not speculative work. They record behavior that
already exists and that callers already depend on.

Stop before the refactor when a required behavior cannot be characterized.
Report which behavior you could not pin.

## Priority Classification

| Priority | Action | Examples |
|----------|--------|----------|
| Critical | Fix now | Mutations, knowledge duplication, >3 levels nesting |
| High | This session | Magic numbers, unclear names, >30 line functions |
| Nice | Later | Minor naming, single-use helpers |
| Skip | Don't change | Already clean code |

## DRY = Knowledge, Not Code

**Abstract when**:

- Same business concept (semantic meaning)
- Would change together if requirements change
- Obvious why grouped together

**Keep separate when**:

- Different concepts that look similar (structural)
- Would evolve independently
- Coupling would be confusing

State the evidence before you extract: the rule, policy, or specification the
copies share, and whether they have changed together in the past. Duplicates
that cite the same rule and have always changed together are one piece of
knowledge. Duplicates that only look alike are not; leave them separate.

## Example Assessment

```typescript
// After GREEN:
const processOrder = (order: Order): ProcessedOrder => {
  const itemsTotal = order.items.reduce((sum, item) => sum + item.price, 0);
  const shipping = itemsTotal > 50 ? 0 : 5.99;
  return { ...order, total: itemsTotal + shipping, shippingCost: shipping };
};

// ASSESSMENT:
// ⚠️ High: Magic numbers 50, 5.99 → extract constants
// ✅ Skip: Structure is clear enough
// DECISION: Extract constants only
```

## Speculative Code is a TDD Violation

If new production behavior isn't driven by a failing test, don't write it. The
rule governs new production behavior only. It does not govern a structural
refactor of code that already works, and it does not govern a characterization
test, which records behavior that already exists.

**Key lesson**: Every new production behavior must have a test that demanded its
existence.

❌ **Speculative code examples:**

- "Just in case" logic
- Features not yet needed
- Code written "for future flexibility"

**What to do**: Delete speculative code. Add behavior tests instead.

**Untested is not the same as speculative.** Code that runs in production and
that a caller depends on is live behavior, whatever its coverage. Characterize
it and keep it. Delete it only as a separate agreed behavior change with its own
test, never inside a refactor.

---

## When NOT to Refactor

Don't refactor when:

- ❌ The structure is already clear (no improvement to make)
- ❌ The change only satisfies a style preference
- ❌ Would change behavior (that's a feature, not refactoring)
- ❌ Premature optimization
- ❌ Code is "good enough" for current phase

**Remember**: Refactoring should improve code structure without changing behavior.

When a request changes observable behavior, say so and deliver it test-first as
a feature. Do not label it a refactor and do not plan it as one. The Priority
Classification table applies to refactorings only. Do not give a behavior change
a refactoring priority.

---

## Commit Messages for Refactoring

```
refactor: extract scenario validation logic
refactor: simplify error handling flow
refactor: rename ambiguous parameter names
```

**Format**: `refactor: <what was changed>`

**Note**: Refactoring commits should NOT be mixed with feature commits.

---

## Refactoring Checklist

- [ ] The focused behavior tests and the relevant regression suite give the same
  result after the refactor as the recorded baseline, including any recorded
  pre-existing failure
- [ ] No test was edited, skipped, or deleted to hide a difference
- [ ] Every observable behavior the change could break has a passing
  characterization test
- [ ] No new public APIs added
- [ ] Code more readable than before
- [ ] Baseline and rollback preserve unrelated worktree changes
- [ ] Failed verification restores only the owned structural slice
- [ ] Committed separately from features when requested
- [ ] No speculative code added
- [ ] Behavior unchanged, as far as the characterization and regression tests
  can show
