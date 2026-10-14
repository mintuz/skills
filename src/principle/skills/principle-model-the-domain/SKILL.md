---
name: principle-model-the-domain
description: "WHEN invalid states or repeated domain rules complicate logic; NOT clear local transformations; represent invariants and ownership directly."
---

# Model The Domain

Identify legal states, forbidden combinations, transitions, ownership and access patterns. Choose the smallest structure that expresses them: variants for alternatives, a transition model for lifecycle, a map for keyed lookup, a queue for ordered work.

Carry required data with its state: pending, failed(error), complete(receipt). Centralize transition rules instead of synchronizing flags across consumers. Group repeated domain knowledge under one owner; execution phases alone do not define ownership.

Parse or migrate persisted and external representations into the model. Types cannot retroactively make stored invalid states valid.

Verify allowed and rejected transitions through the public behavior, including restoration and failure. Keep boring local code when a proposed abstraction removes no invalid state, repeated rule or lifecycle risk. No framework is required.
