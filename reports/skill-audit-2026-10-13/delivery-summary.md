# Portable development skills: delivery and validation

This batch adds 32 skills: seven core workflow ports, manual `design-handover`, and 24 independent `principle-*` skills in `src/principle/skills/`. The entrypoints are provider-neutral; harness-specific discovery metadata stays separate. No router or compatibility aliases are added.

The 31 pstack ports (7 core workflows and 24 principles) keep Lauren Tan's MIT notice in [THIRD_PARTY_NOTICES.md](../../THIRD_PARTY_NOTICES.md). Their SKILL.md entrypoints shrink from **10,726 to 6,689 words (37.6%)**, including frontmatter; original design-handover adds 309 words. This measures wording, not model tokens or runtime performance.

Core is 2.1.0, product-management 1.8.0 and the new principle plugin 1.0.0 in both manifests. Both registries include all additions. Eight plugins now contain 74 source skills and 72 registered skills; pre-existing refactoring/tailwind registration omissions remain unchanged.

## Validation

| Check | Result |
|---|---|
| Promptfoo configuration | Both configs validated for all 32 additions. |
| Workflow treatments | 35/35; conservative baseline 20/35. [Details](workflow-validation.md). |
| Principle treatments | 48/48; baseline 34/48. [Details](principle-validation.md). |
| Trigger diagnostics | Workflows 23/23; principles 47/49, with two documented instrumentation/grading flags. |
| Runner regression tests | `node --test scripts/run-skill-evals.test.mjs`: 11/11 pass. |
| Native loaders | All 32 additions exercised through Claude and OMP, with source hashes and representative hypothetical scenarios. |
| Packaging | 72 ZIPs and 72 flat bundles; all 32 new bundles matched source bytes. Per-skill LICENSE copies are gone; packagers attach THIRD_PARTY_NOTICES.md to each derived bundle. |
| Independent source review | Four fresh-context Claude Sonnet Medium rounds; no outstanding source findings. |

Total: **83/83 treatment cases**, versus a conservative **54/83 no-skill baseline**: 29 improved cases and no observed final regression. These are single-trial synthetic instruction tests. They do not establish statistical generality, product-runtime behavior, exhaustive harness portability or live installation.

Preservation ports that already passed before editing or tied the baseline were explicitly accepted for this batch. Their missing RED/gain remains recorded; the repository's general TDD policy is unchanged. Provider errors and invalid grader demands remain in evidence but do not count as behavioral RED.

Native tests used explicit invocation, generally twelve principles per fresh process, with final laziness replays isolated. A native Claude blast-radius response still inferred unsupplied simulator details. Loading succeeded, but the native behavior sweep is not universally clean.

## Operational boundary

The verification generator produced an executable recipe for one real ZIP-packaging journey. Its authoring run and fresh Codex/OMP replays passed, including source identity, byte comparisons, owned cleanup and preservation of unrelated state. The raw replay JSON is not committed. The execution-specific recipe remains local.

Claude's separate operational replay remains unverified because its Bash permission check blocked the command. Native skill-loading checks are distinct from that replay. No live skills were installed or removed.

This delivery contains only the skills repository. Companion dotfiles architecture repairs and retirements remain local for manual application and are excluded from the counts above. The history-derived audit, private conversation locators and source inventory also remain local; published evidence uses synthetic scenarios.
