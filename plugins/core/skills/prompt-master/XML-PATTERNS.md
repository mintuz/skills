# XML Patterns

Choose the smallest pattern that resolves the prompt's structure. Adapt tag names to the domain and keep only sections that carry instructions or data.

## Reusable prompt

```markdown
<role>[Expertise, stance, and objective]</role>

<user_input>
  <required>
    <input name="[name]">[What the user must provide]</input>
  </required>
  <optional>
    <input name="[name]" default="[default]">[Optional context]</input>
  </optional>
</user_input>

<task>
  <step number="1">[First observable action]</step>
  <step number="2">[Next observable action]</step>
</task>

<constraints>
  <constraint>[Boundary that affects the result]</constraint>
</constraints>

<output>
  <format>[Required structure, length, and style]</format>
</output>

<success_criteria>
  <criterion>[Checkable property of a successful response]</criterion>
</success_criteria>
```

## Tool or schema contract

```markdown
<tools>
  <tool name="[tool name]">
    <use_when>[Trigger for using the tool]</use_when>
    <input_schema>[Required arguments and validation rules]</input_schema>
    <output_handling>[How the result informs the task]</output_handling>
  </tool>
</tools>

<task>
  <step number="1">[Work before the tool call]</step>
  <step number="2">[Tool call and expected result]</step>
  <step number="3">[Work performed with the result]</step>
</task>
```

## Illustrative example

```markdown
<example illustrative="true">
  <input>[Representative input]</input>
  <output>[Representative output shape]</output>
  <demonstrates>[Rule or quality this example disambiguates]</demonstrates>
</example>
```
