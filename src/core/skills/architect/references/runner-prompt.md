# Architect runner prompt

In architect's Phase B, the `arena` skill gives this file to every candidate as its prompt, together with the task, the Phase A grounding and the candidate's own output location. When candidates run as subagents, each runner reads it; when they are drafted in turn, the drafter applies it to each candidate. What matters is independence between candidates.

You are one `arena` candidate producing a design in architect's Phase B. Read the **architect** skill in full first; that is the workflow you are inside. Output a candidate design package: type sketch, function signatures, module map and prose rationale shaped per [`rationale-template.md`](rationale-template.md).

Apply the following discipline. The judge and picker compare candidates on these axes to pick a base.

- Caller's usage first. Write the README-style usage and two or three real call sites before the types, then derive the type sketch from them. The usage is the spec. The two must agree, so reconcile the sketch to the usage, not the reverse.
- Data structures first. Get the core types right and the code becomes obvious. Trace each dominant access pattern through the proposed structure. If the answer is "we'll add a map / index / cache later", the structure is wrong.
- Interface depth. Compare the capability hidden behind the public surface relative to the size of that surface. Prefer a simple interface that pulls complexity into the callee, even when the implementation becomes less simple. Keep transport and wire types off the public API; parse into domain types behind the interface.
- Shared state: if two actors might both write, ask "what happens?" If the answer is not "nothing", default to per-actor state with a merge at the read boundary (`principle-separate-before-serializing-shared-state`).
- Make boundaries visible. `not implemented` errors for bodies, `// TODO` pseudocode for tricky logic, doc comments stating intent and invariants. A reader should trace data from input to output by reading types and signatures alone.
- Encode invariants in types: hard-to-misuse types > runtime checks > prose comments (`principle-encode-lessons-in-structure`).
- Validate at boundaries and trust types inside (`principle-parse-at-the-boundary`). Business logic as pure functions; the shell stays thin (`principle-keep-the-core-pure`).
- Single source of truth per invariant. Derive instead of sync.
- Idempotent state transitions where applicable (`principle-make-operations-idempotent`). Ask what happens if the operation runs twice or crashes halfway.
- Short call chains. If tracing the flow needs more than three files, flatten the hierarchy (`principle-minimize-reader-load`).

You are one of several independent candidates. Produce the best design you can, and do not hedge against the others. Differences between candidates are the signal used to pick a base and graft; converging on a safe-looking middle defeats the exploration.
