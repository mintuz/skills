# Rationale template

The prose that ships alongside the type sketch. One page. Sentence-case headings, no boilerplate. Replace the italic notes with actual content.

## Problem

_One paragraph. What we are trying to do, and what about the existing system or constraints makes the shape non-obvious. If [Phase A](../SKILL.md#phase-a-ground-the-problem) surfaced constraints the design must honour (existing types to interoperate with, callers we cannot break, invariants that crossed our boundary), name them here so the reader sees the same constraints you saw._

## Usage (caller's view)

_Write this first, before the type sketch. Show the README or quickstart the consumer reads, plus two or three realistic call sites in their own code: what they import, what they call, what comes back. The type sketch in [Shape](#shape) is derived from this. The two must agree. When they diverge, reconcile the sketch to the usage, not the reverse. The caller's experience is the spec; the types serve it._

## Shape

_The recommended architecture. Data structures first, then how data flows through the signatures. Name the load-bearing decisions. State which invariants are encoded in types, where validation lives, and what the system deliberately does not do. Judge interface depth explicitly: state what complexity the public surface hides, what remains exposed to callers, and why the interface is no larger than needed. Cite the principle behind each decision (for example, `per principle-parse-at-the-boundary`) without restating it._

## Synthesis decision

_Copied from the synthesis note `arena` returns in [Phase B](../SKILL.md#phase-b-sketch): the base candidate and why, the judge's verdict or the missing-judge gap, each graft with its source candidate, each rejection with its reason, and the verification result._

## Tradeoffs accepted

_One bullet per tradeoff the chosen shape makes, in the form "we accept X in exchange for Y". Name anything a future reader might mistake for an oversight, including things that look like premature optimisation or premature simplification._

## Alternatives considered

_Required. Name at least one concrete alternative shape, with one line on why it lost. Judge each alternative on interface depth, not implementation simplicity alone: name the complexity it exposes to callers and the complexity it hides. Two or three alternatives belong here when the design space had real contenders. One is fine when the constraints forced the answer, with the conclusion phrased as "this was the only viable shape because...". List distinct shapes rather than flavours of the same shape. This section covers design alternatives the chosen shape considered and rejected; the Phase B candidates belong in the synthesis decision._

## Open questions and risks

_Things you noticed during the sketch that the human needs to weigh in on, and risks worth flagging before implementation starts. Phrase them as questions, not assertions, so the human's answer is the resolution rather than a comment._

## Next implementation step

_The first thing to build against the sketch, in one sentence: what you would start writing immediately after synthesis, after Phase C sign-off if a checkpoint was opted into, or once the user authorises implementation of a design-only sketch._
