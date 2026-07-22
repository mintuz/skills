---
name: decision-trace
description: WHEN tracing a meeting or transcript statement, rationale, or claimed decision through specs, issues, PRs, and current code; NOT for generic summaries, glossary extraction, or implementation; classifies evidence as decision/proposal/disagreement/unknown and reports implementation status without laundering uncertainty.
---

# Decision Trace

Trace a claim from what people actually said to what the product currently does. Operate read-only; if the user requests changes, finish the trace and hand the evidence-backed requirements to an implementation workflow.

## 1. Frame the claim

Rewrite the claim as a testable statement without strengthening it. Record the requested scope, relevant repositories, and the branch, commit, or date used as “current.” Use pasted text, local files, knowledge bases, meeting providers, and repository history as available; keep acquisition provider-agnostic.

**Complete when:** the claim, source scope, and current-code reference are explicit, with unavailable inputs recorded as gaps.

## 2. Establish the source record

Find the primary conversation or decision record and inspect enough surrounding context to capture qualification, objections, later resolution, and superseding statements. Quote only the decisive words and attach speaker, date, and a precise locator such as timestamp, line, heading, or URL. Label paraphrases and inferences as such.

Classify each claim:

| Classification | Required evidence |
|---|---|
| `decision` | An explicit selection, commitment, or resolution presented as settled for a stated scope |
| `proposal` | A suggestion, option, recommendation, question, or intent without explicit resolution |
| `disagreement` | Incompatible positions remain unresolved in the available record |
| `unknown` | The source, context, attribution, authority, or resolution is insufficient |

Prefer the later explicit resolution when sources conflict, while preserving the earlier position and chronology. Treat rationale as support for a classification, not proof that a decision occurred. Treat silence and missing records as `unknown`.

**Complete when:** every material supporting and contradictory excerpt is cited, and each claim has one classification with a stated confidence and evidence gap.

## 3. Trace downstream artifacts

Follow the chain as far as evidence permits:

`source statement → decision record/spec → issue → PR/commit → current code/test`

For every link, read the artifact and cite the exact field, section, diff, commit, path, or line that establishes the relationship. Mark links as:

- `explicit` — one artifact directly names or implements the other;
- `inferred` — scope and behavior align, but no direct link exists;
- `missing` — the expected handoff cannot be found.

Keep artifact state distinct from behavioral state: an approved spec, closed issue, or merged PR does not by itself prove the behavior exists in current code.

**Complete when:** each discovered artifact is placed in the chain and every transition is evidenced or marked `inferred`/`missing`.

## 4. Verify current implementation

Inspect the current production path, relevant callers and sibling paths, tests, configuration, and feature gates. Compare observable behavior with the classified claim rather than with artifact titles. Use the smallest relevant runnable checks when available.

Assign one status per expected behavior:

| Status | Meaning |
|---|---|
| `implemented` | Current code covers the behavior end to end with verification evidence |
| `partial` | Some required paths or conditions are absent |
| `not implemented` | Current code lacks the behavior |
| `diverged` | Current code intentionally or accidentally behaves differently |
| `unverified` | Access, environment, or evidence cannot establish runtime behavior |

**Complete when:** every behavior implied by the claim maps to current code and verification evidence, or to a named gap.

## 5. Report the trace

Lead with the verdict and its confidence, qualified by the code reference and date. Then provide:

1. **Source record:** claim, classification, exact evidence, locator, and counterevidence.
2. **Artifact chain:** each artifact and the evidence quality of every link.
3. **Implementation matrix:** expected behavior, current code/test evidence, and status.
4. **Caveats and next work:** missing sources, inferred links, unresolved disagreement, stale branches, absent tests, and the smallest action that would close each gap.

Keep fact, quotation, paraphrase, and inference visibly distinct. End at evidence-backed next work and hand requested changes to the appropriate implementation workflow.
