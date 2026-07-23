---
name: writing
description: WHEN drafting, editing, or reviewing developer documentation, tutorials, how-to guides, technical proposals, or technical reviews; NOT for commit messages, pull request descriptions, or team status updates; produces reader-first writing with a clear payoff, scannable hierarchy, and verifiable technical claims.
---

# Developer Writing

Build a **reader path** that developers can skim for the payoff, then follow for trustworthy detail.

## 1. Establish the reader contract

Read the request, source material, referenced code or links, and nearby writing conventions. Resolve:

- the reader and the job they need to complete;
- the requested work mode and artifact shape;
- the intended outcome or decision;
- the facts, examples, and claims available as evidence; and
- the required voice, terminology, format, length, and call to action.

Infer low-risk gaps from the available context. Surface an assumption when it materially changes technical truth or the reader's action.

**Complete when:** every explicit requirement and source maps to the reader contract, and every unresolved factual claim is identified.

## 2. Choose the reader path

Select each requested work mode in order:

| Mode | Reader path |
| --- | --- |
| Draft | Build a new artifact from the reader contract. |
| Edit | Preserve the source's meaning and evidence while improving its payoff, order, and prose. |
| Review | Return prioritized findings, evidence, and exact revision guidance. |

Then apply the artifact shape:

| Artifact | Required shape |
| --- | --- |
| Documentation or reference | Answer first; organize details by the tasks or concepts readers will look up. |
| Tutorial | State the learning outcome and prerequisites; teach concepts in sequence with runnable examples, checkpoints, and an observable finish. |
| How-to guide | State the task and prerequisites; give the shortest ordered path, expected result, and recovery for likely failures. |
| Technical proposal | Lead with the recommendation; cover the problem, constraints, options, tradeoffs, decision, and next action. |
| Technical review | Lead with the verdict; support it with evidence, risks, and prioritized actions. |

Before outlining an artifact that needs a title, sections, lists, an introduction or conclusion, or SEO treatment, read [formatting.md](formatting.md) and apply its completion criterion.

**Complete when:** every requested artifact includes each requested work mode, follows its required shape, and contains every section needed to deliver the reader's outcome.

## 3. Write for payoff and trust

Lead with the payoff, then place each explanation immediately before the action or decision it supports. Prefer active voice, direct vocabulary, short sentences, and `you`; use `I` when the author's perspective is evidence. When the reader contract is silent on voice, default to friendly, practical, and confident.

Make technical claims concrete with the smallest useful example, command, constraint, or source. Keep product names and domain terms consistent. Mark unverified behavior as unverified instead of presenting it as fact.

For editing, retain relevant facts, caveats, and voice while cutting duplicated claims and detail that does not advance the reader path. For review, rank findings by reader impact and cite the exact passage or omission behind each one.

**Complete when:** every section advances the reader path, every material claim is supported or clearly qualified, and every example is sufficient for the reader's next action.

## 4. Verify the artifact

Run two passes:

1. **Skim pass:** read only the title, headings, opening sentences, and list leads. They must reveal the payoff, sequence, verdict, or recommendation.
2. **Trust pass:** check every requirement, factual claim, code sample, command, link, product name, prerequisite, caveat, and next action against the reader contract and available evidence.

Return the requested artifact or review in its requested format. Report only assumptions or verification gaps that could change how the reader uses it.

**Complete when:** both passes account for every item in the reader contract and every unresolved gap is labeled.
