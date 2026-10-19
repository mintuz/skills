# Evaluation evidence

[Per-case results](validation-summary.json) record final source hashes, run IDs, scores, reasons, prior failures and limits. `upstream-before.md` is the pre-change fixture. Subject and judge used Astra Medium; one trial per case per run. Current configs load current source.

GREEN: 2/2. Comparison: 1/2 baseline → 2/2 treatment. Automated triggers: 2/2.

These are instruction-quality scenarios, not executed product behavior. Trigger workspaces are separate from baseline workspaces. Existing global host metadata was not hidden. Provider errors and inappropriate execution demands in hypothetical cases are retained separately from valid RED evidence.

Strict RED/gain limits remain in the JSON. The user accepted behavior-preserving ports with explicit evidence limits on 13 October 2026; that exception does not invent a failed pre-change test or a baseline gain.

Most processes batched twelve explicitly named skills; final laziness replays used fresh single-skill processes.

## Rerun, 19 October 2026

Removed "Justify each control or option by a user need." (now carried by `principle-earn-every-element`) and added a Distinct-from line. The "A library consumer is a user" rubric dropped its "justifies exposed options by real consumer needs" clause, which moved with the rule to `evals/principle-earn-every-element`. Description unchanged, so triggers were not rerun. Treatment-only `pnpm test:skills` (Astra Medium, one trial per case), eval `eval-ups-2026-10-19T10:52:35`: "Observe actual states before polishing" PASS; "A library consumer is a user" PASS. Provider errors: 0. `validation-summary.json` source hashes predate this edit.
