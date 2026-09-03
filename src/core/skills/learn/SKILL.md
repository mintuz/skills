---
name: learn
description: WHEN preserving a durable project learning, gotcha, or decision in repository instructions such as AGENTS.md or CLAUDE.md, including when the user names the file; NOT for trivial or one-off details; checks the authoritative instruction file and writes the smallest safe rule.
---

# Preserve a Project Learning

Capture the reusable rule, not the incident that revealed it.

## 1. Find the authority

Read the repository's instruction hierarchy and the relevant nearby section.
Follow pointers and generated-file notices to their owning source; the target may
be `AGENTS.md`, `CLAUDE.md`, or another local instruction file. Treat a file as
authoritative only when the instruction hierarchy gives it that role; a file that
the hierarchy presents as reference material takes no rule.

Identify every existing rule that overlaps the learning. Amend an existing rule
when it already owns the meaning. State whether you amend that rule or add a new
one beside it.

Complete when the authoritative file, the target section, and any overlapping
rule are identified by name.

## 2. Decide whether to record it

When the source is raw notes rather than a finished rule, derive the learning
first. From an incident, name what behaviour was unexpected, which assumption was
wrong, and what the verified cause was. From a decision, name the chosen option,
the rejected alternative, and the verified reason. From any other source, name
the verified pattern or constraint and the conditions in which it applies. From
every source, name what a future reader must do differently. Discard the rest.

Keep a learning only when it is verified and at least one is true:

- it prevents a recurring class of bugs or security failures;
- it records a non-obvious invariant, constraint, or approved operating path;
- it preserves architectural rationale that the repository does not express;
- it would save meaningful investigation time on a future task.

Record nothing when no criterion above is true, or when an existing rule already
covers the learning. A verified, project-specific rule stays even when it
restates a general good practice. When you record nothing, propose no change and
name the reason. When an existing rule already covers the learning, name that
file, that section, and that rule.

Record only the verified part of a learning. When a cause or a repair is a
hypothesis, propose no rule that depends on it. Say which fact is unverified.
Name the specific artefact that would confirm or refute it, such as a log, a
metric, a configuration value, or a controlled experiment. Ask the user to
supply that artefact. Record no rule that depends on the hypothesis until they
supply it. A separate observation that is already verified may still be recorded
when it meets the criteria above.

Complete when each learning is either rejected with a named reason or reduced to
a verified, reusable claim.

## 3. Remove what must not persist

Exclude incident chronology, speculation, transient state, and implementation
details unlikely to recur. Write only facts the source supplies. Do not invent
paths, module names, symbol names, commands, values, owners, or examples.

Never write credentials, personal or customer data, or internal hostnames and
addresses, even when the user asks for them. Name the owning secret manager or
environment manager instead of a live value.

Name every security bypass the source supplies. Give the exact setting, flag,
or tool name, and state the effect the source records for it, so that the
prohibition is unambiguous. Do not give the value, argument, or command line that
makes the bypass work. State the status the source records, such as a temporary,
unsafe diagnostic used during investigation. State in every case that the bypass
must not become repository guidance or a recommended fix. Keep the proposed rule on the approved path.

Complete when the proposed text holds no secret, no personal data, no invented
fact, and no usable bypass instruction.

## 4. Make the smallest patch

Match the target file's voice and structure. Prefer one imperative sentence or
bullet in an existing section. Give the action and the verified mechanism that
makes it necessary, so that a reader knows what to do and why it applies. When
the source gives both a fault and its verified repair, write the rule so that a
reader can detect the fault and then follow the approved repair. Add a heading or
an example only when a reader cannot apply the rule correctly without it. Do not
restate nearby guidance.

Return the authoritative file, the target section, and the exact text to add.
The instruction file carries the rule alone: add no summary, rationale section,
retrospective, or verification checklist to it, even when a documentation
template asks for one. Explain your reasoning in your reply instead.

If the user requested a proposal, state that files remain unchanged. If the user
authorized an edit, apply only that patch and report the file changed.

Complete when the outcome is exactly one of these: no change, with a named
reason; an exact proposed patch, with files unchanged; or one applied patch,
with the changed file reported. In each case the rule you propose or apply is
safe, discoverable, and not duplicated, and no unrelated documentation changed.
