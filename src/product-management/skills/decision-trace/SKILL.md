---
name: decision-trace
description: WHEN tracing a decision or delivery-status claim from a meeting, transcript, decision record, handover, or status document through specs, issues, PRs, and commits; NOT for meeting summaries, acceptance verdicts, or implementation; preserves source uncertainty, grades each delivery handoff, and prepares an acceptance-review contract.
---

# Decision Trace

Treat a claimed decision as a lineage from its source to delivery artifacts. Prove the decision and each handoff without judging whether code satisfies it. When the user asks whether the decision was implemented correctly, finish this trace before invoking `acceptance-review` with its handoff.

## 1. Frame the claim and cutoff

Rewrite the claimed decision as one or more exact behaviors without strengthening it. Split behaviors whose lineage can differ. Record the source scope, relevant repositories, and the artifact date or revision that defines the trace cutoff. Use the available primary source regardless of provider. Treat a delivery-status claim in a handover or status document as a trace claim. Verify it against PRs and commits dated after the document before you relay it as current. Match evidence to the claimed state: a merge proves integration only, a deployment record proves deployment, and a run log proves execution.

**Complete when:** every claimed behavior, the source scope, and the trace cutoff are explicit, with unavailable inputs recorded as gaps.

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

## 3. Grade the delivery lineage

Follow the chain as far as evidence permits:

`source statement → decision record or brief → specification → issue → PR or commit`

Read every discovered artifact. Cite the exact field, section, description, or commit message that connects each handoff. Grade each handoff against its immediate upstream artifact, not against the source statement:

- `explicit` — the downstream artifact directly links to the upstream artifact and preserves its stated behavior unchanged;
- `inferred` — its scope aligns with the upstream artifact without a direct link;
- `changed` — it materially alters, narrows, or contradicts the upstream behavior, even when it directly links upstream;
- `missing` — the expected handoff cannot be found.

A downstream artifact that records explicit authority for a resolution or supersession is a new decision root. Record the transition into it as supersession instead of grading it, and trace the delivery chain from the new root. Otherwise, when the source classification is not `decision`, grade the first downstream artifact that states the behavior as settled `changed`.

For PRs and commits, grade documentary linkage and represented scope, not code behavior. An approved specification, closed issue, merged PR, or present commit does not prove implementation correctness.

**Complete when:** every discovered artifact is placed in the chain and every expected transition has one grade supported by exact evidence or a named search gap.

## 4. Prepare the acceptance handoff

For each behavior, select as the contract the artifact nearest the implementation that states the requirement with documented authority and whose lineage from the source contains no `changed` or `missing` link. An issue or PR that repeats an upstream requirement without independent documented authority is not the contract. When a later link in that behavior's chain is `changed`, report it as an authority ambiguity, mark the handoff provisional, and name the authority or supersession resolution as the next action before acceptance review. Identify the implementation subject that `acceptance-review` should assess, such as a PR, branch, diff, commit, or current code baseline. Do not inspect implementation behavior or run acceptance checks here, even when the user supplies code or a diff and asks for a verdict; state that the verdict belongs to `acceptance-review`.

Prepare a handoff containing:

- the claimed decision, source classification, confidence, and locator;
- authoritative requirement locators and any `changed` or `missing` links;
- the implementation subject and comparison base;
- stated exclusions, ambiguities, and unresolved authority gaps.

When no authoritative downstream requirement exists, report the missing handoff instead of manufacturing acceptance criteria from the meeting. A downstream artifact that promotes unresolved disagreement without explicit authority or supersession is not an acceptance contract; withhold the handoff until that lineage gap closes.

**Complete when:** `acceptance-review` has an authoritative contract and implementation subject, or the exact missing lineage link is explicit.

## 5. Return the trace

Lead with the source classification, confidence, latest traced artifact, and cutoff. Then provide:

1. **Source record:** claim, classification, exact evidence, locator, and counterevidence.
2. **Delivery lineage:** each artifact and the grade of every expected link.
3. **Acceptance handoff:** authoritative contract, implementation subject, base, exclusions, and ambiguities.
4. **Caveats and next work:** missing sources, inferred or changed links, unresolved disagreement, and the smallest action that would close each gap.

**Complete when:** every claim and expected link is accounted for, quotation and inference remain distinct, and no implementation verdict appears in the trace.
