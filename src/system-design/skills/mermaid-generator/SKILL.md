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

If the target or intent is materially ambiguous, ask one concise clarifying question before analyzing code. Completion criterion: the scope and diagram purpose are explicit or confirmed.

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

Separate observed relationships from inferred ones. Do not present a convention, naming guess, or likely runtime behaviour as a fact without source evidence. Completion criterion: each important node and edge in the planned diagram has a source basis or is explicitly marked as an inference.

### 4. Construct the diagram

Choose the least detailed diagram that answers the request. Prefer clarity over completeness:

- group related elements with meaningful subgraphs or boundaries;
- use names from the code, with short labels where readability requires it;
- choose `TB` or `LR` based on the dominant direction of the relationship;
- label important edges with calls, events, data, or state transitions;
- include an error path when omitting it would misrepresent the system;
- include circular dependencies and flag them as concerns;
- keep unrelated implementation details out of the primary diagram.

Use valid Mermaid syntax. Quote labels containing punctuation that Mermaid could parse as syntax, use stable node identifiers, and keep declarations compatible with the selected diagram type. Completion criterion: the diagram is internally consistent, every declared relationship is intentional, and the syntax has been reviewed for Mermaid renderability.

### 5. Deliver the result

Return the result in this structure:

````markdown
## Diagram Overview

[One or two sentences describing scope and intent]

## Files Analyzed

- `path/to/file.ts` — [what it contributed]

## Mermaid Diagram

```mermaid
[diagram]
```

## Key Relationships

1. **[Relationship]** — [why it matters]

## Notes

- [Assumption, omission, inference, or concern]
````

Completion criterion: the response includes the diagram, its evidence paths, the relationships needed to interpret it, and any assumptions or omissions; if the source was insufficient, it says exactly what is missing.

## Diagram Syntax

- Flowcharts: start with `flowchart TB` or `flowchart LR`; use subgraphs for architectural layers.
- Sequences: declare participants and show synchronous, asynchronous, and material error paths.
- Classes: show only relevant properties, methods, inheritance, and composition.
- ER diagrams: use entities with cardinalities such as `||--o{` and name meaningful relationships.
- State diagrams: include the initial state, terminal states where applicable, and event-labelled transitions.
