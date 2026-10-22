---
name: architect
description: "WHEN shaping non-trivial code whose types, signatures or module boundaries are not settled, before implementation; NOT for edits inside one function, read-only explanation, or work whose design is already agreed; sketches caller usage, types and module boundaries through arena, then implements against the agreed sketch when authorised"
---

# Architect

Sketch types, function signatures, class shapes and module boundaries with `not implemented` bodies and pseudocode. Run the `arena` skill to synthesise one design from competing candidates, then fill in code against the chosen sketch.

## Scope

The request sets how far the run goes:

- **Design-only** (the request asks for a design, shape or sketch and does not authorise code changes): run Phases A and B, return the sketch and rationale, and stop.
- **Implementation authorised**: run every phase.
- **Commits**: commit the sketch or the implementation only when the user authorised commits.

Track the phases in scope as a checklist: Ground, Sketch, Agree, Implement, Scrap.

## Phase A: Ground the problem

Build a real mental model of every system the new code touches. Run the `how` skill over the relevant subsystems and produce the architectural explanation it prescribes; naming a file is not grounding. If the design redefines ownership or layering, also run the `why` skill on the existing shape so its rationale becomes a constraint, not a guess.

Skip Phase A only when the work is genuinely greenfield, with no surrounding system to integrate.

**Complete when:** every system the new code touches has a `how` explanation, plus a `why` account wherever ownership or layering changes.

## Phase B: Sketch

Run the `arena` skill to produce the sketch. Hand it:

- **Artifact:** the design sketch and rationale for this task, shaped per [Outputs](#outputs).
- **Grounding:** the Phase A `how` and `why` explanations.
- **Runner prompt:** [`references/runner-prompt.md`](references/runner-prompt.md), as each candidate's prompt.
- **Candidates:** at least two.
- **Extra criteria**, added to the rubric arena derives:
  1. **Design it twice.** Candidates are structurally distinct whole-shape alternatives, not point fixes inside one shape (`principle-exhaust-the-design-space`), even when the first looks sufficient. Each candidate commits to its own shape; one that hedges toward a safe middle fails.
  2. **Caller first.** Each candidate writes the caller's usage (the README or quickstart a consumer reads, plus two or three realistic call sites) before its types, and its type sketch agrees with that usage.
  3. **Red flags.** Each candidate passes [`references/design-red-flags.md`](references/design-red-flags.md); revise or reject flagged shapes. Assume the next contributor is an agent that sees only the files it opened, copies the nearest example and takes the shortest path that compiles. Prefer the design where a change that looks right from one file is right for the whole repository.
  4. **Interface depth.** Prefer the design that hides more complexity behind a smaller, simpler public surface. A rich interface can keep call chains short by concentrating capability instead of scattering it across layers.

Arena decides whether candidates run as subagents or are drafted in turn, each to completion before reading any other, and handles judging, picking the base and grafting. Copy its synthesis note into the rationale's "Synthesis decision" section. The note names the base and why, each graft with its source candidate, and each rejected candidate or part with its reason.

**Complete when:** arena has returned one synthesised sketch, its rationale exists per [Outputs](#outputs), the usage and the type sketch agree, and "Synthesis decision" names the base, every graft and every rejection.

## Phase C: Agree (opt-in)

Default: when implementation is authorised, proceed directly to Phase D with the synthesised design. Opt in to a checkpoint when the invoker asks for one ("/architect with checkpoint", "stop and show me before implementing" or similar): surface the synthesised design and pause for sign-off. A design-only request ends here with the sketch and rationale.

With commit authorisation, the synthesis can ship as its own commit, as the scaffold-first mode of `principle-foundational-thinking`. Planned, scoped breakage during fill-in is fine (`principle-outcome-oriented-execution`).

If the human pushes back on the shape, in a checkpoint or after the fact, treat that as Phase A evidence: re-ground and re-run Phase B before writing more code.

## Phase D: Implement against the sketch

Replace `not implemented` bodies with code and pseudocode with logic. The synthesised sketch is the contract. Deviations from it are a signal to surface, not friction to absorb silently. If a function needs a parameter the sketch did not anticipate, ask whether the sketch was wrong, the requirement was missed or the implementation is overreaching, then update the sketch and rationale before continuing.

**Complete when:** every `not implemented` body is filled, and every deviation has been surfaced and resolved in the sketch.

## Phase E: Scrap when the architecture is wrong

If implementation keeps producing friction the sketch cannot absorb, throw the sketch out. Bolting fixes onto a wrong design compounds it (`principle-redesign-from-first-principles`, `principle-fix-root-causes`).

The signal is a _pattern_, not single instances. Tells:

- The same shape of workaround appearing repeatedly across unrelated code.
- Multiple unrelated edge cases that all need special-case branches.
- Types that need escape hatches (`any`, casts, optional fields always set in practice) to compile.
- The "we need a lock" reflex when the sketch said the state was not shared.
- Callers having to know the abstraction's internal rules to use it.
- Two or more independent Phase D deviations of the same shape.

Use judgement. A few edge cases do not condemn an architecture, some problems are legitimately complex, and complexity in the data is not complexity in the design.

When you scrap:

1. Re-run the `how` skill over what has been built.
2. Redesign as if the new constraints had been day-one assumptions (`principle-redesign-from-first-principles`).
3. Subtract before adding (`principle-subtract-before-you-add`): the new sketch starts smaller than the old one before it grows.
4. Return to Phase B and run `arena` again.

## Outputs

The caller's usage comes first and the type sketch derives from it. Small changes get one file with new types and signatures; larger work gets a module map plus type definitions. The rationale ships alongside, shaped per [`references/rationale-template.md`](references/rationale-template.md), including the usage sketch and the synthesis decision.
