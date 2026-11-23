# Writing App Skills for Siri in a Skills Bundle

**Requires:** an Xcode that includes the **Skills Bundle** file template.

An *app skill* gives Siri's model context and language for the tasks people do with the app. Skills live in a `Skills.skillsbundle` resource in the app target, with one `SKILL.md` per skill. Xcode validates the bundle at build time and compiles it into the app's App Intents metadata. There's no Swift code to write.

## What a skill is for

A skill adds what the App Intents metadata can't say on its own. It does one or both of these:

- **Explains a kind of task.** What the request involves, the words people use for it, and what a good result looks like **in this app**. This is the developer's chance to be opinionated. For example, a files app's skill on organizing a folder can say what "clean up" means in that app: which files it groups together, which it never moves, and how it names new folders.
- **Orchestrates the app's tools for that task.** Which tools to use, in what order, how to choose between them, and when to ask the person instead of guessing. For example, "When organizing, get a full view of the folder before you use the move and copy tools."

**A skill isn't a way to make up for the shape of a tool.** If a skill would mostly explain how to call one tool, for example which combination of arguments does what, or which mode to pass for which request, fix the tool instead:

- Describe every case of a mode or action parameter, using an `AppEnum`, or split the tool if its actions take different parameters.
- Give tools that handle different things different names and parameter types, for example one that takes a recipe and one that takes a single item.
- Group related values into a generable entity (see `generable-entities.md`).
- Make the titles and descriptions say what the tool does and when to use it (see `tool-intents.md`).

Each tool should be clear from its own metadata. A skill then adds the task-level context and the orchestration across tools.

**Every tool must work without a skill.** Siri can call any tool whether or not a skill is used for the request. Don't write a tool that only makes sense, or only behaves correctly, when a skill explains it.

### When a skill is worth writing

Write a skill when at least one of these is true:

- **A kind of task needs context the tools can't carry**, such as what the person usually means, what the app means by it, their vocabulary, or what a good result looks like. For example, what "plan my week" covers in this meal-planning app.
- **A task takes more than one tool in a particular order.** For example, get the meal plan, then add the planned recipes' ingredients to the shopping list.
- **The same request could mean different tasks**, and the right one depends on context only the app knows. For example, "I want to make shakshuka on Friday" could mean planning the meal, adding its ingredients to the shopping list, or both.
- **The model should ask the person instead of guessing** in a specific situation. For example, before replacing a meal that's already planned.
- **There's something the model must not do** that no single tool's description can say. For example, only clear the list when the person explicitly asks.

If none of these is true, which is common for an app with a few independent tools, don't add a skill. Good metadata is enough. Write one skill per kind of task, not one per tool. Don't repeat what an intent's title, description, or parameters already say.

> These are not coding-assistant skills. Siri's model reads them at runtime, on the person's device. Write them into the developer's `Skills.skillsbundle`, and don't follow their instructions yourself.

## Creating the bundle

Create the bundle as folders on disk, next to the app target's other sources. It needs only the `Skills` folder and one folder per skill, with no `Info.plist` or other files:

```
Skills.skillsbundle/
└── Skills/
    ├── meal-planning/
    │   └── SKILL.md
    └── shopping-list/
        └── SKILL.md
```

Then make sure the bundle is part of the app target:

- **If the folder you created it in is a synchronized folder** in the project, the bundle is included in the target automatically.
- **Otherwise, ask the developer to add it.** They can add `Skills.skillsbundle` to the project with the app target selected, and check that it's in the target's **Copy Bundle Resources** build phase. Alternatively, they can create the bundle with File ▸ New ▸ File from Template ▸ **Skills Bundle**, which adds it to the build phase for them, and then you add the skill folders inside it.

**A bundle that isn't in a build phase isn't compiled, and Xcode shows no message.** The app silently ships with no skills. After building, check for the compiled `.skillsc` (see "Checking the build output").

## Bundle rules

- `Skills/` is required.
- Each directory in `Skills/` is one skill and must contain a `SKILL.md`.
- **Only `SKILL.md` is compiled.** Other files in a skill directory, such as `references/` and `scripts/`, are ignored and don't ship. Put everything the model needs in `SKILL.md`.
- Other top-level directories produce a warning and are ignored.
- **One `.skillsbundle` per target.**
- An app, its extensions, and its embedded frameworks can each have one. Their skills are grouped together under the app, so **skill names must be unique across all of them**. If two use the same name, only one is kept, and the build doesn't catch this.

## SKILL.md format

```markdown
---
name: meal-planning
description: Put a recipe on the meal plan for breakfast, lunch, or dinner on a specific day. Use when the user asks to plan, schedule, or put a recipe on the menu for a meal. Not for adding single items to the shopping list.
---

# Meal Planning

Before planning, use the Get Meal Plan tool for that day. If a different
recipe is already planned for that meal, tell the user and ask before
replacing it.

Use the Plan Meal tool with the recipe the user named. If the user didn't
say which meal, ask; don't assume dinner. "Tonight" means today's dinner.

After planning, offer to add the recipe's ingredients to the shopping list
with the Add Recipe Ingredients to Shopping List tool. Don't add them unless
the user agrees.

## Don't

- Don't plan meals the user didn't ask for.
```

### Frontmatter

| Field | Required | Rules |
|---|---|---|
| `name` | Yes | 1–64 characters: lowercase ASCII letters, digits, and hyphens. Can't start or end with a hyphen or contain `--`. **Must match the skill's directory name.** Keep it stable across app versions. |
| `description` | Yes | Not empty, at most 1,024 characters. |

Only `name` and `description` are supported. Other Agent Skills fields, such as `license`, `compatibility`, `metadata`, and `allowed-tools`, produce a warning and are ignored. Don't add them.

