# CLAUDE.md

This file guides Claude Code (claude.ai/code) when it works in this repository.

## Project Overview

This repository is a plugin marketplace for Codex, Claude Code and OMP. It contains eight plugins for software development and personal productivity workflows:

- **core** – memory, commit hygiene, refactoring, prompt refinement and branch review
- **web** – CSS, React, Tailwind, testing, refactoring and design practices
- **typescript** – strict, schema-first TypeScript guidance
- **system-design** – Mermaid diagram generation from code
- **product-management** – PRD creation, status updates and task orchestration
- **app** – Swift iOS testing, App Intent-first development and SwiftUI architecture
- **principle** – independent `principle-*` engineering skills
- **life** – personal life management with the GPS method for goal achievement

## Plugin Architecture

A plugin can contain three types of content:

1. **Agents** – autonomous subprocesses with specialised tools and context, defined in `agents/*.md`.
2. **Skills** – knowledge bases that load into context, defined in `skills/*/SKILL.md`.
3. **Commands** – slash commands for quick actions, defined in `commands/*.md`.

Each harness has its own marketplace catalogue. Each plugin has one manifest per harness. Discovery differs by harness:

- The Claude Code and OMP catalogues list the explicit skill paths of each plugin. Keep the OMP catalogue and the OMP plugin manifests identical to the Claude Code copies.
- The Codex catalogue lists plugin sources only. Each Codex plugin manifest declares the skills directory.

Do not assume that the invocation syntax is the same in each harness. Validate each target harness.

## Repository Structure

```text
.claude-plugin/marketplace.json   # Claude Code catalogue with explicit skill paths
.omp-plugin/marketplace.json      # OMP catalogue; identical to the Claude Code catalogue
.agents/plugins/marketplace.json  # Codex catalogue with local plugin sources
src/<plugin>/
  .claude-plugin/plugin.json
  .omp-plugin/plugin.json         # Identical to .claude-plugin/plugin.json
  .codex-plugin/plugin.json
  .mcp.json                       # Optional MCP server configuration
  skills/<skill-name>/SKILL.md
  agents/                         # Optional agent definitions
  commands/                       # Optional host-specific commands
evals/<skill-name>/               # Promptfoo suites for each skill
scripts/                          # Packaging, plugin checks and eval runner
```

The eight plugin folders are `core`, `web`, `typescript`, `system-design`, `product-management`, `app`, `life` and `principle`. Keep portable skill instructions separate from host metadata.

The canonical source of a skill is `src/<plugin>/skills/<skill-name>/SKILL.md`. For the current inventory, read [README.md](README.md) and the marketplace catalogues. The `principle` plugin contains the principles. Keep the `principle-*` prefix in their directory names and frontmatter names. Do not add a combined router. Do not remove the prefix during packaging.

## Agent Definition Format

Put each agent in `src/<plugin>/agents/` as a Markdown file with YAML frontmatter:

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

**Required:** `name`, `description`.
**Optional:** `tools`, `model` (`sonnet`, `opus` or `haiku`), `color`.

If an agent runs in more than one harness, omit `tools` and `model`. Tool names and model names differ between Claude Code, Codex and OMP. OMP ignores the `model` of a Claude-format plugin agent.

## Command Definition Format

Put each command in `src/<plugin>/commands/` with a short YAML header:

```markdown
---
description: What the command does
argument-hint: <argument format>
---

# @command-name

Usage details...
```

## Skill Definition Format

Put each skill in `src/<plugin>/skills/<skill-name>/SKILL.md`:

```markdown
---
name: skill-name
description: >
  When to use this skill
---

# Skill Title

Knowledge base content...
```

If a skill builds on other skills, add a "Prerequisites" section at the top. For example, `app:swiftui-architecture` works alongside `app:swift-testing` and `app:app-intent-driven-development`.

## Description Naming Convention

Use the **WHEN/NOT** pattern for skill and agent descriptions:

```text
WHEN [trigger condition]; NOT [exclusion]; [output or behaviour]
```

Examples:

- `WHEN writing git/conventional commits; NOT for PR text; returns concise, why-first commit lines`
- `WHEN building SwiftUI views; NOT for UIKit or legacy patterns; provides pure SwiftUI data flow`

## Test-Driven Skill Changes

