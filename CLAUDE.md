# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Claude Code plugin marketplace containing eight plugins for software development and personal productivity workflows:

- **core** – memory, commit hygiene, refactoring, prompt refinement, and branch review
- **web** – CSS, React, Tailwind, testing, refactoring, and design practices
- **typescript** – strict, schema-first TypeScript guidance
- **system-design** – Mermaid diagram generation from code
- **product-management** – PRD creation, status updates, and task orchestration
- **app** – Swift iOS testing, App Intent-first development, and SwiftUI architecture
- **principle** – 24 independent `principle-*` engineering skills
- **life** – personal life management with GPS method for goal achievement

## Plugin Architecture

Plugins extend Claude Code with three types of content:

1. **Agents** - Autonomous subprocesses with specialized tools and context (defined in `agents/*.md`)
2. **Skills** - Knowledge bases that load into context (defined in `skills/*/SKILL.md`)
3. **Commands** - Slash commands for quick actions (defined in `commands/*.md`)

The marketplace registry (`.claude-plugin/marketplace.json`) indexes all plugins, while each plugin's manifest (`plugin.json`) defines metadata. Discovery differs by harness: Claude registration lists skills, while Codex plugin manifests declare the skills directory. Update both `.claude-plugin/marketplace.json` and `.agents/plugins/marketplace.json`, and validate the target harness rather than assuming identical invocation syntax.

## Repository Structure

```text
.claude-plugin/marketplace.json    # Claude registry with explicit skill paths
.agents/plugins/marketplace.json  # Codex registry with local plugin sources
src/<plugin>/
  .claude-plugin/plugin.json
  .codex-plugin/plugin.json
  skills/<skill-name>/SKILL.md
  agents/                         # Optional agent definitions
  commands/                       # Optional host-specific commands
```

The eight plugin folders are `core`, `web`, `typescript`, `system-design`, `product-management`, `app`, `life` and `principle`. Keep portable skill instructions separate from host metadata.

## Agent Definition Format

Agents are markdown files with YAML frontmatter in `src/[plugin]/agents/`:

```markdown
---
name: agent-name
description: >
  When to use this agent
tools: Read, Grep, Glob, Bash
model: sonnet
color: pink
---

# Agent Title

Agent instructions...
```

**Required:** `name`, `description`, `tools`
**Optional:** `model` (sonnet/opus/haiku), `color`

## Command Definition Format

Commands live in `src/[plugin]/commands/` and include a short YAML header:

```markdown
---
description: What the command does
argument-hint: <argument format>
---

# @command-name

Usage details...
```

## Skill Definition Format

Skills are `SKILL.md` files in `src/[plugin]/skills/[skill-name]/`:

```markdown
---
name: skill-name
description: >
  When to use this skill
---

# Skill Title

Knowledge base content...
```

## Test-Driven Skill Changes

Treat every skill change as TDD. Its Promptfoo suite at `evals/[skill-name]/promptfooconfig.yaml` is the executable specification; create the suite from the existing examples if it does not exist.

1. **RED — record the use case first.** Before editing the skill, add a realistic test whose `scenario` captures the new or changed use case and whose `rubric` defines observable success. Run `pnpm eval:skills:check -- [skill-name]`, then `pnpm test:skills -- [skill-name]` against the unchanged skill. The new case must fail; a pass means the skill already covers the case or the scenario does not expose the gap.
2. **GREEN — make the minimum skill change.** Update the skill only enough to pass the new case, then rerun `pnpm test:skills -- [skill-name]`. Every existing case and the new case must pass.
3. **COMPARE — prove the improvement.** Run `pnpm eval:skills -- [skill-name]` and inspect the no-skill baseline beside the skill treatment. The treatment must improve the intended case without reducing performance on existing cases. The comparison command is informational, so inspect its results rather than relying on its exit code.

Existing scenarios and assertions are the regression contract. Preserve them unless the requirement itself changed. For trigger or description changes, also add a `trigger.promptfooconfig.yaml` and run `pnpm test:skills:triggers -- [skill-name]`, which builds the disposable skill fixture for you. See [`scripts/README.md`](scripts/README.md).

A skill change is complete only when the Promptfoo config records the new scenario and rubric, configuration validation passes, all treatment tests pass, and the comparison demonstrates the intended gain without regression.

## Content inventory

The canonical source is `src/<plugin>/skills/<skill-name>/SKILL.md`. Consult [README.md](README.md) and the marketplace registries for the current inventory. Principles live in the `principle` plugin, retaining `principle-*` directory and frontmatter names. Do not add a combined router or remove the prefix during packaging.

## Adding New Content

**New Agent:** Create `.md` in `src/[plugin]/agents/` with frontmatter

**New Skill:** Create `src/[plugin]/skills/[skill-name]/SKILL.md` with frontmatter

**New Command:** Create `.md` in `src/[plugin]/commands/`

**New Plugin:**

1. Create `.claude-plugin/plugin.json` and `.codex-plugin/plugin.json` under `src/<plugin>/` with matching name/version and appropriate host fields. Codex declares `"skills": "./skills/"`.
2. Register the plugin in both marketplaces. Claude uses `"source": "./src/<plugin>"` and explicit `skills` paths; Codex uses `"source": {"source": "local", "path": "./src/<plugin>"}` plus policy/category metadata. Follow an existing entry in each file.
3. Add the needed skills, agents or commands. Add `.mcp.json` only when required.
4. Validate discovery and packaging; matching Markdown alone does not prove every harness loads it.

## Version Bumping

Bump both manifests for each affected plugin using semver; keep their versions aligned.

## MCP Server Integrations

Some plugins include MCP server configurations in `.mcp.json`:

- **core** - Memory MCP (`@modelcontextprotocol/server-memory`)
- **product-management** - Task Master AI MCP for task orchestration workflows

These servers auto-load when the plugin is active.

## Skill Cross-References

Skills can reference other skills as prerequisites. For example:
- `app:swiftui-architecture` works alongside `app:swift-testing` and `app:app-intent-driven-development`

When creating skills that build on others, include a "Prerequisites" section at the top.

## Description Naming Convention

Use the **WHEN/NOT** pattern for skill and agent descriptions:

```
WHEN [trigger condition]; NOT [exclusion]; [output or behavior]
```

Examples:
- `WHEN writing git/conventional commits; NOT for PR text; returns concise, why-first commit lines`
- `WHEN building SwiftUI views; NOT for UIKit or legacy patterns; provides pure SwiftUI data flow`