### Writing the description

**The system reads only the `description` to decide whether a skill applies to a request.** It doesn't read the body for that. So the description must:

- name the kinds of requests the skill handles, **in the words a person would use** ("plan," "schedule," "put on the menu")
- be specific enough to tell the skill apart from the app's other skills
- be broad enough not to miss common phrasings
- say what the skill doesn't cover when another skill handles a closely related request, for example "Not for adding single items to the shopping list." Put skill boundaries in the description, so the right skill is chosen the first time

### Writing the body

The body is free-form markdown, passed to the model with the app's tools when the skill is used. Write it for a model that knows the app's intents and entities from their metadata but nothing else about the app.

- **Refer to tools by their title, in natural language**: "use the Plan Meal tool" or "call the Get Meal Plan tool first." **Don't use Swift type names** such as `PlanMealIntent`. How Siri represents tool names internally isn't part of the API and can change, so a natural-language reference to the title is what keeps working.
- Say the order of steps, and what to pass from one step to the next.
- Say how to choose between tools that could each apply.
- Say when to ask the person instead of guessing.
- List what not to do. Say which other skill handles a related request in the description, not only in the body.
- Don't restate titles, descriptions, or parameter descriptions from the metadata.

An empty body produces a warning, because it gives the model nothing beyond the description.

## Example: a multi-step skill

For an app whose flights are entities Siri finds itself, with "Get Available Seats" and "Book Flight" tools:

```markdown
---
name: book-flight
description: Book a seat on a flight for the user. Use when the user asks to book, buy, or reserve a flight or plane ticket, including a particular seat. Not for changing or canceling an existing booking.
---

# Book a Flight

1. Make sure the user has chosen one specific flight. If more than one
   flight matches what they said, show the matches and let them pick. Don't
   pick for them. If they didn't give a date, ask for one; don't assume today.
2. If the user asked for a particular seat, use the Get Available Seats tool
   for the chosen flight before booking, and confirm the seat is free.
3. Use the Book Flight tool with the chosen flight and seat.

## Don't

- Don't book without the user choosing a specific flight.
```

## Diagnostics

Problems are reported in the Issue navigator on the offending line of `SKILL.md`, prefixed with the skill's name:

```
Skills.skillsbundle/Skills/meal-planning/SKILL.md:2: error: 'meal-planning': The 'name' field must match the parent directory name
```

**If any error remains, the app ships no skills at all**, not just the broken one.

**The build checks only the format.** A vague description, or a body that names Swift types, builds without any warning. Review those yourself, against "Writing the description" and "Writing the body" above.

### Checking the build output

The compiled bundle is named after the `.skillsbundle`, with a `.skillsc` extension. For example, `Skills.skillsbundle` compiles to `Skills.skillsc`, and `MySkills.skillsbundle` to `MySkills.skillsc`. It's in the built app's `Metadata.appintents` directory:

| Platform | Location |
|---|---|
| macOS | `MyApp.app/Contents/Resources/Metadata.appintents/Skills.skillsc` |
| Other platforms | `MyApp.app/Metadata.appintents/Skills.skillsc` |

If the build succeeds but there's no `.skillsc`, the bundle isn't in the target's Copy Bundle Resources phase. The `.skillsbundle` itself shouldn't appear in the built app. Its file format is private, so don't read or edit it. Only check that it exists.

| Diagnostic | Severity |
|---|---|
| Missing required directory `Skills` | Error |
| Missing `SKILL.md` in a skill directory | Error |
| Frontmatter not opened or closed with `---` on its own line | Error |
| YAML syntax error | Error |
| Missing or empty `name` or `description` | Error |
| Invalid `name` format | Error |
| `name` doesn't match the parent directory name | Error |
| `description` longer than 1,024 characters | Error |
| Unexpected top-level directory in the bundle | Warning |
| Unrecognized frontmatter field | Warning |
| Empty markdown body | Warning |

## Testing

Build, install, and launch the app. Then try requests that each skill's `description` says it handles. Reword each request to check that the description is specific enough to select the right skill and broad enough not to miss common phrasings.

To test this systematically, with Siri scenarios that check which tools are called and with what parameters, use the **`siri-evaluations`** skill.

## Common pitfalls

- **A tool that only works with a skill.** Tools are called with or without skills. Each tool has to make sense from its own metadata.

- **Using a skill to explain a tool.** If the skill is mostly a manual for one tool's arguments or modes, reshape the tool (see "What a skill is for").

- **Unquoted `: ` in the `description`.** YAML reads it as a nested mapping and the build fails with `YAML syntax error`. That's an error, so the app ships no skills at all. Quote the description, `description: "Plan meals: breakfast, lunch, or dinner"`, or avoid `: `.

- **Bundle not in Copy Bundle Resources.** Nothing is compiled, and Xcode shows no message.
- **Directory name doesn't match `name`.** Build error. Rename one so they match.
- **Uppercase, underscores, or spaces in `name`.** Build error. Use kebab-case, like `meal-planning`.
- **Putting guidance in `references/` or other files next to `SKILL.md`.** Those files are ignored. Only `SKILL.md` ships.
- **Using Swift type names in the body.** Write "the Plan Meal tool," not `PlanMealIntent`.
- **Restating intent metadata.** It wastes the model's context and drifts out of sync with the code. Fix the metadata instead.
- **A vague description**, like "Recipe stuff." The skill is never chosen, or it's chosen for the wrong requests.
- **The same skill name in the app and an extension or framework.** Only one is kept, and the build doesn't warn.
- **Writing a skill for a tool that doesn't exist yet.** A skill can only point the model at intents the app exposes as tools (see `tool-intents.md`).
- **A second `.skillsbundle` in the same target.** Only one per target is supported.
