---
name: principle-reuse-before-building
description: "WHEN about to write a helper, owner, script or component; NOT for removing redundancy before an addition or building a tool for uncovered repeated work; finds and uses an existing mechanism, command or action path, or records why new code is needed."
---

# Reuse before building

Use an existing mechanism, command or action path before creating one.

1. Before writing a helper, owner, script or component, search for an existing mechanism, command, query, codemod, check or action path that covers the need. Record where you looked and what each candidate covers.
2. When an option is sufficient, use it with recorded inputs and invocation. Reuse working infrastructure, such as a test runner or CI job, rather than adding a parallel one. A new file is not proof of usefulness.
3. When a new entry point needs an existing action, such as a screen button for an operation that an intent or service already performs, call that same action path. Do not duplicate its service calls or side effects in the new caller.
4. When an option covers only part of the need, use it for that part and close the named gap in or beside it, keeping its existing callers' behaviour. Build new code only for a gap no existing option covers, and state that gap.
5. When the need could add a material third-party dependency, search in this order: the repository, the standard library, the platform, then the dependencies that the project already has. A material dependency is more than trivial glue or an ordinary fix, and the user or the spec has not already chosen it. When no owned option covers the need, compare the new dependency with the smallest local build that does, and record each cost on both sides. On the dependency side, count the glue code, upgrades, security advisories, licence and the cost to remove it later. On the build side, count the delivery delay to build and test it, and its long-run ownership. Choose the option with the lower total cost. A maintained dependency that wins this comparison is reuse.

Distinct from: `principle-subtract-before-you-add` (about to add a mechanism, owner, queue, validator or abstraction: remove proven redundancy first), `principle-build-the-lever` (a repeated transformation or hard-to-check result that no existing tool covers), `principle-derive-from-one-owner` (the same fact or decision is already computed or stored twice).

Done: the search for an existing option is recorded, any new code is justified by a named gap, and any material new dependency is justified by its comparison with the smallest local build.
