---
name: gps-method
description: WHEN a user wants to set a goal, create an actionable plan, build an execution system, or diagnose why progress on an existing goal has stalled; triggers include "set a goal", "help me achieve", "create a plan", and "why am I not making progress"; NOT a substitute for a qualified professional: it declines to plan a decision that only a clinician, a lawyer, or a financial adviser may make, and redirects that part to them; returns a Goal, Plan, and System breakdown or a component-level diagnosis.
---

# GPS Method - Goal Achievement Framework

GPS stands for **Goal, Plan, and System**. The skill has two modes:

1. **Creating a new goal**: define the Goal (destination: specificity, motivation, constraints), build the Plan (major moves, feasibility, obstacle forecast), design the System (tracking, reminders, accountability), then document everything in a structured goal document.
2. **Diagnosing an existing goal**: when the user is struggling, identify the broken component (Goal, Plan, or System), ask diagnostic questions specific to it, and recommend targeted fixes.

## Creating a New Goal

### Step 1: Define the Goal (The Destination)

**Specificity and Concreteness**

- Avoid vague goals like "start a business" or "get fit".
- Quote the user's own goal wording back and name the measurable detail it lacks.
- Ask: "Can you make this more specific and measurable?"
- Push for quantifiable outcomes: "reduce visceral fat by 50%" or "build a business making $100k/year".

**Emotional Compulsion (The Why)**

- Explore intrinsic motivation. Ask: "Why does this matter to you personally?"
- Watch for "should" goals driven by external pressure (fame, status, obligation); help the user separate genuine desire from external expectations.

**Anti-Goals (Constraints)**

- Ask: "What would you NOT be willing to sacrifice for this?" Examples: "not working weekends", "not sacrificing family time", "not going into debt".
- Test each anti-goal against the goal it constrains. If an anti-goal removes supervision, expertise, or support that this particular goal needs, say which one does.
- Ask the user to reconsider that anti-goal. Never design around such a conflict in silence.

### Step 2: Build the Plan (The Roadmap)

**Major Moves (3-5 Primary Actions)**

- Ask: "What are the 3-5 main things you need to do to achieve this?"
- Push for concrete, actionable steps. Weight loss: specific calorie targets, protein intake, number of weekly workouts. Business: revenue target, customer acquisition strategy, product timeline.

**Realistic Assessment**

- Reconcile the target, the deadline, the major moves, and the anti-goals against the quantities the user supplies. Treat anti-goals as constraints unless the user revises them.
- If the numbers cannot reach the target, show the arithmetic and stop there. Ask the user whether the target or the deadline can change. Until they answer, design no System and complete no goal document.
- Test the plan in theory ("Will these actions actually produce the result?") and in practice ("Are you actually likely to follow through?").
- Ask for each rating directly:
  - Theory: "On a scale of 0-100%, how confident are you that these actions produce the result?"
  - Practice: "On a scale of 0-100%, how confident are you that you will do them?"
- Use an 80% confidence threshold: if either rating is below 80%, rethink the plan. Say which rating meets the threshold and which does not.
- A rating below 80% is a Plan fault, so do not answer it with extra tracking, reminders, or accountability.
- When practice confidence is below 80%, propose a specific smaller plan. Ask the user to rate theory and practice confidence again against that smaller plan before you continue.

**Crystal Ball Method (Mental Forecasting)**

- Have the user imagine they failed in 6 months. Ask: "What are the top 3 reasons this didn't work out?"
- Name each failure reason and create a preemptive strategy for each, building resilience before obstacles arise.
- When the user already reports a failure pattern from past attempts, use that pattern as a forecast obstacle with its own preemptive strategy. Do not ask the user to imagine an obstacle they have already described.

### Step 3: Design the System (The Execution)

Design the System only after the Goal states a measurable target and the Plan names its major moves. If the user asks for the System first:

