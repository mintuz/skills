# Checking Metadata with the Siri Metadata Analyzer

`sirimetadataanalyzer` is a command-line tool in Xcode's toolchain. It reads an app's **built** App Intents metadata and reports how well Siri's model can use it: missing or unclear titles and descriptions, entities that expose too little, tools that closely match a system schema, and more. Run it whenever you add or change tool intents, generable entities, or their metadata. Don't rely on your own judgment of whether the metadata is clear enough.

## Running it

Build the app first. The analyzer reads build output, not source. Then run it on the built app:

```sh
xcrun sirimetadataanalyzer path/to/MyApp.app
```

It also accepts the app's `Metadata.appintents` directory or the `extract.actionsdata` file inside it. To find the built app, use the target's `BUILT_PRODUCTS_DIR` build setting:

```sh
xcodebuild -showBuildSettings -scheme MyApp | grep -E ' (BUILT_PRODUCTS_DIR|FULL_PRODUCT_NAME) ='
```

| Option | Use |
|---|---|
| `--format text\|json\|diagnostics\|preview` | Output format. The default is `text`. Use `json` when you need to act on the findings. |
| `--language <code>` | Analyze the text in one localization, such as `fr`. The default is the development language. Run it once per shipping language when the app is localized. |
| `--config <file>` | A JSON file that disables rules, overrides severities, or suppresses findings |

**Exit status:** `0` means there are no error-level findings, `2` means there are some, and `1` means the analysis couldn't run (for example, the path isn't built App Intents metadata).

## Reading the results

Each finding has a rule ID (such as `SMA109`), a severity (`error`, `warning`, `suggestion`, or `info`), the intent, parameter, or entity it applies to, and a message. Text output looks like this:

```
Metadata.appintents — 2 intents (0 tools), 3 entities

  info       SMA109  app
             The app has 2 intents but none is a tool, so Siri can't call any of them. …

0 errors · 0 warnings · 0 suggestions · 1 info
```

With `--format json`, the output also includes `ruleTitles` and a `summary` with tool and entity counts.

## Fixing findings

Each finding's message says what's wrong and what to change. Fix it in source, rebuild, and run the analyzer again. Change the shared metadata, and don't invent API to satisfy a finding.

A few findings need context the message doesn't give:

- **`SMA202` (parameter has no description).** If the parameter's title already says everything, such as "Quantity" for an `Int`, you can leave the description out (see `tool-intents.md`).
- **`SMA203` (entity property has no description).** It applies to every entity, not only generable ones. On an entity that also ships before 27.3, `description:` doesn't build until the deployment target is 27.3. See the fallback in `entity-properties.md`.
- **`SMA701` (tool closely matches a system schema).** If the tool does what the schema covers, adopt the schema instead (see the app-intents-whats-new-27 skill's schema-adoption reference). A primary-domain schema intent can't also be a tool. Otherwise make the title and description say what's specific to the app.

**What the analyzer doesn't check.** It doesn't flag tools whose jobs overlap, such as "Add" and "Add Product," vague skill descriptions, or Swift type names in a skill body. Check those yourself (see `tool-intents.md` and `skills-bundle.md`).

## Workflow

1. Build the app.
2. Run the analyzer with `--format json`.
3. Fix every `error`, then the `warning`s, by changing the metadata in source: titles, descriptions, parameter descriptions, and which intents are tools (see `tool-intents.md` and `generable-entities.md`). Apply suggestions when they make sense.
4. Rebuild and run it again until it exits `0`, and the remaining findings are ones you've decided to keep.
5. Then write or revise skills (see `skills-bundle.md`) for whatever cross-intent guidance is still needed.

## Common pitfalls

- **Running it on source or a stale build.** It reads built metadata. If the build fails, the analyzer silently reports the previous build's findings. Make sure the build succeeded before you read the results.
- **Suppressing findings to get a clean run.** Only suppress a finding with `--config` when the developer has decided to keep the behavior. Fix the metadata instead.
- **Inventing model-only text to satisfy a finding.** Fix the shared title and description. There's no separate text for the model.
- **Treating a clean run as proof that Siri works.** The analyzer checks the metadata's shape. To test real requests, use the siri-evaluations skill.
