# Claude Code and Codex Plugins

Custom agents, skills, and commands for software development workflows.

## Install with Codex

```bash
codex plugin marketplace add mintuz/skills
```

Restart the ChatGPT desktop app, open the Plugins Directory, choose
**Mintuz Skills**, and install the bundles you need.

## Install with Claude Code

```bash
# Add the marketplace
/plugin marketplace add https://github.com/mintuz/skills

# Install plugins
/plugin install core@mintuz-skills
/plugin install web@mintuz-skills
/plugin install typescript@mintuz-skills
/plugin install system-design@mintuz-skills
/plugin install product-management@mintuz-skills
/plugin install app@mintuz-skills
/plugin install life@mintuz-skills
```

## Plugins

| Plugin                 | Description                                                                                  |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| **core**               | Core workflows: commits, learning, code review, prompts, PRs, writing, and persistent memory |
| **web**                | Web development with CSS, React, Tailwind, TDD, testing, and design patterns                 |
| **typescript**         | TypeScript strict mode, schema-first development, and best practices                         |
| **system-design**      | Architecture visualization with Mermaid diagrams                                             |
| **product-management** | PRDs, task management with Task Master MCP, decision tracing, and status updates             |
| **app**                | Swift iOS development with App Intents, Swift Testing, and SwiftUI architecture              |
| **life**               | Personal life management with GPS method for goal achievement                                |

## Skills

### Core

| Skill             | Description                                                                                  |
| ----------------- | -------------------------------------------------------------------------------------------- |
| `acceptance-review` | Verify implementation against an authoritative contract with an explicit verdict           |
| `commit-messages` | Conventional commit messages that explain the "why" not just the "what"                      |
| `yagni`           | Minimum sufficient execution, scope boundaries, TDD, and documentation practices              |
| `gauntlet-loop`   | Improve ambitious artifacts against a concrete bar using separate builders and fresh critics |
| `graph-engineering` | Orchestrate interdependent specs and stories as a contract-first execution graph with a verifier per node |
| `learn`           | Document learnings and capture insights into CLAUDE.md                                       |
| `pr`              | PR descriptions, sizing, and creation with gh CLI                                            |
| `pseudocode`      | Render module boundaries, signatures, arguments, and a cited call graph for existing or planned code |
| `reducer`         | First-principles system simplification with behavioral equivalence proofs                    |
| `ship-pr`         | Commit, publish, repair, and monitor a GitHub pull request through merge                      |
| `writing`         | Developer-focused writing: tutorials, how-tos, docs with clear structure                     |
| `wtf`             | Re-explain an unclear response in plain, precise UK English                                  |

### Web

| Skill              | Description                                                              |
| ------------------ | ------------------------------------------------------------------------ |
| `css`              | CSS best practices for maintainable, scalable styles                     |
| `react`            | Production-ready React architecture and patterns                         |
| `xstate`           | Typed XState actor lifecycles with legal Mermaid statechart visualization |
| `react-testing`    | React Testing Library patterns for components, hooks, and context        |
| `frontend-testing` | DOM Testing Library patterns for behavior-driven UI testing              |
| `tdd`              | Test-Driven Development principles and Red-Green-Refactor workflow       |
| `refactoring`      | Refactoring assessment and patterns after tests pass                     |
| `web-design`       | Visual hierarchy, spacing, typography, and UI polish                     |
| `tailwind`         | Design systems with Tailwind CSS, design tokens, and component libraries |
| `eyes`             | Visual feedback loop with Playwright screenshots for UI iteration        |
| `chatgpt-app-sdk`  | Build ChatGPT apps using OpenAI Apps SDK and MCP with conversational UX  |

### App

| Skill                           | Description                                                                                     |
| ------------------------------- | ----------------------------------------------------------------------------------------------- |
| `swift-testing`                 | Swift Testing framework: @Test macros, #expect/#require patterns                                |
| `app-intent-driven-development` | Build features as App Intents first for Siri, Shortcuts, widgets, and SwiftUI                   |
| `swiftui-architecture`          | Modern SwiftUI patterns: @Observable, state management, no ViewModels                           |
| `debug`                         | Structured feedback loop for debugging iOS simulator issues and UI problems                     |
| `local-ai-models`               | On-device AI with Foundation Models and MLX Swift: LLMs, VLMs, embeddings, and image generation |
| `app-store-scraper`             | Scrape iOS/macOS App Store data using iTunes/App Store APIs                                     |
| `app-store-keyword-ops`         | Mine Astro competitor keywords and safely update locale-specific App Store fields               |
| `ios-localize-copy`             | Localize iOS and App Store copy across every supported locale                                   |
| `xcode-dev-loop`                | Canonical xcodebuild build/test/simulator loop: background runs, result reading, screenshots    |
| `asc-screenshots`               | Upload App Store screenshots and previews through helm-asc: staging, locales, verification      |

