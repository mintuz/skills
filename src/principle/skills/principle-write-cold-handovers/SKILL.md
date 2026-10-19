---
name: principle-write-cold-handovers
description: "WHEN delegating, pausing, or writing a brief or specification another agent will execute; NOT for resuming from an existing handover or bounding reads within a session; produces a handover a fresh agent can act on with nothing more."
---

# Write cold handovers

Write every handover, brief or specification so a reader with no shared history can act on it alone.

1. Assume the reader has never seen this conversation, your shorthand or your hypotheses. Replace every reference to shared context ("as discussed", "the second idea", "same as last time", "see above") with the content itself or an exact locator.
2. Before continuity is at risk, save a concise durable handover in an allowed location: accepted goal and scope, current artifact or branch identity, completed changes, exact checks and outcomes, remaining uncertainty, and one concrete next executable step.
3. When delegating, make the brief stand alone: goal, scope, the exact slice and the revisions it covers, how to verify it, and what to report back, including the revisions and method used.
4. Record what was ruled out and why. Keep a plan, a static check or an unavailable runtime check visibly separate from completed proof.
5. Reread the handover as its cold reader: every term defined, every path, revision and command exact, nothing left to recall.

Distinct from: `principle-refresh-before-resuming` (the reader re-checks live state when picking up), `principle-guard-the-context-window` (bounding reads within a session), `principle-label-the-evidence` (marking each claim's status in findings).

Done: a cold reader can continue without further context, without redoing the investigation, and without mistaking a plan or static check for completed proof.
