---
name: meeting-to-action-brief
description: WHEN turning a completed or live meeting, transcript, recording, or notes into a concise decision-and-action brief; NOT for verbatim minutes, drafting requirements, tracing decision lineage, or reviewing implementation; preserves proposals, uncertainty, and provenance.
---

# Meeting to Action Brief

Turn the right source record into a shareable brief without promoting discussion into agreement.

## 1. Resolve the source

Interpret “current,” “latest,” dates, titles, and attendee names literally. Enumerate plausible meetings, then verify the selected meeting's ID, title, time, attendees, and state before reading its transcript, summary, notes, and stored action points. Prefer the primary transcript or notes over a previous summary.

For a live meeting, retrieve the open meeting rather than the latest completed one. Record an `as of` timestamp and the latest transcript segment or equivalent cutoff; treat the result as an incomplete snapshot.

**Complete when:** one source is identified by stable locator and state, the selection rule is explicit, and any missing or live content has a visible cutoff.

## 2. Build the evidence ledger

Read the relevant source span through its latest qualification or resolution. Keep the requested topic in scope and classify each material item:

| Type | Evidence required |
| --- | --- |
| `decision` | An explicit selection, commitment, or resolution for a stated scope |
| `action` | An explicit commitment with an owner; preserve an absent date as `not stated` |
| `proposal` | A suggestion, preference, or intended direction without resolution |
| `open question` | A choice, dependency, or disagreement that remains unsettled |
| `context` | Background that explains a decision or action without proving it |

Attach the speaker or source, timestamp or precise locator, and confidence to each decision and action. Label manually extracted commitments `transcript-derived` when the meeting system did not store them as action points. Preserve disagreement and ambiguous ownership as uncertainty; when a later explicit commitment resolves an earlier ambiguity, record that resolution and cite both points. Paraphrase sensitive content unless exact wording is necessary and safe.

**Complete when:** every material claim has one classification and locator; every action has an owner or an explicit ownership gap; and proposals, inference, and agreement remain distinct.

## 3. Shape the action brief

Create a concise action brief:

1. **Source and cutoff** — meeting identity, state, date, and live watermark if applicable.
2. **Executive takeaway** — the outcome in two or three sentences.
3. **Decisions** — decision, rationale, scope, and evidence locator.
4. **Actions** — owner, action, due date or `not stated`, status, and provenance.
5. **Open questions and risks** — unresolved choices, dependencies, and named uncertainty.
6. **Limits** — missing records, weak attribution, or incomplete live coverage.

**Complete when:** the brief matches the requested audience, agreed outcomes are separated from proposals, and every unresolved choice that could change the next action is visible.

## 4. Verify and deliver

Compare the finished artifact with the evidence ledger. Remove any unsupported decision, invented rationale, inferred owner, or fabricated deadline. Check that live summaries carry their watermark and that concise wording does not erase meaningful disagreement or uncertainty.

Lead with the outcome, decisions, and next actions. Keep provenance compact but sufficient for a reader to return to the source.

When downstream tracing is requested, hand the selected decision and its source locator to `decision-trace`. Route PRD or specification drafting to the product-management workflow rather than extending the brief.

**Complete when:** every decision and action is traceable to the selected source, no proposal is presented as agreement, and the brief is ready to share without additional explanation.
