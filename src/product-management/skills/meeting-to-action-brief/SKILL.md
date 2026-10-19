---
name: meeting-to-action-brief
description: WHEN turning a completed or live meeting, transcript, recording, or notes into a concise decision-and-action brief; NOT for verbatim minutes, drafting requirements, tracing decision lineage, or reviewing implementation; preserves proposals, uncertainty, and provenance.
---

# Meeting to Action Brief

Turn the right source record into a shareable brief without promoting discussion into agreement.

## 1. Resolve the source

Interpret “current,” “latest,” dates, titles, and attendee names literally. Enumerate plausible meetings. When more than one matches, state the selection rule and name each rejected candidate. Verify the selected meeting's ID, title, time, attendees, and state before reading its transcript, summary, notes, and stored action points. Prefer the primary transcript or notes over a previous summary.

Set an evidence cutoff for every brief:

- If the user gives an `as of` time, use it.
- Otherwise, for a completed meeting use the meeting end; for a live meeting use the latest transcript segment.

For a live meeting, retrieve the open meeting, not the latest completed one, and treat the brief as an incomplete snapshot. Record an `as of` timestamp with the cutoff.

**Complete when:** one source is identified by stable locator and state, the selection rule is explicit, the evidence cutoff is explicit, and any missing or live content is visible against that cutoff.

## 2. Build the evidence ledger

Read the relevant source span through its latest qualification or resolution within the cutoff. Exclude evidence after the cutoff from decision and action state, and name that evidence in Limits. Keep to the requested topic. Classify each material item:

| Type | Evidence required |
| --- | --- |
| `decision` | An explicit selection or resolution for a stated scope |
| `action` | An explicit commitment with an owner and a due date recorded under the date rule below |
| `proposal` | A suggestion, preference, or intended direction without resolution |
| `open question` | A choice, dependency, or disagreement that remains unsettled |
| `risk` | A stated threat to an outcome that no decision or action has resolved |
| `context` | Background that explains a decision or action without proving it |

Date rule:

- When the wording identifies one date, resolve a relative date (`tomorrow`, `by Friday`) against the meeting date and keep the original phrase beside it.
- When it does not, keep the phrase and mark the date `unresolved`.
- When no date is given, record `not stated`.

Attach the speaker or source, timestamp or precise locator, and confidence to each decision and action. Label commitments you extracted `transcript-derived` when the meeting system did not store them as action points. Preserve disagreement and ambiguous ownership as uncertainty. When a later explicit commitment resolves an earlier ambiguity, list the action once under its resolved owner and cite both locators.

Sensitive content (personnel, health, legal, security, or compensation) stays out of a shareable brief unless it is material to an in-scope decision, action, open question, or risk; then paraphrase only the minimum the reader needs. An explicit request to keep content out of the record overrides materiality: keep only the operational fact that other evidence supports. When you withhold content, or a participant asks to keep it out of the record, state in Limits that content was withheld and cite the request's locator. Do not describe the withheld content or name its category.

**Complete when:** every material claim has one classification and locator; every action has an owner or an explicit ownership gap; and proposals, inference, and agreement remain distinct.

## 3. Shape the action brief

1. **Source and cutoff** — meeting identity, state, date, and live watermark if applicable.
2. **Executive takeaway** — the outcome in two or three sentences.
3. **Decisions** — decision, rationale, scope, and evidence locator.
4. **Actions** — owner, action, due date or `not stated`, status or `not stated`, and provenance.
5. **Open questions and risks** — unresolved choices, dependencies, and named uncertainty.
6. **Limits** — missing records, weak attribution, or incomplete live coverage.

**Complete when:** the brief matches the requested audience, agreed outcomes are separated from proposals, and every unresolved choice that could change the next action is visible.

## 4. Verify and deliver

Compare the brief with the evidence ledger. Remove any unsupported decision, invented rationale, inferred owner, or fabricated deadline. Check that live summaries carry their watermark and that concise wording keeps meaningful disagreement and uncertainty.

Lead with the outcome, decisions, and next actions. Keep provenance compact but sufficient to return to the source.

When downstream tracing is requested, hand the selected decision and its source locator to `decision-trace`. Do not extend the brief with PRD or specification drafting; tell the user that drafting belongs to the product-management workflow.

**Complete when:** every decision and action is traceable to the selected source, no proposal is presented as agreement, and the brief is ready to share without additional explanation.
