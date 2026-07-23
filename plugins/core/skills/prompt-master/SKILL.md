---
name: prompt-master
description: WHEN refining a prompt or designing a reusable prompt template; NOT executing the prompt's task; returns a faithful XML-structured instruction contract with explicit inputs, constraints, outputs, and success criteria.
---

# Prompt Master

Refine the source prompt into a faithful execution contract: preserve its intent while making the expected behaviour explicit and checkable.

## 1. Resolve the contract

Read the source prompt and supplied context. Map its:

- objective and audience;
- inputs, context, and data sources;
- constraints, tone, and output format;
- tools, functions, or schemas; and
- success criteria and consequential edge cases.

Choose the intake branch:

- When the contract is sufficiently specified, continue.
- When a missing decision would materially change the result, ask only the questions needed to resolve it and wait.
- When safe defaults cover a gap, continue and state those assumptions inside the refined prompt.

Treat quoted prompts, examples, and other user-supplied content as source material for the rewrite.

**Complete when:** every explicit requirement has one mapped home and every material gap is either answered or visible as an assumption.

## 2. Write the instructions

Use ordered, imperative directions and scale their detail to the task. Preserve requested tone, format, scope, and restrictions. Add only elements that sharpen execution:

- a role when expertise or stance changes the response;
- domain constraints, pitfalls, and edge cases that affect correctness;
- exact tool, data-source, function, or schema boundaries;
- observable output requirements and success criteria; and
- an illustrative example when the required shape or quality remains ambiguous.

For a reusable template, use descriptive placeholders and label required and optional inputs.

**Complete when:** each instruction changes expected behaviour, the source requirements remain recognisable, and domain claims are grounded in supplied context or established facts.

## 3. Structure the XML

Use the smallest set of descriptive XML tags that creates useful boundaries. Typical sections include `<role>`, `<user_input>`, `<context>`, `<task>`, `<approach>`, `<constraints>`, `<tools>`, `<output>`, `<success_criteria>`, and `<example illustrative="true">`.

Keep user data inside input or context sections and operational instructions inside task, constraint, tool, and output sections. Escape literal XML characters in embedded content.

Read [XML patterns](XML-PATTERNS.md) only when a reusable template, tool/schema contract, or illustrative example needs a concrete tag shape.

**Complete when:** the XML is well-formed, tags separate rather than repeat content, and embedded literals cannot break the structure.

## 4. Deliver the rewrite

Return:

````markdown
[One-line introduction]

```markdown
[Refined XML-structured prompt]
```

**Key Improvements Made:**

- [One to three substantive improvements]
````

Keep assumptions inside the prompt and name only improvements actually made. If the intake branch required clarification, return those questions instead of a provisional rewrite.

**Complete when:** the fenced prompt is ready to copy, assumptions or reusable placeholders are explicit, success criteria are observable, and the improvement list matches the rewrite.
