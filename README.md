# Development Skills

Reusable skills, agents and plugin bundles for software development and personal productivity. They work with Codex, Claude Code and OMP. All three harnesses load the same skill directories under `src/`. Each harness manages its own plugin discovery, tool access and installation.

To choose a skill for a task, go to [When to use the main skills](#when-to-use-the-main-skills).

## Install with Codex

Run these commands in your shell:

```bash
codex plugin marketplace add mintuz/skills
codex plugin list --marketplace mintuz-skills --available
codex plugin add core@mintuz-skills
```

To install a different bundle, replace `core` with its name: `web`, `typescript`, `system-design`, `product-management`, `app`, `life` or `principle`.

To install from the ChatGPT desktop app:

1. Add the marketplace.
2. Restart the app.
3. Open the Plugins Directory and choose **Mintuz Skills**.
4. Install the bundles that you need.

## Install with Claude Code

Run these commands inside Claude Code:

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

## Install with OMP

Add the marketplace before you install a plugin, so that OMP resolves `name@mintuz-skills` as a catalogue entry. Install only the bundles that you need. Run these commands in your shell:

```bash
omp plugin marketplace add mintuz/skills
omp plugin discover mintuz-skills
omp plugin install core@mintuz-skills
omp plugin install web@mintuz-skills
omp plugin install typescript@mintuz-skills
omp plugin install system-design@mintuz-skills
omp plugin install product-management@mintuz-skills
omp plugin install app@mintuz-skills
omp plugin install life@mintuz-skills
omp plugin install principle@mintuz-skills
```

The default scope is `user`, which makes a plugin available across projects. To limit discovery to one Git project, run the install command inside that project and add `--scope project`. Project scope is not a security sandbox.

You can also install from an OMP session:

```text
/marketplace add mintuz/skills
/marketplace discover mintuz-skills
/marketplace install --scope project core@mintuz-skills
/reload-plugins
```

If a session is already running, run `/reload-plugins` after installation. Restart OMP if a plugin adds executable tools, hooks or extension modules.

To update installed plugins, refresh the catalogue first, then upgrade each plugin:

```bash
omp plugin marketplace update mintuz-skills
omp plugin upgrade core@mintuz-skills
```

OMP uses this repository's explicit `.omp-plugin/marketplace.json` catalogue. Each plugin also includes `.omp-plugin/plugin.json` metadata that matches the Claude Code and Codex directory layout. See the [OMP marketplace documentation](https://omp.sh/docs/marketplace).

## Call a skill

Each harness calls a skill by name with a different syntax. The examples in this README use unqualified skill names. For a Claude Code plugin installation, add the bundle prefix.

| Harness | Syntax | Example |
| --- | --- | --- |
| Claude Code plugin | `/plugin:name` | `/core:reducer` |
| OMP | `/skill:name` | `/skill:reducer` |
| Codex | `$name` | `$reducer` |

## When to use the main skills

This section covers the entry points and the skills that I use every day. The [Skills](#skills) tables list every other skill. The example prompts come from real Claude Code and OMP sessions, with project names and links replaced by placeholders.

### Pick a skill

| Situation | Skill |
| --- | --- |
| A task needs a full workflow: review, bug fix, spec, implementation, design | [`adam-mode`](src/core/skills/adam-mode/SKILL.md) |
| An open "which approach?" question needs an experiment before the real build | [`adam-mode`](src/core/skills/adam-mode/SKILL.md) Prototype (spike) playbook |
| One artifact must reach a high, confirmed bar over several rounds | [`gauntlet-loop`](src/core/skills/gauntlet-loop/SKILL.md) |
| One artifact can take several shapes, and you want them judged in one pass | [`arena`](src/core/skills/arena/SKILL.md) |
| The look of a UI concept is open, and the variants must differ | [`creative-seed`](src/core/skills/creative-seed/SKILL.md) |
| Existing code or a system has more moving parts than its behaviour needs | [`reducer`](src/core/skills/reducer/SKILL.md) |
| New work must stay at the minimum that the requirement needs | [`yagni`](src/core/skills/yagni/SKILL.md) |
| You need to know what the code does now | [`how`](src/core/skills/how/SKILL.md) |
| You need to know why the code exists in its current form | [`why`](src/core/skills/why/SKILL.md) |

### `adam-mode`

`adam-mode` is the main entry point. It is manual-only, so call it by name. It matches the request to a playbook, loads the skills that the playbook needs, delegates to `adam-agent` and proves the result before it reports.

It continues without asking on reversible work, such as branches, commits, PRs and CI repair. It stops before a merge, the auto-merge label, a force-push, a data deletion or a message to a person, unless you asked for that action in the session.

| Request | Playbook |
| --- | --- |
| "Review this PR" | Review |
| "Implement spec 013" or "Make the fixes that you recommended" | Implement |
| "I have received a bug report" | Bug fix |
| "How does…", "Why does…", "Explain…" or "Are you sure?" | Investigate |
| "Redesign this from first principles with fewer moving parts" | Rethink |
| "Make this faster" | Perf |
| "Continue, my device crashed" | Resume |
| "Spike this" or "Prototype this" | Prototype |
| "The disk is full" or "Remove old worktrees" | Disk |
| "Make this match the mock-up" | Match design |
| "Write a spec" or "Create visual Given/When/Thens for this spec" | Spec |
| "Make this screen world class" | Design loop |
| "Make CI go green" | Ship |

```text
/adam-mode Review this PR: <PR URL>. Restate what we are trying to achieve, then consider the solution from first principles. Optimise for simplicity and reduced complexity.
/adam-mode I have received a bug report. Validate that it is a real issue, diagnose it and suggest a fix. [screenshot]
/adam-mode Create visual Given/When/Thens for this spec: <PR URL>
/adam-mode Start the implementation of spec 013. Optimise for simplicity and reduced complexity.
/adam-mode Make CI go green and add the auto-merge label.
```

### Prototype (spike)

Prototype is a playbook in `adam-mode`, not a separate skill. "Spike" and "prototype" start the same playbook. Use it when a library choice, a layout, a feature, a product or a bug fix has more than one possible approach, and an experiment can settle the choice. The output is a decision and its evidence. The prototype code is throwaway and never ships.

- One open decision gets labelled variants behind one switcher, inside the running app.
- Several open questions get whole versions. `arena` builds and judges them, and short `gauntlet-loop` rounds improve the chosen base. The result is a keep list for the real build.

Do not use it when the spec already fixes the approach. For a bug, confirm the root cause first: a prototype compares fixes, not causes.

```text
/adam-mode Spike a solution for this and give me code examples. It must work with our existing auto-layout algorithm.
/adam-mode I have a prototype in main. Build another prototype on top of it as a Tauri app.
/adam-mode Continue the spec generation. Consider the architecture, spike the hard parts and put the implementation details in the spec.
```

### `gauntlet-loop`

Use `gauntlet-loop` when one artifact must reach a high bar and you expect several rounds: a screen, a flow, a visual language, a document or a system check. Separate builders make each round. A fresh critic gives each round a verdict of WIN, LOSE or UNJUDGEABLE against the bar.

The skill asks you to confirm the bar before round 1. Give it something that a critic can inspect: a screenshot, a production URL, a reference app, Mobbin screens or a checkable condition. "World class" alone is not a bar; the skill turns it into concrete criteria for you to confirm.

Do not use it for routine changes that have clear acceptance tests, or to choose between different shapes in one pass (use `arena`).

```text
/gauntlet-loop Redesign the History view. It must be glanceable and show what a user wants to know about past sessions. Use Mobbin for inspiration.
The spacing, line height and padding of the Insights tab need polish. The screenshot shows where it is cluttered. Use /gauntlet-loop and Mobbin.
The site layout looks broken compared to production at <URL>. Use /gauntlet-loop with production and Mobbin as references to redesign it.
Do the previous task with /gauntlet-loop. The WIN is when every contradiction is removed or updated.
```

### `arena`

Use `arena` when a non-trivial artifact can take several shapes, and a single first attempt would lock in one shape: an interface, a module design, a prompt, a document or a visual direction. It produces two or more independent candidates, judges them against one rubric, picks a base and grafts the best parts of the others into it. `architect`, the Prototype playbook and the Design loop playbook all use `arena`.

Do not use it for a task with one obvious answer, or to raise one artifact to a bar over several rounds (use `gauntlet-loop`).

```text
Use /arena to draft three shapes of the CSV import API. Judge them on caller simplicity, error handling and testability, then graft the best parts into one.
Use /arena with three candidates for the onboarding copy. Rubric: plain UK English, under 40 words, no jargon.
/architect the sync module before we build it.
```

`arena` and `gauntlet-loop` answer different questions. Use `arena` first when the direction is open, then `gauntlet-loop` to raise the chosen direction to the bar.

| | `arena` | `gauntlet-loop` |
| --- | --- | --- |
| Question | Which shape is best? | Is this shape good enough yet? |
| Passes | One | Repeated rounds, until the evidence supports a stop |
| Input | The task, shared paths and a rubric | One artifact and a bar that you confirm |
| Output | One synthesised artifact and a synthesis note | One artifact, with a verdict for each round |

### `creative-seed`

Use `creative-seed` when you ask for UI concepts, prototype designs or exploratory visual variants whose look is open. Each variant gets a label, for example `settings-concept/B`. A script turns the label into a long string of letters and digits. The agent reads patterns in the string and derives the colour scheme, layout and typography from them. The design never shows the string. The same label always gives the same string, so you can regenerate a direction later.

Do not use it to match an agreed mock-up, or in repair rounds on a design that you already picked. Those rounds keep the pinned direction.

```text
Build three concepts for the settings screen. Use /creative-seed to set the direction of each concept.
I like concept B, but not its colours. Reroll concept B with /creative-seed.
```

A reroll keeps the label and adds a number, for example `settings-concept/B/2`.

### `reducer`

Use `reducer` when an existing system, feature or PR has more moving parts than its behaviour needs: branches, state, dependencies, layers or hand-written scripts. It records every supported behaviour in a behaviour ledger, derives the minimum mechanism from first principles and proves that the behaviour does not change. It can diagnose only (a design with no edits) or implement the change in reversible slices.

Do not use it to remove features. Removing a supported behaviour is a scope change that needs an owner decision.

```text
Use /reducer on the changes that we have made.
This repo provisions my machines with make, Ansible, shell scripts and Homebrew. Go back to first principles. How can I reduce the number of moving parts?
/speckit-plan Use /reducer to find code and patterns that we can reuse instead of building new ones.
```

### `yagni`

Use `yagni` when you change production code, especially when you implement a spec or a user story. Before it executes, it states a minimal plan: the goal, the non-goals, the acceptance criteria and what stays untouched. It writes the failing test first. It asks for a missing requirement and does not guess it.

Do not use it to remove complexity from existing code (use `reducer`). `yagni` stops new complexity; `reducer` removes complexity that is already there. Load both for most implementation and review work.

```text
Implement spec 002 on a new branch against ios27. Use speckit, /yagni, /swiftui-architecture and /app-intent-driven-development.
Review the architecture of the changes that we have made. Use /yagni and /reducer. Look for ways to reduce and flatten complexity and deepen modules. More code is not always better.
```

### `how` and `why`

Use `how` to explain what the code does now: the execution path and the owner of each piece of state. Use `why` to recover the reason that the code exists in its current form. `why` labels each finding as fact, inference or unknown. Both skills are read-only. `teach` combines them into one plain explanation.

```text
/how does XState connect to the new CanvasSurface?
/how What is the live-channel feature and how does it work? Give code examples with /pseudocode and sequence diagrams.
/why does this custom Python and shell code exist? I want to know if we can remove it and use a framework or tool instead.
/why did we remove that rule? Was a test deleted?
```

### Combined examples

**Review, fix and ship a PR.** `adam-mode` runs the Review, Implement and Ship playbooks in order. Review and Implement use `yagni` and `reducer`; Ship uses `ship-pr` and `babysit`.

```text
/adam-mode Do a deep review of <PR URL>. Look for ways to reduce and flatten complexity. Look for scope creep, features built outside the spec and features deleted without approval. Use /yagni, /reducer, /react, /xstate and /tailwind.
/adam-mode Make the fixes that you recommended.
/adam-mode Make CI go green and add the auto-merge label.
```

**Implement a spec with one sub-agent for each user story.** `yagni` keeps each story to its minimum and `reducer` keeps the integrated result flat.

```text
/goal Implement spec 540 on a new branch as a single PR. Act as coordinator: spawn one sub-agent for each user story and integrate its work. Use /yagni, /reducer, /react, /xstate and /tailwind. After the last story, review the full implementation.
```

**Redesign a screen.** `adam-mode` runs the Design loop playbook. Round 1 runs through `arena`, and `creative-seed` sets the direction of each variant. From round 2, `gauntlet-loop` improves only the chosen base until a fresh critic gives a WIN.

```mermaid
flowchart LR
  A[Confirm the bar<br/>and references] --> B[arena: 2-3 variants<br/>each from creative-seed]
  B --> C[Judge picks a base<br/>and grafts the best parts]
  C --> D[gauntlet-loop rounds<br/>on the base only]
  D -->|LOSE| D
  D -->|WIN| E[Hand over or ship]
```

```text
/adam-mode The site layout looks broken compared to production at <URL>. Use /gauntlet-loop with production and Mobbin as references to redesign it.
```

**Spike a new platform feature.** `adam-mode` runs the Prototype playbook. `arena` builds the variants, `creative-seed` sets their look, and `gauntlet-loop` improves the base. The output is a decision document, not shippable code.

```text
/adam-mode The iPhone Duo is coming out. Read the documentation on how to support it, spike the solution, and use /gauntlet-loop with Mobbin to build different UI variants. Write a document of what we should change, with screenshots of the variants.
```

**Understand, then simplify.** Use `how` for the current behaviour, `why` for the reason behind it and `reducer` for the smaller design. Add `blast-radius` to see what a change can break.

```text
/how What does the new useEffect in <file> do?
/why does it exist, and what are the alternatives? Use /blast-radius for each alternative.
/reducer Can we remove it without a change in behaviour?
```

## Verification workflow

Keep requirements, executable checks and runtime evidence distinct:

- Use `create-verification-skill` once to record a project's launch, doctor, drive, evidence and cleanup procedures. Use `maintain-verification-skill` to keep that bundle and its host discovery entries accurate.
- Use `tdd` with the relevant authoring skill: `frontend-testing`, `react-testing`, `browser-testing`, `swift-testing` or `xcuitest`.
- Use the generated `verify-<project>` recipe to run existing checks and exercise real user journeys. Link existing BDD scenarios and test cases instead of copying their expectations into another specification.
- Use `visual-feedback` for interactive visual comparison, `acceptance-review` for requirement satisfaction, and `double-check` for a separate reviewer. None of them replaces machine-checked assertions.

Use existing runners and structured reports for repeatable assertions. Record the required checks before execution, keep failed attempts, and report blocked or unrun checks as gaps. A passing browser or simulator journey does not prove physical-device, accessibility or security coverage. Non-UI XCTest authoring still uses the project's existing XCTest conventions; do not force a migration to Swift Testing.

### iOS skill owners

For iOS work, keep these owners separate:

| Skill | Owns | Hands off |
| --- | --- | --- |
| `debug` | Root-cause investigation of build/runtime identity, state, storage, lifecycle or crash faults | Rendering-only defects and agreed visual iteration to `visual-feedback`; execution to `xcode-dev-loop` |
| `xcode-dev-loop` | Toolchain, build/install/run/capture mechanics and native result inspection | Test authorship and visual judgement |
| `xcuitest` | UI-test actions, fixtures, waits and assertions | Exact cases, preconditions and proof requirements to the execution owner; unexplained behavioural failures with all attempt evidence to `debug` |
| `visual-feedback` | Actual image inspection, visual diagnosis and equivalent before/after review in web or iOS | Apple execution to `xcode-dev-loop`; broader iOS build/runtime identity, state, storage, lifecycle or crash faults to `debug` |

Keep one execution owner at a time. Request controlled experiments through that owner; do not start a parallel simulator driver. Keep brief safety and evidence rules in each skill. If an optional companion skill is absent, use the project's documented commands. Core visual feedback keeps a standalone capture fallback.

### Project verification bundles

Each project has one canonical recipe bundle, not three authored versions. Follow the project's convention. If the project has no convention, use `.agents/skills` with a Claude project-directory link, and add an OMP native link only when needed. Maintain every declared discovery entry. Prove loading and representative cold replay separately in each claimed host and target platform.

The [verification evidence record](evals/verification-skillset-native-results.json) separates treatment gates, advisory comparisons, activation checks and native runtime proof. It records the blocked native Claude replay and the limits of each web and iOS fixture. Filesystem parity alone is not host runtime proof.

## Plugins

| Plugin | Description |
| --- | --- |
| **core** | Core workflows: commits, learning, code review, prompts, PRs, writing, and persistent memory |
| **web** | Web development with CSS, React, Tailwind, TDD, testing, and design patterns |
| **typescript** | TypeScript strict mode, schema-first development, and best practices |
| **system-design** | Architecture visualisation with Mermaid diagrams |
| **product-management** | PRDs, task management with Task Master MCP, decision tracing, and status updates |
| **app** | Swift iOS development with App Intents, Swift Testing, and SwiftUI architecture |
| **principle** | Independent engineering principles, each invoked for a specific decision |
| **life** | Personal life management with the GPS method for goal achievement |

## Skills

### Core

| Skill | Description |
| --- | --- |
| [`acceptance-review`](src/core/skills/acceptance-review/SKILL.md) | Verify implementation against an authoritative contract with an explicit verdict |
| [`commit-messages`](src/core/skills/commit-messages/SKILL.md) | Conventional commit messages that explain the "why" not just the "what" |
| [`yagni`](src/core/skills/yagni/SKILL.md) | Minimum sufficient execution, scope boundaries, TDD, and documentation practices |
| [`gauntlet-loop`](src/core/skills/gauntlet-loop/SKILL.md) | Improve ambitious artifacts against a concrete bar using separate builders and fresh critics |
| [`graph-engineering`](src/core/skills/graph-engineering/SKILL.md) | Orchestrate interdependent specs and stories as a contract-first execution graph with a verifier per node |
| [`record-lesson`](src/core/skills/record-lesson/SKILL.md) | Record a verified project lesson as the smallest rule in AGENTS.md or CLAUDE.md |
| [`pr`](src/core/skills/pr/SKILL.md) | PR descriptions, sizing, and creation with gh CLI |
| [`pseudocode`](src/core/skills/pseudocode/SKILL.md) | Render module boundaries, signatures, arguments, and a cited call graph for existing or planned code |
| [`reducer`](src/core/skills/reducer/SKILL.md) | First-principles system simplification with behavioural equivalence proofs |
| [`ship-pr`](src/core/skills/ship-pr/SKILL.md) | Commit, publish, repair, and monitor a GitHub pull request through merge |
| [`writing-for-agents`](src/core/skills/writing-for-agents/SKILL.md) | Concise agent handovers and skill instructions that preserve scope, evidence and completion conditions |
| [`writing-for-humans`](src/core/skills/writing-for-humans/SKILL.md) | Draft, edit and review human prose with contextual word bans, medium-specific voice and factual safeguards |
| [`wtf`](src/core/skills/wtf/SKILL.md) | Re-explain an unclear response in plain, precise UK English |
| [`create-verification-skill`](src/core/skills/create-verification-skill/SKILL.md) | Create and cold-replay a shared project verification bundle with indexed coverage |
| [`maintain-verification-skill`](src/core/skills/maintain-verification-skill/SKILL.md) | Repair verification recipes and harness discovery without changing product expectations |
| [`visual-feedback`](src/core/skills/visual-feedback/SKILL.md) | Reproduce and compare visual states in web and iOS applications |
| [`tdd`](src/core/skills/tdd/SKILL.md) | Framework-neutral Red-Green-Refactor workflow with explicit evidence |
| [`blast-radius`](src/core/skills/blast-radius/SKILL.md) | Trace material change risks and decisive checks |
| [`double-check`](src/core/skills/double-check/SKILL.md) | Second opinion from a fresh reviewer, ideally on another provider; findings close only on evidence |
| [`how`](src/core/skills/how/SKILL.md) | Explain the current execution path and state ownership |
| [`why`](src/core/skills/why/SKILL.md) | Recover rationale while separating fact, inference and unknown |
| [`benchmark-checklist`](src/core/skills/benchmark-checklist/SKILL.md) | Check measurement correctness, repeatability and interpretation |
| [`correct`](src/core/skills/correct/SKILL.md) | Turn recurring enforceable mistakes into verified structural guards |
| [`recall`](src/core/skills/recall/SKILL.md) | Recover bounded past context and reconcile it with current evidence |
| [`adam-mode`](src/core/skills/adam-mode/SKILL.md) | Manual-only. Route a task to Adam's playbooks, principles and skills, and delegate through `adam-agent` |
| [`teach`](src/core/skills/teach/SKILL.md) | Manual-only. Explain a change or subsystem plainly, using `how` and `why`, at the reader's pace |
| [`architect`](src/core/skills/architect/SKILL.md) | Sketch types, signatures and modules through `arena`, then implement against the agreed sketch |
| [`arena`](src/core/skills/arena/SKILL.md) | Run independent attempts at one task, judge them on a rubric, pick a base and graft the best parts |
| [`sharpen`](src/core/skills/sharpen/SKILL.md) | Manual-only. Make a task deeper, not bigger, then rewrite the prompt |
| [`in-your-own-words`](src/core/skills/in-your-own-words/SKILL.md) | Manual-only. Restate the user's goals and the problem they are trying to solve |
| [`creative-seed`](src/core/skills/creative-seed/SKILL.md) | Derive each UI concept's creative direction from a deterministic seed string that the design never shows |

`writing-for-agents` covers cross-agent messages, agent instructions, and the creation or update of skills. It removes repeated instructions and filler without dropping operational constraints.

`writing-for-humans` covers articles, documentation, messages, marketing and UI text. It also improves the prose in PRs and commits without replacing their format rules. It drafts from sufficient source material, keeps useful voice, and applies default word bans with exceptions for accurate terms, quotations, code and names. It repeats its editorial checks until they pass; a justified exception counts as a pass.

The `writing-for-humans` [behavioural suite](evals/writing-for-humans/promptfooconfig.yaml) compares the skill against no skill. Its [activation suite](evals/writing-for-humans/trigger.promptfooconfig.yaml) checks discovery, specialist format owners and the `adam-mode` investigation caller.

### Web

| Skill | Description |
| --- | --- |
| [`css`](src/web/skills/css/SKILL.md) | CSS best practices for maintainable, scalable styles |
| [`react`](src/web/skills/react/SKILL.md) | Production-ready React architecture and patterns |
| [`xstate`](src/web/skills/xstate/SKILL.md) | Typed XState actor lifecycles with legal Mermaid statechart visualisation |
| [`react-testing`](src/web/skills/react-testing/SKILL.md) | React Testing Library patterns for components, hooks, and context |
| [`frontend-testing`](src/web/skills/frontend-testing/SKILL.md) | DOM Testing Library patterns for behaviour-driven UI testing |
| [`refactoring`](src/web/skills/refactoring/SKILL.md) | Refactoring assessment and patterns after tests pass |
| [`web-design`](src/web/skills/web-design/SKILL.md) | Visual hierarchy, spacing, typography, and UI polish |
| [`tailwind`](src/web/skills/tailwind/SKILL.md) | Design systems with Tailwind CSS, design tokens, and component libraries |
| [`browser-testing`](src/web/skills/browser-testing/SKILL.md) | Author real-browser tests and controlled screenshot comparisons with the project's runner |
| [`chatgpt-app-sdk`](src/web/skills/chatgpt-app-sdk/SKILL.md) | Build ChatGPT apps using OpenAI Apps SDK and MCP with conversational UX |

### App

| Skill | Description |
| --- | --- |
| [`swift-testing`](src/app/skills/swift-testing/SKILL.md) | Swift Testing framework: @Test macros, #expect/#require patterns |
| [`xcuitest`](src/app/skills/xcuitest/SKILL.md) | Author XCTest UI automation with controlled fixtures, public interactions and lifecycle proof |
| [`app-intent-driven-development`](src/app/skills/app-intent-driven-development/SKILL.md) | Build features as App Intents first for Siri, Shortcuts, widgets, and SwiftUI |
| [`swiftui-architecture`](src/app/skills/swiftui-architecture/SKILL.md) | Modern SwiftUI patterns: @Observable, state management, no ViewModels |
| [`debug`](src/app/skills/debug/SKILL.md) | Structured feedback loop for debugging iOS simulator issues and UI problems |
| [`local-ai-models`](src/app/skills/local-ai-models/SKILL.md) | On-device AI with Foundation Models and MLX Swift: LLMs, VLMs, embeddings, and image generation |
| [`app-store-scraper`](src/app/skills/app-store-scraper/SKILL.md) | Scrape iOS/macOS App Store data using iTunes/App Store APIs |
| [`app-store-keyword-ops`](src/app/skills/app-store-keyword-ops/SKILL.md) | Mine Astro competitor keywords and safely update locale-specific App Store fields |
| [`ios-localize-copy`](src/app/skills/ios-localize-copy/SKILL.md) | Localise iOS and App Store copy across every supported locale |
| [`xcode-dev-loop`](src/app/skills/xcode-dev-loop/SKILL.md) | Canonical xcodebuild build/test/simulator loop: background runs, result reading, screenshots |
| [`asc-screenshots`](src/app/skills/asc-screenshots/SKILL.md) | Upload App Store screenshots and previews through helm-asc: staging, locales, verification |

### TypeScript

| Skill | Description |
| --- | --- |
| [`typescript`](src/typescript/skills/typescript/SKILL.md) | Schema-first development, strict typing, functional patterns, and Zod |

### Life

| Skill | Description |
| --- | --- |
| [`gps-method`](src/life/skills/gps-method/SKILL.md) | Evidence-based goal achievement framework using Goal, Plan, and System methodology |

### System design

| Skill | Description |
| --- | --- |
| [`mermaid-generator`](src/system-design/skills/mermaid-generator/SKILL.md) | Generate Mermaid diagrams from code to visualise architecture and relationships |

### Product management

| Skill | Description |
| --- | --- |
| [`decision-trace`](src/product-management/skills/decision-trace/SKILL.md) | Trace claimed decisions from source evidence through delivery artifacts |
| [`meeting-to-action-brief`](src/product-management/skills/meeting-to-action-brief/SKILL.md) | Turn meeting evidence into a concise decision and action brief |
| [`status-updates`](src/product-management/skills/status-updates/SKILL.md) | Team updates and stakeholder comms with scannable structure and honest tone |
| [`story-pr-orchestrator`](src/product-management/skills/story-pr-orchestrator/SKILL.md) | Coordinate dependency-gated stories through isolated pull requests |
| [`design-handover`](src/product-management/skills/design-handover/SKILL.md) | Explicitly transfer accepted behaviour, matching visuals, authority and durable assets |

## Principles

Each principle is an independent skill under `src/principle/skills/`, with its full `principle-*` name. Invoke the one that is relevant to the decision. No router or global principle mode is required.

| Skill | Focus |
| --- | --- |
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
| [`principle-never-block-on-the-human`](src/principle/skills/principle-never-block-on-the-human/SKILL.md) | Continue authorised independent work. |
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

| Agent | Plugin | Description |
| --- | --- | --- |
| [`adam-agent`](src/core/agents/adam-agent.md) | core | Delegate for an `/adam-mode` run that reads the `adam-mode` skill in full before any work |
| [`code-reviewer`](src/web/agents/code-reviewer.md) | web | Code review specialist focusing on quality, security, performance, and maintainability |
| [`refactorer`](src/web/agents/refactorer.md) | web | Refactoring coach to guide code improvement decisions and assess opportunities after tests pass |
| [`senior-web-engineer`](src/web/agents/senior-web-engineer.md) | web | UI engineer for React components, with a focus on maintainability, user experience and web standards compliance |
| [`test-runner`](src/web/agents/test-runner.md) | web | Runs tests with auto-detection and returns concise pass/fail summaries |

## MCP integrations

Some plugins include Model Context Protocol (MCP) server configurations:

- **core**: Memory MCP for persistent knowledge storage across sessions
- **web**: Playwright MCP for browser automation and visual checks
- **product-management**: Task Master MCP for task management workflows
- **app**: XcodeBuildMCP and iOS Simulator MCP for app development workflows

## Other ways to install skills

The marketplace installations above are the normal plugin path. Use the scripts in this section only when you want standalone skills instead.

Use one authoritative distribution per skill name. Do not install both a plugin bundle and a standalone copy of the same skill.

### Standalone skill loaders and Codex CLI

`scripts/codex-sync.go` copies complete `SKILL.md` bundles, including their references, into flat directories. Despite its name, it does not translate the instructions into a Codex-only format. For skills listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md), it also copies that file, so the MIT notice travels with the bundle.

Leave `--prefix` off to keep names such as `principle-prove-it-works`. Run the script from the repository root:

```bash
# Copy all skills to ~/.codex/skills (user level, the default)
go run scripts/codex-sync.go

# Copy all skills to .codex/skills in the current project (project level)
go run scripts/codex-sync.go --project

# Copy all skills to another directory
go run scripts/codex-sync.go --output /path/to/your/skills
```

For a harness other than Codex CLI, point its skill discovery at the output directory, or copy the directory into the harness's documented skill location. In Codex CLI, call a synced skill with `$skill-name`, for example `$commit-messages` or `$react`.

See [scripts/README.md](scripts/README.md) for more options, including skill name prefixes and dry-run mode.

### Claude web

The `.dist` folder contains one zip file for each skill, ready to upload to Claude web (claude.ai). You can upload each zip file independently.

1. To regenerate the zip files, run the packaging script from the repository root:

   ```bash
   go run scripts/package-skills.go
   ```

   The script creates files such as `.dist/commit-messages.zip`, `.dist/react.zip` and `.dist/swift-testing.zip`.

2. Go to [claude.ai](https://claude.ai).
3. Open the skills section.
4. Upload the zip files that you need from `.dist`.

The uploaded skills are then available in your Claude web conversations. See [scripts/README.md](scripts/README.md) for more options, including custom output directories and skill name prefixes.

## Upgrade notes

### Core 4.0: `writing` is now `writing-for-humans`

Core 4.0 replaces `writing` with `writing-for-humans`. There is no alias, and the old fixed formatting rules are retired.

1. Update saved prompts and external skill references to the new name. In Claude Code, use `/core:writing-for-humans`. In OMP, use `/skill:writing-for-humans`. In Codex, use `$writing-for-humans`.
2. For standalone copies, remove the installed `writing` skill before you sync or upload `writing-for-humans`. Copying the new skill does not remove the old one.

### Web 2.x: `eyes` and `tdd` move to core

`visual-feedback` replaces `web:eyes`, and `core:tdd` replaces `web:tdd`. No compatibility copies remain in the web plugin. When you upgrade from `web` 1.x to 2.x, install or update `core`.

For standalone installations, keep unrelated user-authored skills. The copier does not prune retired skill directories, so remove only the known old web-plugin copies:

- Without `--prefix`: remove `eyes`, and replace the `tdd` bundle in full.
- With `--prefix`: remove `web-eyes` and `web-tdd`, then install `core-tdd`.

## Plugin metadata and validation

A marketplace catalogue lives at the repository root. Each plugin has a manifest inside its own `src/<plugin>/` directory, not another marketplace.

| Harness | Root catalogue | Per-plugin manifest |
| --- | --- | --- |
| Codex | `.agents/plugins/marketplace.json` | `.codex-plugin/plugin.json` |
| Claude Code | `.claude-plugin/marketplace.json` | `.claude-plugin/plugin.json` |
| OMP | `.omp-plugin/marketplace.json` | `.omp-plugin/plugin.json` |

Keep the OMP catalogue and manifests identical to their Claude Code copies. OMP prefers its own catalogue over the Claude Code fallback. Its runtime discovers the conventional component directories and uses the compatible Claude Code metadata where needed, so keep both sets of manifests.

After you change a plugin:

1. Set the same version in all three of its manifests.
2. Set that `version` on its Claude Code and OMP catalogue entries, so that OMP can detect available upgrades.
3. Keep the plugin names and source paths aligned in all three catalogues.
4. Run the repository metadata check. It makes no model calls and does not change host configuration:

   ```bash
   pnpm check:plugins
   ```

The check covers plugin and skill inventories, source paths, repository URLs, versions and MCP configuration paths. It does not execute skills or start MCP servers. Before you publish, also validate and install through the target harness.

## Licence notices

Required third-party copyright and licence notices are in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Let's connect

[![Twitter](https://img.shields.io/badge/twitter-blue.svg?&style=for-the-badge&logo=twitter&logoColor=white)](https://x.com/mintuz)
[![My LinkedIn profile](https://img.shields.io/badge/linkedin-%230077B5.svg?&style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/adambulmer)
