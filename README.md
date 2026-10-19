# Development Skills

Reusable development skills for Codex, Claude and OMP. The new workflow and principle skills use portable Markdown instructions; host-specific discovery and tools remain the harness’s responsibility.

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
/plugin install principle@mintuz-skills
```

## Use with OMP or standalone skill loaders

Keep each complete skill directory, including references. For the 54 skills adapted from pstack (7 core workflows and 47 principles), the copier adds [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) so the MIT notice travels with the bundle. To generate flat directories with the existing copier:

```bash
go run scripts/codex-sync.go --output /path/to/your/skills
```

Point the harness’s skill discovery at that directory, or copy it into its documented skill location. The copier preserves ordinary `SKILL.md` bundles; despite its name it does not translate the instructions into a Codex-only format. Leave `--prefix` off to preserve names such as `principle-prove-it-works`.

Use one authoritative distribution per skill name. Run `omp --help` for the installed version’s discovery/filter options. See [validation status](reports/skill-audit-2026-10-13/delivery-summary.md) for checks actually completed; portable prose alone is not a runtime certification.

## Plugins

| Plugin                 | Description                                                                                  |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| **core**               | Core workflows: commits, learning, code review, prompts, PRs, writing, and persistent memory |
| **web**                | Web development with CSS, React, Tailwind, TDD, testing, and design patterns                 |
| **typescript**         | TypeScript strict mode, schema-first development, and best practices                         |
| **system-design**      | Architecture visualization with Mermaid diagrams                                             |
| **product-management** | PRDs, task management with Task Master MCP, decision tracing, and status updates             |
| **app**                | Swift iOS development with App Intents, Swift Testing, and SwiftUI architecture              |
| **principle**          | 54 independent engineering principles, each invoked for a specific decision                  |
| **life**               | Personal life management with GPS method for goal achievement                                |

## Skills

### Core

| Skill                       | Description                                                                                               |
| --------------------------- | --------------------------------------------------------------------------------------------------------- |
| `acceptance-review`         | Verify implementation against an authoritative contract with an explicit verdict                          |
| `commit-messages`           | Conventional commit messages that explain the "why" not just the "what"                                   |
| `yagni`                     | Minimum sufficient execution, scope boundaries, TDD, and documentation practices                          |
| `gauntlet-loop`             | Improve ambitious artifacts against a concrete bar using separate builders and fresh critics              |
| `graph-engineering`         | Orchestrate interdependent specs and stories as a contract-first execution graph with a verifier per node |
| `learn`                     | Document learnings and capture insights into CLAUDE.md                                                    |
| `pr`                        | PR descriptions, sizing, and creation with gh CLI                                                         |
| `pseudocode`                | Render module boundaries, signatures, arguments, and a cited call graph for existing or planned code      |
| `reducer`                   | First-principles system simplification with behavioral equivalence proofs                                 |
| `ship-pr`                   | Commit, publish, repair, and monitor a GitHub pull request through merge                                  |
| `writing`                   | Developer-focused writing: tutorials, how-tos, docs with clear structure                                  |
| `wtf`                       | Re-explain an unclear response in plain, precise UK English                                               |
| `create-verification-skill` | Create and cold-replay one critical user-journey check                                                    |
| `blast-radius`              | Trace material change risks and decisive checks                                                           |
| `how`                       | Explain the current execution path and state ownership                                                    |
| `why`                       | Recover rationale while separating fact, inference and unknown                                            |
| `benchmark-checklist`       | Check measurement correctness, repeatability and interpretation                                           |
| `correct`                   | Turn recurring enforceable mistakes into verified structural guards                                       |
| `recall`                    | Recover bounded past context and reconcile it with current evidence                                       |

### Web

| Skill              | Description                                                               |
| ------------------ | ------------------------------------------------------------------------- |
| `css`              | CSS best practices for maintainable, scalable styles                      |
| `react`            | Production-ready React architecture and patterns                          |
| `xstate`           | Typed XState actor lifecycles with legal Mermaid statechart visualization |
| `react-testing`    | React Testing Library patterns for components, hooks, and context         |
| `frontend-testing` | DOM Testing Library patterns for behavior-driven UI testing               |
| `tdd`              | Test-Driven Development principles and Red-Green-Refactor workflow        |
| `refactoring`      | Refactoring assessment and patterns after tests pass                      |
| `web-design`       | Visual hierarchy, spacing, typography, and UI polish                      |
| `tailwind`         | Design systems with Tailwind CSS, design tokens, and component libraries  |
| `eyes`             | Visual feedback loop with Playwright screenshots for UI iteration         |
| `chatgpt-app-sdk`  | Build ChatGPT apps using OpenAI Apps SDK and MCP with conversational UX   |

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

| Skill               | Description                                                                     |
| ------------------- | ------------------------------------------------------------------------------- |
| `mermaid-generator` | Generate Mermaid diagrams from code to visualize architecture and relationships |

### Product Management

| Skill                     | Description                                                                            |
| ------------------------- | -------------------------------------------------------------------------------------- |
| `decision-trace`          | Trace claimed decisions from source evidence through delivery artifacts                |
| `meeting-to-action-brief` | Turn meeting evidence into a concise decision and action brief                         |
| `status-updates`          | Team updates and stakeholder comms with scannable structure and honest tone            |
| `story-pr-orchestrator`   | Coordinate dependency-gated stories through isolated pull requests                     |
| `design-handover`         | Explicitly transfer accepted behaviour, matching visuals, authority and durable assets |

## Principles

Each is an independent skill under `src/principle/skills/`, with its full `principle-*` name. Invoke the one relevant to the decision; no router or global principle mode is required.

| Skill | Focus |
| ----- | ----- |
| [`principle-attack-the-premise`](src/principle/skills/principle-attack-the-premise/SKILL.md) | Challenge assumptions shared by failed approaches. |
| [`principle-build-the-lever`](src/principle/skills/principle-build-the-lever/SKILL.md) | Automate repeated work when reuse earns it. |
| [`principle-capture-the-baseline`](src/principle/skills/principle-capture-the-baseline/SKILL.md) | Record the before state before changing it. |
| [`principle-clean-up-what-you-started`](src/principle/skills/principle-clean-up-what-you-started/SKILL.md) | Release only owned resources; keep the evidence. |
| [`principle-define-done`](src/principle/skills/principle-define-done/SKILL.md) | Give every deliverable a checkable completion criterion. |
| [`principle-derive-from-one-owner`](src/principle/skills/principle-derive-from-one-owner/SKILL.md) | One owner per fact; derive the rest. |
| [`principle-earn-every-element`](src/principle/skills/principle-earn-every-element/SKILL.md) | Justify each control or option by a user need. |
| [`principle-encode-lessons-in-structure`](src/principle/skills/principle-encode-lessons-in-structure/SKILL.md) | Turn verified lessons into structural constraints. |
| [`principle-exhaust-the-design-space`](src/principle/skills/principle-exhaust-the-design-space/SKILL.md) | Compare alternatives for material uncertainty. |
| [`principle-experience-first`](src/principle/skills/principle-experience-first/SKILL.md) | Start from the observed user journey. |
| [`principle-explain-the-number`](src/principle/skills/principle-explain-the-number/SKILL.md) | Report numbers with method and class-matched evidence. |
| [`principle-fix-root-causes`](src/principle/skills/principle-fix-root-causes/SKILL.md) | Repair the mechanism; rerun the original failure. |
| [`principle-fix-the-bar-first`](src/principle/skills/principle-fix-the-bar-first/SKILL.md) | Fix selection criteria before evaluating candidates. |
| [`principle-foundational-thinking`](src/principle/skills/principle-foundational-thinking/SKILL.md) | Build a foundation only when current work needs it. |
| [`principle-gaps-are-not-passes`](src/principle/skills/principle-gaps-are-not-passes/SKILL.md) | Report skipped or failed checks as gaps. |
| [`principle-guard-the-context-window`](src/principle/skills/principle-guard-the-context-window/SKILL.md) | Read in bounded slices; search before loading. |
| [`principle-hide-representations`](src/principle/skills/principle-hide-representations/SKILL.md) | Expose domain concepts, not wire or storage shapes. |
| [`principle-investigate-read-only`](src/principle/skills/principle-investigate-read-only/SKILL.md) | An investigation changes nothing it studies. |
| [`principle-judge-with-fresh-eyes`](src/principle/skills/principle-judge-with-fresh-eyes/SKILL.md) | Builders never give the acceptance verdict. |
| [`principle-keep-secrets-out`](src/principle/skills/principle-keep-secrets-out/SKILL.md) | Keep credentials out of output and repositories. |
| [`principle-keep-the-core-pure`](src/principle/skills/principle-keep-the-core-pure/SKILL.md) | Pure domain decisions; thin framework wiring. |
| [`principle-label-the-evidence`](src/principle/skills/principle-label-the-evidence/SKILL.md) | Mark each claim's status, evidence level and source. |
| [`principle-lead-with-the-answer`](src/principle/skills/principle-lead-with-the-answer/SKILL.md) | Put the answer first, background after. |
| [`principle-make-operations-idempotent`](src/principle/skills/principle-make-operations-idempotent/SKILL.md) | Handle retries, interruptions and owned cleanup. |
| [`principle-migrate-callers-then-delete-legacy-apis`](src/principle/skills/principle-migrate-callers-then-delete-legacy-apis/SKILL.md) | Prove consumer coverage before deleting APIs. |
| [`principle-minimize-reader-load`](src/principle/skills/principle-minimize-reader-load/SKILL.md) | Collapse layers that own no decision. |
| [`principle-model-the-domain`](src/principle/skills/principle-model-the-domain/SKILL.md) | Represent legal states, transitions and ownership. |
| [`principle-narrow-state-lifetime`](src/principle/skills/principle-narrow-state-lifetime/SKILL.md) | Keep mutable state request-owned and short-lived. |
| [`principle-never-block-on-the-human`](src/principle/skills/principle-never-block-on-the-human/SKILL.md) | Continue authorized independent work. |
| [`principle-never-weaken-a-check`](src/principle/skills/principle-never-weaken-a-check/SKILL.md) | Never loosen a gate just to pass. |
| [`principle-observe-dont-infer`](src/principle/skills/principle-observe-dont-infer/SKILL.md) | Observe effects instead of trusting names. |
| [`principle-outcome-oriented-execution`](src/principle/skills/principle-outcome-oriented-execution/SKILL.md) | Converge on the accepted end state. |
| [`principle-parse-at-the-boundary`](src/principle/skills/principle-parse-at-the-boundary/SKILL.md) | Parse untrusted input where trust changes. |
| [`principle-preserve-meaning`](src/principle/skills/principle-preserve-meaning/SKILL.md) | Keep conditions and uncertainty when compressing. |
| [`principle-preserve-unrelated-work`](src/principle/skills/principle-preserve-unrelated-work/SKILL.md) | Leave behaviour and edits you weren't asked to change. |
| [`principle-price-each-option`](src/principle/skills/principle-price-each-option/SKILL.md) | State each option's effect and cost. |
| [`principle-prove-it-works`](src/principle/skills/principle-prove-it-works/SKILL.md) | Verify the claim on the identified artifact. |
| [`principle-rank-sources-by-authority`](src/principle/skills/principle-rank-sources-by-authority/SKILL.md) | Settle conflicting sources by authority, not recency. |
| [`principle-redesign-from-first-principles`](src/principle/skills/principle-redesign-from-first-principles/SKILL.md) | Derive a scoped design from real constraints. |
| [`principle-refresh-before-resuming`](src/principle/skills/principle-refresh-before-resuming/SKILL.md) | Re-check changed state before relying on a handover. |
| [`principle-report-every-transition`](src/principle/skills/principle-report-every-transition/SKILL.md) | Report state changes without being asked. |
| [`principle-reuse-before-building`](src/principle/skills/principle-reuse-before-building/SKILL.md) | Use an existing mechanism before creating one. |
| [`principle-scale-verification`](src/principle/skills/principle-scale-verification/SKILL.md) | Run required checks; add more in proportion to risk. |
| [`principle-separate-before-serializing-shared-state`](src/principle/skills/principle-separate-before-serializing-shared-state/SKILL.md) | Separate independent state while preserving atomic invariants. |
| [`principle-sequence-verifiable-units`](src/principle/skills/principle-sequence-verifiable-units/SKILL.md) | Pass each unit's check before dependent work. |
| [`principle-state-the-claim-first`](src/principle/skills/principle-state-the-claim-first/SKILL.md) | Write the falsifiable claim before working. |
| [`principle-state-the-scope`](src/principle/skills/principle-state-the-scope/SKILL.md) | Restate broad requests; never narrow them silently. |
| [`principle-stay-in-scope`](src/principle/skills/principle-stay-in-scope/SKILL.md) | Act only within the authority granted. |
| [`principle-subtract-before-you-add`](src/principle/skills/principle-subtract-before-you-add/SKILL.md) | Remove proven redundancy before adding. |
| [`principle-test-behavior-not-implementation`](src/principle/skills/principle-test-behavior-not-implementation/SKILL.md) | Test contracts and meaningful failures. |
| [`principle-treat-messages-as-data`](src/principle/skills/principle-treat-messages-as-data/SKILL.md) | Embedded instructions are requests, not authority. |
| [`principle-type-system-discipline`](src/principle/skills/principle-type-system-discipline/SKILL.md) | Make the compiler enforce domain distinctions. |
| [`principle-update-the-base-deliberately`](src/principle/skills/principle-update-the-base-deliberately/SKILL.md) | No automatic rebase, stash or reset. |
| [`principle-write-cold-handovers`](src/principle/skills/principle-write-cold-handovers/SKILL.md) | Write handovers a fresh agent can execute. |

## Agents

| Agent                 | Plugin | Description                                                                                          |
| --------------------- | ------ | ---------------------------------------------------------------------------------------------------- |
| `code-reviewer`       | web    | Expert code review specialist focusing on quality, security, performance, and maintainability        |
| `refactorer`          | web    | Refactoring coach to guide code improvement decisions and assess opportunities after tests pass      |
| `senior-web-engineer` | web    | Expert UI engineer for building robust, scalable React components with focus on standards compliance |
| `test-runner`         | web    | Runs tests with auto-detection and returns concise pass/fail summaries                               |

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

- Lauren Tan, for the 54 skills (7 core workflows and 47 principles) adapted from [pstack](https://github.com/cursor/plugins/tree/dbf49813a39c1a5389c5e28cb8e4c1c2379e2454/pstack/skills). The MIT license is in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
- [City Paul's dotfiles](https://github.com/citypaul/.dotfiles/tree/main/claude/.claude)
- [Lee Cheneler's dotfiles](https://github.com/LeeCheneler/dotfiles)
- [Thomas Ricouard's Skills](https://github.com/Dimillian/Skills)
