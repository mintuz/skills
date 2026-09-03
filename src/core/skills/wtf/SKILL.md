---
name: wtf
description: >
  WHEN the immediately previous LLM response was unclear, too dense, or hard to
  follow; NOT for doing the work that response describes, and NOT for writing a
  new document from it; returns a plain UK English re-explanation that keeps
  every detail that changes how the response should be understood.
---

# WTF

Use this skill when the immediately previous response from an LLM was unclear, too dense, or difficult to follow.

## Procedure

1. Read the immediately previous LLM response.
2. If no previous LLM response exists, this skill was started in error. Say that there is nothing to re-explain. Ask which response or text to explain. Stop. Do not invent, quote, or guess a previous response.
3. If the response uses domain terms, look for `CONTEXT.md`, `GLOSSARY.md`, `UBIQUITOUS_LANGUAGE.md`, and files matching `*.glossary.yml` in the current project.
4. Use those files to select the canonical terms and meanings.
5. Re-explain the previous response with a clearer structure and simpler wording.
6. Preserve every detail that changes how the response should be understood, including each condition, causal link, uncertainty, technical identifier, value, scope, conclusion, and relationship.
7. Attribute operational actions to the previous response so the explanation cannot read as a new task.
8. Do not perform a new task.
9. Do not introduce information from the terminology files that the previous response did not contain.

## Writing Rules

Write in a style inspired by ASD-STE100 Simplified Technical English.

- Use active voice.
- Use plain UK English.
- Write for a reading level between Key Stage 4 and Further Education.
- Use the same term for the same concept throughout the explanation.
- Use precise and technically accurate wording.
- Use short sentences where possible.
- Use the imperative form for direct instructions.
- Put one main action in each sentence.
- Define an uncommon abbreviation or specialist term when it first appears.
- Preserve every detail that changes how the response should be understood, including constraints, exceptions, conditions, dependencies, examples, values, units, and warnings.
- Prioritise technical accuracy and unambiguous meaning when clarity and brevity conflict.

## Clarity Controls

- Put each prerequisite, condition, warning, or limitation before the action to which it applies.
- Replace a prose noun with the canonical term when a terminology file gives one. Otherwise use the previous response's own nouns.
- Keep every literal identifier, path, command, and value exactly as the previous response wrote it.
- Replace vague pronouns with the specific subject.
- Remove idioms, unnecessary synonyms, ambiguous references, and complex noun clusters.
- Do not add information that is not present in the previous response.
- State uncertainty when the previous response was uncertain.
- Report a contradiction in the previous response as a contradiction. Do not resolve it. Do not choose one side. Do not state what the previous response intended. State that the previous response does not establish which statement is correct.
- Keep the scope of an absolute word such as `only`, `never`, `all`, or `always`. Do not weaken that scope to a word such as `usually` or `mostly`.

## Completion Criterion

The new explanation is complete when it re-explains the immediately previous LLM response, preserves every detail that changes how the response should be understood, and uses clearer plain language without starting new work.

If no previous LLM response exists, the reply is complete when it says that there is nothing to re-explain and asks which response or text to explain.
