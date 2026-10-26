# Reviewer selection

Use this reference in step 1 to choose and configure the reviewer. Find the options at run time. Availability, model quality and safety controls change, so keep no fixed ranking of vendors, CLIs or models.

## Required capabilities

A reviewer is usable only when it has all five:

1. A context separate from the authoring conversation.
2. Read access to the artifact and to the repository context that it needs.
3. Read-only behaviour that the host enforces, for files and for external systems.
4. Enough reasoning capability for the risk of the work.
5. A way to return its complete text: the findings and the exact verdict line.

Reject a candidate that cannot guarantee read-only behaviour. Do not give a reviewer broad permissions to make up for missing isolation.

Read-only allows checks that change no external state and write nothing that the review keeps, for example the test suite, a typecheck, a build or a search. Prefer a sandboxed candidate that can run these checks, because they give `executed` evidence instead of inference.

## Selection order

1. A usable reviewer from a different model provider from the model that built the work.
2. Among those, the one with the stronger reasoning and the safer isolation.
3. When none is usable, and the user has not explicitly required a different provider: a fresh same-provider agent or process with no inherited authoring context.
4. When neither is safe: no review. Report that the double-check could not run.

Look for candidates in the host's agents and tools, its installed integrations and their current documentation.

## Invocation

Read the host's or the provider's current tool schema or help for the syntax. Set:

- the strongest suitable model, or the user's configured default;
- the highest practical reasoning effort;
- read-only or plan-only access;
- non-interactive input, when it is available;
- capture of the complete output.

Pass the brief through a scratch file or a structured tool argument, not a long shell argument. Do not log in or change authentication from this skill. When an integration does not work, skip it, and report it.

## Round one

Give round one only the cold brief and access to the artifact. Do not fork the authoring conversation or reuse an existing session. Context isolation reduces anchoring, but it does not make a same-provider reviewer independent: label that mode `same-provider fresh-context fallback`.

## Later rounds

After round one, prefer to resume the reviewer's own session when the host can do it safely, so that the reviewer settles each ledger item itself. When it cannot, start a fresh read-only round. Give that round the complete ledger, your response to each finding, the updated scope and the new validation evidence.
