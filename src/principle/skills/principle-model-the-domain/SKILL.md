---
name: principle-model-the-domain
description: "WHEN invalid states or repeated domain rules complicate logic; NOT clear local transformations; represent invariants and ownership directly."
---

# Model The Domain

Represent legal states, transitions and ownership directly, so invalid states and scattered rules have nowhere to live.

Identify legal states, forbidden combinations, transitions, ownership and access patterns. Choose the smallest structure that expresses them: variants for alternatives, a transition model for lifecycle, a map for keyed lookup, a queue for ordered work.

Carry required data with its state: pending, failed(error), complete(receipt). Centralise transition rules instead of synchronising flags across consumers. Group repeated domain knowledge under one owner; execution phases alone do not define ownership.

Parse or migrate persisted and external representations into the model. Types cannot retroactively make stored invalid states valid.

Verify allowed and rejected transitions through the public behaviour, including restoration and failure. Keep boring local code when a proposed abstraction removes no invalid state, repeated rule or lifecycle risk. No framework is required.

Distinct from: `principle-type-system-discipline` (making the compiler enforce distinctions the model already names), `principle-parse-at-the-boundary` (untrusted or persisted data enters and must be validated), `principle-derive-from-one-owner` (one fact computed or stored in two places).

Done: each state carries its data; transitions are centralised; allowed and rejected transitions are tested.
