---
name: decision-trace
description: WHEN checking what a meeting or transcript decided and whether specs, issues, PRs, and code carry it forward; NOT for summaries, glossaries, or implementation; preserves uncertainty across an evidence chain and reports current implementation status.
---

# Decision Trace

Follow the evidence chain from what people said to what the product does. Classify only explicit resolution as a decision. Keep the trace read-only; hand requested changes to an implementation workflow afterward.

## 1. Frame the claim

Rewrite the claim as a testable statement without strengthening it. Record the source scope, relevant repositories, and the branch, commit, or date that defines “current.” Use the available primary source regardless of provider.

**Complete when:** the claim, source scope, and current-code reference are explicit, with unavailable inputs recorded as gaps.

## 2. Establish the source record

Read enough of the primary conversation or decision record to capture qualification, objections, later resolution, and superseding statements. Quote only decisive words; attach speaker, date, and a precise locator. Label paraphrase and inference.

Classify each claim:

| Classification | Required evidence |
|---|---|
| `decision` | An explicit selection, commitment, or resolution settled for a stated scope |
| `proposal` | A suggestion, option, question, or intent without resolution |
| `disagreement` | Incompatible positions remain unresolved |
| `unknown` | Source, context, attribution, authority, or resolution is insufficient |

Prefer a later explicit resolution while preserving the chronology. Rationale supports a classification but does not prove a decision; silence and missing records remain `unknown`.

**Complete when:** every material supporting and contradictory excerpt is cited, and each claim has one classification with a stated confidence and evidence gap.

## 3. Build the chain

Follow the chain as far as evidence permits:

`source statement → decision record/spec → issue → PR/commit → current code/test`

Read every discovered artifact and cite the exact field, section, diff, commit, path, or line that connects it. Mark each link:

- `explicit` — one artifact directly names or implements the other
- `inferred` — scope and behavior align without a direct link
- `missing` — the expected handoff cannot be found

Artifact state is not behavioral proof: an approved spec, closed issue, or merged PR does not establish current behavior.

**Complete when:** each discovered artifact is placed in the chain and every transition is evidenced or marked `inferred`/`missing`.

## 4. Verify current implementation

Trace the current production path, callers, sibling paths, tests, configuration, and feature gates. Compare observable behavior with the classified claim, then run the smallest decisive checks available.

Assign one status per expected behavior:

| Status | Meaning |
|---|---|
| `implemented` | Current code covers the behavior end to end and evidence passes |
| `partial` | Some required paths or conditions are absent |
| `not implemented` | Current code lacks the behavior |
| `diverged` | Current code behaves differently |
| `unverified` | Available access or evidence cannot decide behavior |

**Complete when:** every behavior implied by the claim maps to current code and verification evidence, or to a named gap.

## 5. Report the trace

Lead with the verdict, confidence, code reference, and date. Then provide:

1. **Source record:** claim, classification, exact evidence, locator, and counterevidence.
2. **Artifact chain:** each artifact and the evidence quality of every link.
3. **Implementation matrix:** expected behavior, current code/test evidence, and status.
4. **Caveats and next work:** missing sources, inferred links, unresolved disagreement, stale branches, absent tests, and the smallest action that would close each gap.

Keep fact, quotation, paraphrase, and inference distinct. End with the smallest evidence-backed next action.
