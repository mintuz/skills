---
name: gps-method
description: WHEN defining a goal, turning one into an actionable plan and execution system, or diagnosing stalled progress; NOT for standalone task lists without a goal; creates or repairs a Goal, Plan, System map.
---

# GPS Method

Treat a goal as a GPS map:

- **Goal** sets the destination.
- **Plan** selects a credible route.
- **System** keeps movement visible and repeatable.

Build in that order. Diagnose in the same order and repair the first weak component before changing anything downstream.

## Choose the branch

- **Create:** the user has a new, vague, or undocumented goal.
- **Diagnose:** the user has a goal but progress has stalled or execution is inconsistent.

For an existing stalled goal, diagnose before rebuilding it.

**Complete when:** one branch is selected from the user's situation; if the situation is ambiguous, the user has identified whether they need a new map or a repair.

## Create a GPS map

Read [`references/goal-template.md`](references/goal-template.md) before using this branch; it is the required output schema. Load [`references/example-goals.md`](references/example-goals.md) only when the user asks for inspiration, a field remains abstract after one attempt, or a quality benchmark is needed.

### 1. Set the Goal

Establish:

- a specific outcome with an observable measure and a target date or review horizon;
- the user's intrinsic reason for pursuing it;
- anti-goals: the time, money, health, relationships, or values the pursuit must protect.

**Complete when:** one sentence states the outcome, measure, and horizon; the motivation belongs to the user; and the boundaries are explicit.

### 2. Build the Plan

1. Choose three to five major moves that plausibly produce the outcome.
2. Score confidence from 0–100% on both:
   - **Theory:** will these moves produce the result?
   - **Practice:** will the user consistently do them?
3. When either score is below 80%, reduce the scope, change the moves, add support, or define a small test, then score again. Record any uncertainty the user deliberately accepts.
4. Run a crystal-ball forecast: imagine the goal missed at the horizon, name the three most likely causes, and pair each with a pre-emptive response.

**Complete when:** three to five concrete moves connect to the goal, both confidence scores are at least 80% or accepted uncertainty is explicit, and each forecasted failure has a response.

### 3. Design the System

Define:

- **Tracking:** the result measure, leading actions, tool, and review cadence;
- **Reminders:** a time, event, or environmental cue for each recurring move;
- **Accountability:** a person, group, or mechanism, its check-in cadence, and the response to a missed commitment.

Prefer the lowest-friction system the user will actually maintain.

**Complete when:** every recurring move has a cue or schedule, progress has a visible review cadence, and accountability has a named mechanism.

### 4. Deliver the map

Fill the goal template in the user's language. Mark assumptions and unresolved choices instead of inventing commitments. End with the first scheduled action and first review date.

**Complete when:** every template field contains user-grounded content or an explicit open question, and the user has a concrete next action.

## Diagnose a stalled goal

Read [`references/diagnostic-guide.md`](references/diagnostic-guide.md) before using this branch. Ask only the questions needed to decide the current gate.

### 1. Find the first break

Test the Goal, Plan, and System gates in order. Stop at the first gate that fails. If all three pass, inspect execution quality, timeline assumptions, measurement lag, and external constraints.

**Complete when:** one broken component or deeper constraint is named with evidence from the user's actual behavior or results.

### 2. Repair and verify

Apply the smallest targeted repair, update the affected part of the GPS map, and set an observable check and review date. Re-run the repaired gate, then continue through the remaining gates.

**Complete when:** the diagnosis, repair, and evidence that will confirm or reject the repair are explicit.

## Response contract

For creation, return the completed GPS template, open questions or assumptions, and the next action. For diagnosis, return the first broken component, supporting evidence, targeted repair, updated map fields, and the next check.
