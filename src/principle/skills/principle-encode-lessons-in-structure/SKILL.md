---
name: principle-encode-lessons-in-structure
description: "WHEN a verified lesson recurs, the same failure or correction having happened at least twice; NOT for an unverified hypothesis, a single occurrence or a full recurrence investigation; chooses one narrow structural guard, or one instruction for a judgement-only lesson."
---

# Encode lessons in structure

Turn a verified recurring lesson into one guard when the rule is mechanically decidable.

1. Identify the concrete failure and the invariant that would exclude it. Use existing evidence; repeated wording alone does not prove a code defect. A lesson recurs once the same failure or correction has happened twice; fix a single occurrence directly and encode it when it repeats.
2. Choose the smallest fitting owner: a domain type, constructor, metadata constraint, lint rule, runtime check or existing script. Show that the guard rejects a real past failure and that valid behaviour still passes.
3. Keep one authoritative enforcement point. Remove redundant reminders only where the structural guard actually covers their meaning; retain necessary explanation of intent.
4. When correctness needs judgement, keep one focused instruction at its existing owner with a concrete failure and successful example, plus a review criterion a reviewer can check. A noisy classifier is weaker than honest review.

Distinct from: `principle-build-the-lever` (making repeated work a rerunnable tool for the task in hand), `principle-fix-root-causes` (repairing one reproducible defect), `principle-never-weaken-a-check` (a gate fails).

Done: the guard rejects a real past failure and valid behaviour passes, or the judgement-only lesson has one clear instruction and review criterion at its owner. Broader investigation of recurring mistakes belongs to a separate correction workflow; this principle does not require one.