1. Open the reply with the incomplete components, by framework name: the Goal, the Plan, or both.
2. Say what each System mechanism would have to measure or remind the user of.
3. Ask for every missing input: a measurable target, a date, why the goal matters to the user, the anti-goals, and the 3-5 major moves. Treat an unstated input as missing, even when the user says the Goal and the Plan are settled. Never ask again for an input the user already supplied.
4. Do not invent the missing numbers, dates, or actions.
5. Give the user one concrete action they can take at once, such as naming a single measurable outcome.

**Tracking**

- Ask: "How will you monitor progress?"
- Suggest specific tools (Google Sheet, app, scale, journal) and make tracking as frictionless as possible.
- Explain: awareness of numbers nudges better micro-decisions.

**Reminders**

- Ask: "How will you remember to work on this daily?"
- The brain forgets resolutions without cues. Suggest:
  - Write goals down each morning
  - Vision board in visible location
  - Calendar blocks for major moves
  - Phone reminders at key times

**Accountability**

- Ask: "Who can help hold you accountable?"
- Options: accountability buddy, squad, mentor, coach, public commitment.
- Most people struggle with self-accountability alone; external pressure and support are critical when motivation wanes.

## Documenting the Goal

Use this template (full version and filled examples: `references/goal-template.md`):

```markdown
# [Goal Name]

## Goal (The Destination)

**Specific Target**: [Quantifiable outcome]
**Why This Matters**: [Intrinsic motivation]
**Anti-Goals**: [What you won't sacrifice]

## Plan (The Roadmap)

**Major Moves**:

1. [Action 1]
2. [Action 2]
3. [Action 3]

**Confidence Assessment**:

- Theory (will it work?): [X]%
- Practice (will I do it?): [X]%

**Failure Forecast**:

- Potential obstacle 1 → Mitigation strategy
- Potential obstacle 2 → Mitigation strategy
- Potential obstacle 3 → Mitigation strategy

## System (The Execution)

**Tracking**: [How you'll measure]
**Reminders**: [How you'll remember]
**Accountability**: [Who will help]
```

## Diagnosing Existing Goals

Ask these questions in order:

**Question 0: Has available capacity changed?**

- Did the Plan and the System work until an outside event reduced the time, money, or energy available?
- If yes, the current Plan is the broken component, because it no longer fits available capacity. The Goal and the System are not broken, so do not diagnose weak motivation, poor execution, or missing accountability.
- Keep the anti-goals. Rescale the Plan to the largest action that fits current capacity and still produces an outcome.
- Treat the target and the deadline as provisional until the user knows how long the new capacity will last. Set a date to reassess capacity.
- Add a System mechanism only when it fixes the diagnosed cause. A mechanism that consumes capacity without advancing the goal makes the mismatch worse.

**Question 1: Is the Goal clear?** Can the user state it in one specific sentence? If not, work on Goal definition first.

**Question 2: Do they believe the Plan will work?** Are they confident in the major moves (theory) and that they will actually do them (practice)? If not, revise the Plan.

**Question 3: Are they executing the System?** Are they tracking, using reminders, and accountable to someone? If not, strengthen the System.

Detailed troubleshooting questions: `references/diagnostic-guide.md`.

## When Not To Use GPS

Do not build a Goal, a Plan, or a System for an outcome that a qualified professional must decide, such as changing a prescribed medicine, self-treating a medical or mental-health condition, or acting against legal or clinical advice.

- Say which part is outside the framework and direct the user to the qualified professional for that part.
- Apply GPS only to the parts the user controls.
- For the declined part, state no schedule, dose, threshold, or deadline, and promise no outcome.

## The GPS Analogy

Explain with the literal GPS:

- **Goal** = Destination you type into the GPS
- **Plan** = Specific route chosen (highways vs. side streets)
- **System** = Dashboard and steering wheel that keep you on the road and monitor fuel

Without all three, you can't reliably reach your destination.

## Examples

For quality standards, see `references/example-goals.md`: complete GPS breakdowns for fitness, business, learning, relationship, and creative goals.