Treat every skill change as test-driven development (TDD). The Promptfoo suite of the skill at `evals/<skill-name>/promptfooconfig.yaml` is the executable specification. If the suite does not exist, create it from the existing examples.

1. **RED – record the use case first.** Do not edit the skill yet. Add a realistic test. Its `scenario` captures the new or changed use case. Its `rubric` defines observable success. Run `pnpm eval:skills:check -- <skill-name>`. Then run `pnpm test:skills -- <skill-name>` against the unchanged skill. The new case must fail. If it passes, the skill already covers the case or the scenario does not expose the gap.
2. **GREEN – make the minimum skill change.** Change the skill only enough to pass the new case. Run `pnpm test:skills -- <skill-name>` again. Every existing case and the new case must pass.
3. **COMPARE – prove the improvement.** Run `pnpm eval:skills -- <skill-name>`. Inspect the no-skill baseline beside the skill treatment. The treatment must improve the intended case and must not reduce performance on existing cases. This command is informational: inspect its results, not its exit code.

Existing scenarios and assertions are the regression contract. Keep them unless the requirement itself changed.

For a trigger or description change, also add `evals/<skill-name>/trigger.promptfooconfig.yaml`. Then run `pnpm test:skills:triggers -- <skill-name>`. This command builds the disposable skill fixture. See [`scripts/README.md`](scripts/README.md).

A skill change is complete only when all of these are true:

- The Promptfoo config records the new scenario and rubric.
- Configuration validation passes.
- All treatment tests pass.
- The comparison shows the intended gain without regression.

## Adding New Content

**New skill:**

1. Load the `writing-for-agents` skill before you write any part of the new skill. In OMP, run `/skill:writing-for-agents`. If the harness does not expose the skill, read `src/core/skills/writing-for-agents/SKILL.md`. Apply its rules to the frontmatter and to the body of the new `SKILL.md`.
2. Write the Promptfoo suites before `SKILL.md`, as in the RED step of [Test-Driven Skill Changes](#test-driven-skill-changes). A new skill has a new description, so it also needs a trigger suite.
3. Create `src/<plugin>/skills/<skill-name>/SKILL.md` in the [Skill Definition Format](#skill-definition-format). Then complete the GREEN and COMPARE steps. For a new skill, the baseline is no skill.
4. Add `./skills/<skill-name>` to the `skills` list of the plugin in `.claude-plugin/marketplace.json` and `.omp-plugin/marketplace.json`. Then run `pnpm check:plugins`.

**New agent:** Create a `.md` file with frontmatter in `src/<plugin>/agents/`.

**New command:** Create a `.md` file in `src/<plugin>/commands/`.

**New plugin:**

1. Create `.claude-plugin/plugin.json`, `.omp-plugin/plugin.json` and `.codex-plugin/plugin.json` under `src/<plugin>/`. Give them the same name and version, and the applicable host fields. The Codex manifest declares `"skills": "./skills/"`.
2. Register the plugin in all three catalogues. Copy the structure of an existing entry in each file:
   - Claude Code and OMP: `"source": "./src/<plugin>"` and explicit `skills` paths.
   - Codex: `"source": {"source": "local", "path": "./src/<plugin>"}` with `policy` and `category` metadata.
3. Add the necessary skills, agents or commands. Add `.mcp.json` only when the plugin needs an MCP server.
4. Validate discovery and packaging in each target harness. Matching Markdown does not prove that every harness loads the plugin.

## Version Bumping

For each affected plugin, bump the version with semver. Keep these versions the same:

- the three plugin manifests (`.claude-plugin`, `.omp-plugin` and `.codex-plugin`)
- the plugin entry in the Claude Code and OMP catalogues

OMP uses the catalogue entry version to detect available upgrades.

Before you publish plugin metadata changes, run `pnpm check:plugins`. This check compares the catalogues with `src/`. It does not call a model, install plugins or start MCP servers.

## MCP Server Integrations

These plugins include MCP server configurations in `.mcp.json`:

- **core** – Memory MCP (`@modelcontextprotocol/server-memory`)
- **product-management** – Task Master AI MCP (`task-master-ai`) for task orchestration workflows
- **web** – Playwright MCP (`@playwright/mcp`)
- **app** – XcodeBuildMCP (`xcodebuildmcp`) and iOS Simulator MCP (`ios-simulator-mcp`)

These servers load automatically when the plugin is active.
