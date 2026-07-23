# TDD Audit Evidence and Violations

Read this reference when reviewing whether completed work followed TDD or when a Red-Green cycle cannot produce trustworthy evidence.

## Require temporal evidence

A final test and production diff can prove coverage, but not test-first chronology. Establish sequence from commits, saved command output, CI jobs, or a reproducible test applied to the pre-change production revision. Classify chronology as **unverified** when that evidence is unavailable.

Map every changed production behavior to its public test before judging the cycle.

## Classify findings

| Priority | Evidence | Correction |
| --- | --- | --- |
| Critical | Production behavior changed with evidence that its test was written or run only after implementation | Recreate the pre-change state, establish diagnostic Red, then implement from that test |
| Critical | The claimed Red failure is syntax, import, fixture, environment, or unrelated baseline failure | Repair the test path until the behavior assertion fails |
| Critical | Green leaves the targeted or previously passing affected tests failing | Restore the last Green state and satisfy the current slice |
| High | One Red step batches independent behaviors, so the implementation demanded by each cannot be identified | Split the batch into one behavior slice per cycle |
| High | Production code remains that no current or previously green behavior test requires | Remove it or introduce the missing behavior through its own Red cycle |
| High | A test proves a private method or wiring choice instead of the changed public outcome | Move the assertion to the public behavior boundary |
| High | Refactoring begins without a Green checkpoint or changes observable behavior | Restore Green and route the structural change through `refactoring` |
| Medium | Shared mutable setup lets order or mutation affect another test | Create fresh data and harness state per test |

Style preferences, file layout, coverage percentage, and test count are not TDD chronology evidence by themselves.

## Diagnose the broken phase

| Symptom | Broken phase | Evidence to seek |
| --- | --- | --- |
| New test passes on the old production revision | Red | The slice already existed or the assertion cannot observe it |
| New test fails before reaching its assertion | Red | Test infrastructure failure rather than behavior gap |
| Target passes but sibling behavior regresses | Green | The implementation satisfied one example by breaking an earlier contract |
| Diff contains unrelated policy or abstraction | Green | Production beyond the current test's demand |
| Tests change to accommodate a structural refactor | Refactor | Observable contract may have changed |

## Report with bounded claims

For each finding, cite:

- changed behavior and production owner;
- public test or missing test;
- Red and Green evidence, or the exact evidence gap;
- consequence;
- smallest correction.

The audit is complete when every production behavior change is mapped, every chronology claim is proven or marked unverified, every broken phase is named, and unrelated test-style preferences are excluded.
