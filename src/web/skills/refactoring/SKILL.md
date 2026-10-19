---
name: refactoring
description: WHEN you need a plan to refactor, restructure, or clean up working code and the test result is known, either green or a recorded failing set; NOT for new feature delivery or any behavior change; reversible-baseline safety with prioritized improvements.
---

# Refactoring

Refactoring is the third step of TDD: after GREEN, assess whether refactoring
adds value. A refactor improves the structure of working code; it never changes
observable behaviour.

## When to Refactor

- Always assess after green
- Refactor only if it improves the code
- **Establish a reversible baseline with a known test result before refactoring**
- **Pin the behaviour the refactor must preserve with a passing test first**

### Reversible Baseline

A baseline is a state you can return to, so a broken slice costs one restore
instead of a debugging session. A commit is one way to record it, not a
requirement; refactoring uncommitted code is safe when the baseline is recorded
another way.

Stay inside the user's authorised boundary:

- Commit the baseline only when the user asked for a baseline commit and the
  owned changes are the only changes present. A separate commit also keeps git
  history readable.
- A request for one commit is a request for the refactor commit. Add no extra
  checkpoint commit for it.
- Otherwise, record enough to restore the owned paths: their current content or
  diff, or a clean-tree restore point that already holds that content. Also
  record the test commands you ran and their results. A list of path names
  alone restores nothing. Preserve unrelated worktree changes.
- Do not commit, stage, stash, or reset without an explicit request.
- If the suite is not fully green, record the exact set of failing tests in the
  baseline; that set must be unchanged after the refactor. Restore green first
  when you can, as a separate change, never inside the refactor.

**Workflow:**

1. GREEN: The suite passes, or the failing set is known and reproducible
2. BASELINE: Save the authorised reversible state and that test result
3. CHARACTERIZE: Pin any unpinned behaviour the refactor must preserve
4. REFACTOR: Apply one structural slice
5. VERIFY: Run the named characterization and focused behaviour tests, then the
   relevant regression suite; on failure, restore only that slice
6. COMMIT: Save the refactor separately when requested

### Characterization Tests

A green suite proves only the behaviours it asserts, not that code is safe to
move. Characterize before you move code, and only what matters:

1. Trace the call path the change touches. List what each caller can observe
   across the boundary you are about to move.
2. Keep the entries a caller relies on or the task states as required. Discard
   incidental details no caller can observe; pinning those freezes an
   implementation instead of a contract. Common entries that do cross the
   boundary: public signatures, error type, error object identity, ordering,
   cleanup timing, retry count and delay, and fan-out to multiple waiters.
3. For each kept entry no test asserts, write a test asserting the current
   observable behaviour.
4. Run those tests against the unchanged implementation. They must pass before
   you move any code.

A failing characterization test means you do not yet understand the current
behaviour: stop and investigate before refactoring.

Characterization tests are not speculative work; they record existing behaviour
callers already depend on.

When a required behaviour cannot be characterized, stop before the refactor and
report which behaviour you could not pin.

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

Before extracting, state the evidence: the rule, policy, or specification the
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

Every new production behaviour must have a failing test that demanded it; if no
test drives it, do not write it. The rule governs new production behaviour only,
not a structural refactor of working code and not a characterization test.

❌ **Speculative code examples:**

- "Just in case" logic
- Features not yet needed
- Code written "for future flexibility"

**What to do**: Delete speculative code. Add behaviour tests instead.

**Untested is not the same as speculative.** Code that runs in production and
that a caller depends on is live behaviour, whatever its coverage. Characterize
it and keep it. Delete it only as a separate agreed behaviour change with its
own test, never inside a refactor.

---

## When NOT to Refactor

Don't refactor when:

- ❌ The structure is already clear (no improvement to make)
- ❌ The change only satisfies a style preference
- ❌ It would change behaviour (that's a feature, not refactoring)
- ❌ Premature optimization
- ❌ Code is "good enough" for current phase

When a request changes observable behaviour, say so and deliver it test-first
as a feature. Do not label or plan it as a refactor, and do not give it a
refactoring priority; the Priority Classification table applies to refactorings
only.

---

## Commit Messages for Refactoring

```
refactor: extract scenario validation logic
refactor: simplify error handling flow
refactor: rename ambiguous parameter names
```

**Format**: `refactor: <what was changed>`. Never mix refactoring commits with
feature commits.

---

## Refactoring Checklist

- [ ] The focused behaviour tests and the relevant regression suite give the
  same result after the refactor as the recorded baseline, including any
  recorded pre-existing failure
- [ ] No test was edited, skipped, or deleted to hide a difference
- [ ] Every observable behaviour the change could break has a passing
  characterization test
- [ ] No new public APIs added
- [ ] Code more readable than before
- [ ] Baseline and rollback preserve unrelated worktree changes
- [ ] Failed verification restores only the owned structural slice
- [ ] Committed separately from features when requested
- [ ] No speculative code added
- [ ] Behaviour unchanged, as far as the characterization and regression tests
  can show
