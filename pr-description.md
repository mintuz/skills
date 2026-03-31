Hey @mintuz 👋

I ran your skills through `tessl skill review` at work and found some targeted improvements. Here's the full before/after:

![score_card](./score_card.png)

| Skill | Before | After | Change |
|-------|--------|-------|--------|
| react | 63% | 100% | +37% |
| typescript | 75% | 95% | +20% |
| tdd | 78% | 94% | +16% |
| swift-testing | 76% | 90% | +14% |
| commit-messages | 86% | 90% | +4% |

<details>
<summary>Changes made</summary>

**Description improvements (biggest impact):**
- **react**: Rewrote from category labels to concrete actions (creates feature-based folder structures, implements hooks/state management with React Query/Zustand, builds API integration layers), added explicit trigger terms (JSX/TSX, hooks) and NOT clause for non-React frontends
- **typescript**: Added specific capabilities (generates schema-first validation with z.infer, creates discriminated unions and branded types, defines type guards), added .ts/.tsx file extensions and Zod as trigger terms
- **tdd**: Expanded trigger terms to include "test-driven development", added concrete actions (writes failing test cases, implements minimal passing code, uses factory functions), added "retrofitting tests" to exclusion clause
- **swift-testing**: Added missing "what" capabilities (@Test functions, #expect/#require assertions, #expect(throws:) validation, @Suite structuring), expanded NOT clause to include Objective-C tests
- **commit-messages**: Added concrete actions (analyzes diffs, formats type(scope): subject lines, assesses commit scope for splitting)

**Content improvements:**
- **react**: Removed redundant "When to Use Each Guide" section (duplicated the Quick Reference table), added a canonical feature module directory layout and executable schema-first API pattern with Zod + React Query
- **typescript**: Removed redundant "When to Use Each Guide" section, added inline schema-first pattern example with branded types and z.infer
- **tdd**: Removed redundant "When to Use Each Guide" section, added inline Red-Green-Refactor code example (discount calculation with factory function)
- **swift-testing**: Trimmed unnecessary "Works alongside XCTest" bullet from Core Concepts
- **commit-messages**: Removed "When to Use" and "Philosophy" sections (content Claude already knows)

</details>

Honest disclosure — I work at @tesslio where we build tooling around skills like these. Not a pitch - just saw room for improvement and wanted to contribute.

Want to self-improve your skills? Just point your agent (Claude Code, Codex, etc.) at [this Tessl guide](https://docs.tessl.io/evaluate/optimize-a-skill-using-best-practices) and ask it to optimize your skill. Ping me - [@yogesh-tessl](https://github.com/yogesh-tessl) - if you hit any snags.

Thanks in advance 🙏
