---
name: refactoring
description: WHEN tests are green and you need a refactor plan; NOT for new feature delivery; reversible-baseline safety with prioritized improvements.
---

# Refactoring

Refactoring is the third step of TDD. After GREEN, assess if refactoring adds value.

## When to Refactor

- Always assess after green
- Only refactor if it improves the code
- **Establish a reversible GREEN baseline before refactoring**

### Reversible Baseline

Use the user's authorised boundary:

- If a commit was requested and contains only owned changes, commit the GREEN
  baseline.
- Otherwise, record the owned paths or diff plus the exact passing test commands
  and results. Preserve unrelated worktree changes.

**Workflow:**

1. GREEN: Tests pass
2. BASELINE: Save the authorised reversible state
3. REFACTOR: Apply one structural slice
4. VERIFY: Run focused behavior checks, then the relevant regression suite; on
   failure, restore only that slice
5. COMMIT: Save the refactor separately when requested

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

If code isn't driven by a failing test, don't write it.

**Key lesson**: Every line must have a test that demanded its existence.

❌ **Speculative code examples:**

- "Just in case" logic
- Features not yet needed
- Code written "for future flexibility"
- Untested error handling paths

**What to do**: Delete speculative code. Add behavior tests instead.

---

## When NOT to Refactor

Don't refactor when:

- ❌ Code works correctly (no bug to fix)
- ❌ No test demands the change (speculative refactoring)
- ❌ Would change behavior (that's a feature, not refactoring)
- ❌ Premature optimization
- ❌ Code is "good enough" for current phase

**Remember**: Refactoring should improve code structure without changing behavior.

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

- [ ] Focused behavior tests and the relevant regression suite pass before and
  after the refactor
- [ ] No new public APIs added
- [ ] Code more readable than before
- [ ] Baseline and rollback preserve unrelated worktree changes
- [ ] Failed verification restores only the owned structural slice
- [ ] Committed separately from features when requested
- [ ] No speculative code added
- [ ] Behavior unchanged (tests prove this)
