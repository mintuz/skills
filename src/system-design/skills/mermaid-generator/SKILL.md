---
name: mermaid-generator
description: >
  WHEN creating Mermaid diagrams from code or architecture; NOT for diagrams without a code or system-design source; analyzes the relevant structure and returns a scoped, renderable diagram with evidence and assumptions.
---

# Mermaid Diagram Generator

Create Mermaid diagrams that explain architecture, component relationships, data flow, dependencies, or state transitions found in a codebase.

## Workflow

### 1. Bound the request

Identify the target files or directories, the audience, and the desired diagram type. Use the requested type when supplied. Otherwise infer it from the intent:

| Intent | Diagram |
| --- | --- |
| Architecture, modules, or process flow | `flowchart` |
| Request/response or asynchronous interaction | `sequenceDiagram` |
| Classes, interfaces, or type hierarchy | `classDiagram` |
| Entities and database relationships | `erDiagram` |
| Lifecycle or workflow states | `stateDiagram-v2` |
| Imports or dependency relationships | `flowchart` or `graph` |

If the target or intent is materially ambiguous, ask one concise clarifying question before analyzing code. If the request has no code or system-design source, say so. Name the source that would make the diagram evidence-based. Do not present any diagram you draw as source-derived. Completion criterion: the scope and diagram purpose are explicit or confirmed.

### 2. Discover the source

List the relevant source files with the repository’s file-search tools. Prioritize application code, public interfaces, data models, entry points, services, integrations, and event handlers. Exclude dependencies, generated output, build artifacts, and unrelated files unless the request includes them.

For a large scope, select the smallest set that explains the requested relationship and state what was omitted. If no relevant files exist, report the searched paths and stop. Completion criterion: every file used as evidence is identified by path, and the selected set is sufficient for the requested view.

### 3. Extract observed structure

Read the selected files and record only relationships supported by the source:

- imports, exports, and module boundaries;
- classes, functions, interfaces, and data models;
- callers, callees, ownership, and composition;
- request, response, event, and asynchronous paths;
- persistence, queues, external services, and other integrations;
- state values and transitions;
- error or retry paths when they materially affect the flow.

Separate observed relationships from inferred ones. Do not present a convention, naming guess, or likely runtime behaviour as a fact without source evidence. A shared or similar name is not evidence that an argument, instance, or field is the class of the same name. An argument position is evidence of the parameter it fills when the source shows that parameter list. Record as an inference any link that rests on a name match, or on argument order without that parameter list. Completion criterion: each important node and edge in the planned diagram has a source basis or is explicitly marked as an inference.

Let the request set the level of detail. When the request asks for a complete or
end-to-end view, record every source-observed step in execution order, including
branches, compensation, and returns. Judge later which of them are material. When the request asks for an overview,
record only the steps that carry the relationship being explained.

### 4. Construct the diagram

Choose the least detailed diagram that answers the request. When the request asks for a complete interaction, draw every material step as its own element instead of collapsing it into a note. A step is material when removing it changes how a reader interprets the flow. Group or omit the rest. Prefer clarity over completeness:

- group related elements with meaningful subgraphs or boundaries;
- use names from the code, with short labels where readability requires it;
- choose `TB` or `LR` based on the dominant direction of the relationship;
- label important edges with calls, events, data, or state transitions;
- include an error path when omitting it would misrepresent the system;
- keep a source-observed branch, ordering, concurrency, or compensation step when removing it would misrepresent the flow. Keep it even if the request asks you to remove it. Say in the notes why you kept it;
- draw concurrent work with the parallel construct of the diagram type, such as `par`/`and` in a sequence diagram;
- draw a branch that changes the outcome with the alternative construct of the diagram type, such as `alt`/`else`. If a branch propagates an error, show where that error leaves the frame;
- put the steps that follow a branch inside the branch that continues, when the other branch ends the interaction;
- place each element inside the boundary that the source shows owns it. Mark a dependency whose implementation the source does not show as out of frame, rather than moving its declaration;
- label a node, edge, or binding that rests on inference as an inference. A link taken from a name match is an inference. A link taken from argument order is an inference when the source does not show the parameter list;
- keep an instance and its inferred class distinct where the diagram type has an element for each. Label the link between them as an inference;
- mark a relationship that the source does not resolve as unresolved. Name the missing evidence. Do not guess the link;
- choose the least intrusive notation that the selected diagram type leaves free for this purpose. A dashed edge suits a flowchart. Do not reuse a notation to which the diagram type already gives another meaning;
- show every candidate that the source establishes for an unresolved relationship. Choose none of them;
- include circular dependencies and flag them as concerns;
- keep out of the diagram every element that does not carry the relationship being explained. Name each material omission in the notes.

Use valid Mermaid syntax. Quote labels containing punctuation that Mermaid could parse as syntax, use stable node identifiers, and keep declarations compatible with the selected diagram type. Completion criterion: the diagram is internally consistent, every declared relationship is intentional, and the syntax has been reviewed for Mermaid renderability.

### 5. Deliver the result

Return the result in this structure:

````markdown
## Diagram Overview

[One or two sentences describing scope and intent]

## Files Analyzed

- `path/to/file.ts` — [what it contributed; add `:line` when a line number locates the evidence]

## Mermaid Diagram

```mermaid
[diagram]
```

## Key Relationships

1. **[Relationship]** — [why it matters]

## Notes

- [Assumption, inference, concern, or material omission]
````

Completion criterion: the response includes the diagram, its evidence paths, the relationships needed to interpret it, and any assumptions or omissions. If you drew no diagram because the source was insufficient, the response says exactly what is missing.

## Diagram Syntax

- Flowcharts: start with `flowchart TB` or `flowchart LR`; use subgraphs for architectural layers.
- Sequences: declare participants and show synchronous, asynchronous, and material error paths.
- Classes: show only relevant properties, methods, inheritance, and composition.
- ER diagrams: use entities with cardinalities such as `||--o{` and name meaningful relationships.
- State diagrams: include the initial state, terminal states where applicable, and event-labelled transitions.
