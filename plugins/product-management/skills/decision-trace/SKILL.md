---
name: decision-trace
description: WHEN tracing a claimed meeting or transcript decision through specs, issues, PRs, commits, and current code; NOT for summaries, glossaries, or implementation; preserves uncertainty, grades every evidence link, and reports current behavior.
---

# Decision Trace

Treat a claimed decision as an evidence chain from the source record to current behavior. Prove the resolution, each downstream link, and the implementation independently. Keep the trace read-only; finish the report before handing requested changes to an implementation workflow.

## 1. Frame the claim and baseline

Rewrite the claim as one or more testable behaviors without strengthening it. Split behaviors whose implementation status can differ. Record the source scope, relevant repositories, and the branch, commit, or date that defines “current.” Use the available primary source regardless of provider.

**Complete when:** every claimed behavior, the source scope, and the current-code baseline are explicit, with unavailable inputs recorded as gaps.

## 2. Classify the source record

Read the relevant primary-source span from the first claim through its latest qualification, objection, resolution, or superseding statement. Quote only decisive words; attach the speaker, date, and a precise locator. Label each non-quote as paraphrase or inference.

Classify each claim:

| Classification | Required evidence |
|---|---|
| `decision` | An explicit selection, commitment, or resolution settled for a stated scope |
| `proposal` | A suggestion, option, question, or intent without resolution |
| `disagreement` | Incompatible positions remain unresolved |
| `unknown` | Source, context, attribution, authority, or resolution is insufficient |

Prefer a later explicit resolution for its stated scope while preserving the chronology. Rationale supports a classification but does not prove a decision; silence and missing records remain `unknown`.

Grade confidence `high`, `medium`, or `low` in the classification—not in the claimed decision—using source directness, attribution, and relevant-context completeness. Name every reason the grade is below `high`.

**Complete when:** every material supporting and contradictory excerpt is cited, and each claim has one classification, confidence grade, and evidence gap or `none`.

## 3. Grade the downstream links

Follow the chain as far as evidence permits:

`source statement → decision record/spec → issue → PR/commit → current code/test`

Read every discovered artifact. Cite the exact field, section, diff, commit, path, or line that connects each expected handoff, then grade it:

- `explicit` — one artifact directly names or implements the other
- `inferred` — scope and behavior align without a direct link
- `missing` — the expected handoff cannot be found

Artifact state is not behavioral proof: an approved spec, closed issue, or merged PR does not establish current behavior.

**Complete when:** every discovered artifact is placed in the chain and every expected transition has one grade supported by exact evidence or a named search gap.

## 4. Verify current implementation

Trace the current production path, every caller and sibling path that shares the behavior, tests, configuration, and feature gates. Compare observable behavior with each claimed behavior, then run the smallest decisive checks available.

Assign one status per expected behavior:

| Status | Meaning |
|---|---|
| `implemented` | Current code covers the behavior end to end and evidence passes |
| `partial` | Some required paths or conditions are absent |
| `not implemented` | Current code lacks the behavior |
| `diverged` | Current code behaves differently |
| `unverified` | Available access or evidence cannot decide behavior |

**Complete when:** every claimed behavior maps to current code and verification evidence, or to a named gap.

## 5. Return the trace

Lead with the source classification, confidence, implementation status, current-code baseline, and date. Then provide:

1. **Source record:** claim, classification, exact evidence, locator, and counterevidence.
2. **Artifact chain:** each artifact and the grade of every expected link.
3. **Implementation matrix:** expected behavior, current code/test evidence, and status.
4. **Caveats and next work:** missing sources, inferred links, unresolved disagreement, stale branches, absent tests, and the smallest action that would close each gap.

**Complete when:** every claim, expected link, and behavior is accounted for; quotation, paraphrase, inference, and artifact fact remain distinct; and every gap ends with the smallest evidence-backed next action.
