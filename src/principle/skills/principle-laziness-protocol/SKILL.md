---
name: principle-laziness-protocol
description: "WHEN a change is growing abstractions, duplicated decisions or unnecessary work; NOT for skipping required checks or supported guarantees; chooses the least total work that satisfies the accepted outcome."
---

# Laziness protocol

Minimize the work needed for a correct, maintainable outcome, not just the diff's line count.

1. State the accepted behavior and the guarantees that must survive. Required checks are part of the job.
2. Check whether deletion, an existing mechanism or a direct change solves it. Preserve behavior before subtracting; avoid unrelated cleanup and speculative layers.
3. Give each shared decision one owner. Reuse an existing domain function and pass the result only where needed, rather than recomputing it or threading extra flags through unrelated layers.
4. Choose the smallest coherent change that meets the contract. More lines can be less work than a short patch that drops cancellation, errors or compatibility.
5. Run the required and risk-relevant checks once the change is ready. For a shared decision, cover allowed and denied outcomes and intentional caller differences. Repeat or broaden them when a new failure or uncertainty warrants it.

Done: the accepted outcome and supported behavior are verified with no unnecessary machinery. Saving effort never means silently lowering the agreed standard.
