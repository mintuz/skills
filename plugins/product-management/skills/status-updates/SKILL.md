---
name: status-updates
description: WHEN writing or revising team status updates, progress reports, sprint or retrospective summaries, launch updates, or stakeholder communications; NOT for PRDs or incident postmortems; produces evidence-backed, audience-shaped updates with explicit risks, asks, next steps, and recognition.
---

# Status Updates

Treat a status update as an evidence ledger shaped for one audience. Preserve the distinction between activity, delivery, and impact; make uncertainty visible; and give the reader a clear next action.

## 1. Set the brief

Establish:

- audience and channel
- reporting period and goal, roadmap item, or OKR
- purpose: inform, secure a decision, unblock work, or build trust
- requested length and voice

Use supplied context for clear inferences. Ask one concise batch of questions for missing facts that would materially change the update. Mark non-blocking gaps as `[needed: fact]` and continue.

**Complete when:** audience, channel, period, and purpose are known or explicitly inferred, and every material unknown is answered or marked.

## 2. Build the evidence ledger

Gather the supplied notes, prior update, delivery artifacts, metrics, decisions, and feedback. Include evidenced glue work such as reviews, mentoring, incident response, documentation, and coordination. Track each candidate claim with its status, impact, evidence, owner, and date. Use precise states such as `shipped`, `in progress`, `blocked`, and `planned`.

When recent GitHub work is relevant, read [pr-evidence.md](pr-evidence.md) for its evidence categories. Use fields supported by the current `gh search prs --help`, then inspect relevant PRs individually for changed files and merge state. Treat PR metadata as evidence of activity; verify deployment, adoption, and impact independently. Label estimates and inferences, and retain conflicting evidence as a gap.

**Complete when:** every candidate claim has supporting evidence or an explicit qualifier, and every delivery or impact claim has proof beyond activity.

## 3. Select the signal

Rank material for this audience:

1. outcomes and change since the previous update
2. risks, blockers, decisions, and asks
3. next milestones and dependencies
4. specific recognition

Collapse related activity into one outcome where the evidence supports it. Frame a challenge as current state → consequence → response → owner/date or ask. Credit a named contribution and its effect when the evidence supports both.

**Complete when:** every material outcome, risk, ask, and next step is accounted for, and each included item explains why this audience should care.

## 4. Draft for the channel

Lead with the most important outcome. Use short sections and outcome-first bullets with evidence links beside the claims they support. Shape emphasis by audience:

- **Executives and managers:** impact, trajectory, material risk, and decisions needed
- **Teams and Slack:** progress, dependencies, owners, next steps, and recognition
- **Launch updates:** readiness, evidence, caveats, and the next milestone

Use channel-native section anchors—bold labels in Slack and headings in documents—including emoji when the channel and requested voice support them. Use backticks for technical identifiers. When the requester wants the warm, playful, emoji-anchored house voice, read [tone-profile.md](tone-profile.md) before drafting.

A useful default shape is:

```markdown
[Outcome headline and reporting period]

## Outcomes
- [State] [outcome] → [impact] ([evidence])

## Risks, decisions, and asks
- [Current state] → [consequence]; [response and owner/date or ask]

## Next
- [Next outcome or milestone] — [owner/date]

## Recognition
- [Name] — [specific contribution and effect]
```

Keep the sections supported by the evidence and combine adjacent sections when that improves scanning.

**Complete when:** one scan reveals what changed, why it matters, what is at risk or needed, and what happens next.

## 5. Verify and return

Check the draft against the ledger:

- every factual claim has adjacent evidence or a visible qualifier
- names, metrics, links, dates, owners, and delivery states match their sources
- estimates, inference, and unknowns are distinguishable from facts
- bad news is visible with its consequence, response, and escalation need
- prior commitments are closed, updated, or carried forward
- recognition names a specific contribution and its effect

Return the usable update first. If marked gaps remain, follow it with the shortest list of facts needed to resolve them.

**Complete when:** every draft claim traces to the ledger, every material gap is visible, and each unresolved placeholder is clearly marked for follow-up.
