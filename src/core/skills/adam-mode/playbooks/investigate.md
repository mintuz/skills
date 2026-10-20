# Investigate

A question about how, why, impact or consequences. The deliverable is an answer. Leave the subject unchanged (principle-investigate-read-only).

1. **Restate the question.** Write the question and its scope in one sentence (principle-state-the-scope).
2. **Pick the skill.** For how code works, use `how`. For why it was built, use `why`. For what a change can break, use `blast-radius`. For an explanation of a PR or diff, use `explain-diff` when it is installed, or `how` on the diff. For earlier work, use `recall`.
3. **Gather the evidence.** Read the code and its history. When a run can answer the question, run it. When the user offers a hunch, test it as one hypothesis.
4. **Answer.** Follow Writing the reply in the SKILL.md. For a decision or an option, the first sentence names the main gain and the main loss; then list what it makes possible and what it costs, as separate items. When you have not read the code, put the label "inferred" and the check that would confirm it beside each claim, not in one general disclaimer.

## Variant: diagnose from an artifact

The user hands over an artifact, for example a crash report, a trace, a CI log or a heap snapshot. Make no fix unless the user asks for one.

1. **Identify the format.** Name the format and the tool that produced it, for example a macOS `.ips` crash report (JSON) or its translated text form.
2. **Make it queryable.** Convert the artifact before you read it: symbolicate a crash report with the matching symbols, parse JSON with `jq`, or filter a log to the failing step. Do this step even when a translated or excerpted artifact looks readable, and state the format and the conversion in the reply.
3. **Attribute the finding.** Give the file, the symbol and the line. When you cannot get the line, name what you need to get it.
4. **Label the confidence.** Call the cause a hypothesis unless a before/after pair confirms it. Name the check that would confirm it.
