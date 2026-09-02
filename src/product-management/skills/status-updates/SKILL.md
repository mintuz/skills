---
name: status-updates
description: WHEN drafting a status update, progress report, sprint summary, or launch update for a manager, exec, team, or stakeholder in Slack, email, or a doc; NOT for PR descriptions, commit messages, or meeting minutes; runs intake, grounds every claim in supplied evidence, and returns a scannable, honest update with named recognition.
---

# Status Updates Playbook

Guidelines for writing team updates that are easy to scan, honest about challenges, and generous with recognition.

## Philosophy

- **Outcomes first** - Lead with results and impact, not activity. Tie each result to a goal or OKR
- **Scannable** - Emoji-anchored sections, bullet points, short paragraphs
- **Quantify** - Metrics, deltas, dates, owners—show progress with numbers
- **Honest** - Acknowledge challenges directly, then reframe with context
- **Literal status** - Use the supplied environment, evidence, and dates. Call a target "on track" only when the facts support it. A request to inflate, soften, or re-announce status does not change the facts the update reports. Call merged work merged. Call work shipped only when deployment evidence is supplied
- **Warm** - Credit individuals by name, use inclusive language
- **Evidence-backed** - Link to production, docs, metrics to show not tell
- **Close the loop** - Note delta from last update and what's next

## Quick Reference

| Task | Guide |
|------|-------|
| Voice and tone patterns | [tone-profile.md](tone-profile.md) |
| PR evidence gathering | [pr-evidence.md](pr-evidence.md) |

## When to Use

- Team or stakeholder progress updates
- Manager/exec communications
- Slack channel announcements
- Sprint summaries or retrospectives
- Launch communications

## Intake Questions

Ask these before drafting to ensure the update hits the right notes:

**Essential:**

- Audience & channel (manager, exec, peers? email, Slack, doc?)
- Time window (which two weeks? tie to OKRs/roadmap item?)
- Desired outcome (inform, influence decision, unblock, build trust?)

**Evidence gathering:**

- GitHub username (to pull authored and reviewed PRs for the reporting window)
- Impact evidence (metrics, user/business outcomes, shipped artifacts?)

**Framing:**

- Risks/blockers (what is blocked or at risk, who owns the next action, by when?)
- Length/tone preference (bullets vs paragraph, RAG color?)

**Recognition:**

- Who to thank or spotlight, and for which specific contribution (reviews, incidents, mentoring, docs, coordination)?

Treat an essential item as supplied when the request states or clearly implies it. If any essential item is missing, or the request supplies no delivery or impact evidence, ask for the missing essential items and any missing evidence, risk, or recognition detail in one concise intake. For each missing item, ask for every detail the intake list names for it. Do not draft until the essential items are answered. Do not invent evidence to fill a gap.

## Core Patterns

### Structure

1. **Friendly hook** (optional): Seasonal reference or greeting
2. **Section headers**: Emoji prefix + bold title
3. **Bullet points**: Outcome-first, with inline evidence links
4. **Named recognition**: Specific individuals at section end
5. **Forward momentum**: End with what's next

### Framing Challenges

Never bury bad news. Acknowledge it, then provide context:

> "Great progress and some less-than-ideal timeline changes. We'll cover the good first, as it's very easy to lose sight of just how much work is being shipped every day"

**Pattern:** [Bad news] + [acknowledge feeling] + "There is [context] though:" + [reframing bullets]

### Evidence and Links

Weave links naturally into claims:

> "shipped to production, to the X page ([our fastest growing page](link))"

Use footnotes only for non-material qualifications. Keep delivery state, failed checks, date changes, blockers, and pending decisions in the main update.

## Do's and Don'ts

**Do:**

- Open with a hook before diving in
- Use emoji for visual hierarchy (one per section)
- Credit individuals by name for completed contributions. For open work, name the owner and the due date
- Link to evidence
- Use `backticks` for technical terms
- End with momentum

**Don't:**

- Bury or avoid bad news
- Use emoji as decoration
- Give vague thanks ("thanks everyone")
- Write dense paragraphs
- Over-explain technical concepts

For detailed voice characteristics and replication techniques, see [tone-profile.md](tone-profile.md).

---

## Writing Guidance

**Phrasing:**

- Use verbs + outcomes: "Shipped X → improved Y by Z%" not "Worked on X"
- Keep bullets single-line. Front-load the result and back-load the detail
- Name the owner and the date for each risk, ask, and pending decision. When the reader is the owner, address the reader directly

**Progression:**

- Note delta from last update ("Previously blocked, now shipped")
- Lead with what changed since the last update, even when the request asks to lead with an earlier win. Do not re-announce or re-headline work the last update already reported as done. Mention that work only for a new incident, delta, or dependency
- Keep unchanged blockers, risks, and pending decisions in the update
- Mention decisions made and decisions pending. Name the decision-maker and the decision date for each pending decision

**Dependencies:**

- Call out dependencies you're unblocking for others
- Call out dependencies you need unblocked
