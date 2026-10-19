---
name: wtf
description: >
  WHEN the immediately previous LLM response was unclear, too dense, or hard to
  follow; NOT for doing the work that response describes, and NOT for writing a
  new document from it; returns a plain UK English re-explanation that keeps
  every detail that changes how the response should be understood.
---

# WTF

## Procedure

1. Read the immediately previous LLM response.
2. If no previous LLM response exists, say there is nothing to re-explain, ask which response or text to explain, and stop. Do not invent, quote, or guess a previous response.
3. If the response uses domain terms, look in the current project for `CONTEXT.md`, `GLOSSARY.md`, `UBIQUITOUS_LANGUAGE.md`, and `*.glossary.yml` files. Take canonical terms and meanings from them, but add no information from them that the previous response did not contain.
4. Re-explain the previous response with clearer structure and simpler wording.
5. Preserve every detail that changes how the response should be understood: each condition, causal link, uncertainty, constraint, exception, dependency, example, technical identifier, value, unit, warning, scope, conclusion, and relationship.
6. Attribute operational actions to the previous response so the explanation cannot read as a new task. Do not perform a new task.

## Writing Rules

Write in a style inspired by ASD-STE100 Simplified Technical English.

- Use active voice and plain UK English.
- Write for a reading level between Key Stage 4 and Further Education.
- Use the same term for the same concept throughout.
- Use precise, technically accurate wording; when clarity and brevity conflict, prioritise accuracy and unambiguous meaning.
- Use short sentences where possible; put one main action in each sentence.
- Use the imperative for direct instructions.
- Define an uncommon abbreviation or specialist term at first use.

## Clarity Controls

- Put each prerequisite, condition, warning, or limitation before the action it governs.
- Replace a prose noun with the canonical term when a terminology file gives one; otherwise use the previous response's own nouns.
- Keep every literal identifier, path, command, and value exactly as the previous response wrote it.
- Replace vague pronouns with the specific subject.
- Remove idioms, unnecessary synonyms, ambiguous references, and complex noun clusters.
- Add no information absent from the previous response.
- State uncertainty where the previous response was uncertain.
- Report a contradiction in the previous response as a contradiction. Do not resolve it, choose a side, or state what the previous response intended. State that the previous response does not establish which statement is correct.
- Keep the scope of an absolute word such as `only`, `never`, `all`, or `always`; never weaken it to `usually` or `mostly`.

## Completion Criterion

The explanation is complete when it re-explains the immediately previous LLM response in clearer plain language, preserves every detail that changes its meaning, and starts no new work.

With no previous LLM response, the reply is complete when it says there is nothing to re-explain and asks which response or text to explain.
