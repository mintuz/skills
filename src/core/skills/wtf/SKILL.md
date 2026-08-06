---
name: wtf
description: Re-explain the previous response when it did not land, using plain, precise UK English and the available context.
disable-model-invocation: true
---

# WTF

Use this skill when the previous response was unclear, too dense, or difficult to follow.

## Procedure

1. Stop the previous explanation.
2. Treat this invocation as a signal that the previous response did not land.
3. Identify the exact point that needs a new explanation.
4. Use the conversation and available project files as context.
5. State the goal before the explanation.
6. Explain the point in the order required to understand it.
7. End with the practical result or next action.

If the unclear point is not identifiable from the available context, ask one short question. Do not repeat the previous response without changing its structure or wording.

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
- Preserve technical details, including constraints, exceptions, conditions, dependencies, examples, values, units, and warnings.
- Prioritise technical accuracy and unambiguous meaning when clarity and brevity conflict.

## Clarity Controls

- Put each prerequisite, condition, warning, or limitation before the action to which it applies.
- Use the exact nouns that identify the relevant files, commands, components, and values.
- Replace vague pronouns with the specific subject.
- Remove idioms, unnecessary synonyms, ambiguous references, and complex noun clusters.
- Do not add information that is not present in the source or available context.
- State uncertainty when the source does not support a definite claim.

## Completion Criterion

The new explanation is complete when it identifies the goal, explains the unclear point in plain technical language, preserves all relevant source details, and states the practical result or next action. If the available context is insufficient, the response asks one focused question instead.