### TypeScript

| Skill        | Description                                                           |
| ------------ | --------------------------------------------------------------------- |
| `typescript` | Schema-first development, strict typing, functional patterns, and Zod |

### Life

| Skill        | Description                                                                        |
| ------------ | ---------------------------------------------------------------------------------- |
| `gps-method` | Evidence-based goal achievement framework using Goal, Plan, and System methodology |

### System Design

| Skill | Description |
| --- | --- |
| `mermaid-generator` | Generate Mermaid diagrams from code to visualize architecture and relationships |

### Product Management

| Skill            | Description                                                                       |
| ---------------- | --------------------------------------------------------------------------------- |
| `decision-trace` | Trace claimed decisions from source evidence through delivery artifacts          |
| `meeting-to-action-brief` | Turn meeting evidence into a concise decision and action brief                  |
| `status-updates` | Team updates and stakeholder comms with scannable structure and honest tone       |
| `story-pr-orchestrator` | Coordinate dependency-gated stories through isolated pull requests              |

## Agents

| Agent                 | Plugin             | Description                                                                                          |
| --------------------- | ------------------ | ---------------------------------------------------------------------------------------------------- |
| `code-reviewer`       | web                | Expert code review specialist focusing on quality, security, performance, and maintainability        |
| `refactorer`          | web                | Refactoring coach to guide code improvement decisions and assess opportunities after tests pass      |
| `senior-web-engineer` | web                | Expert UI engineer for building robust, scalable React components with focus on standards compliance |
| `test-runner`         | web                | Runs tests with auto-detection and returns concise pass/fail summaries                               |

## MCP Integrations

Some plugins include MCP server configurations:

- **core** - Memory MCP for persistent knowledge storage across sessions
- **web** - Playwright MCP for browser automation and visual checks
- **product-management** - Task Master MCP for task management workflows
- **app** - XcodeBuildMCP and iOS Simulator MCP for app development workflows

## Using Skills with Claude Web

The `.dist` folder contains individual skill zip files ready for upload to Claude web (claude.ai). Each skill is packaged as a separate zip file that can be uploaded independently to the skills section in your Claude web conversations.

### Generating Skill Zips

Run the packaging script from the repository root:

```bash
# Create individual skill zips in .dist directory
go run scripts/package-skills.go

# This creates files like:
# .dist/commit-messages.zip
# .dist/react.zip
# .dist/swift-testing.zip
# etc.
```

### Uploading to Claude Web

1. Visit [claude.ai](https://claude.ai)
2. Navigate to the skills section
3. Upload the individual zip files from `.dist`
4. Access the skills in your web conversations

See [scripts/README.md](scripts/README.md) for more options including custom output directories and skill name prefixing.

### Syncing individual skills to Codex CLI

The marketplace installation above is the normal Codex plugin path. Use this
script only when you want flattened, standalone skills instead.

Skills can also be synced to the OpenAI Codex CLI format, making them available for use with Codex.

Run the sync script from the repository root:

```bash
# Sync all skills to ~/.codex/skills (user-level)
go run scripts/codex-sync.go

# Sync to .codex/skills in current project (project-level)
go run scripts/codex-sync.go --project

# This syncs skills like:
# commit-messages
# react
# swift-testing
# etc.
```

After syncing, invoke skills in Codex CLI using the `$skill-name` syntax (e.g., `$commit-messages`, `$react`).

See [scripts/README.md](scripts/README.md) for more options including custom output directories, skill name prefixing, and dry-run mode.

## Credits

- [City Paul's dotfiles](https://github.com/citypaul/.dotfiles/tree/main/claude/.claude)
- [Lee Cheneler's dotfiles](https://github.com/LeeCheneler/dotfiles)
- [Thomas Ricouard's Skills](https://github.com/Dimillian/Skills)
