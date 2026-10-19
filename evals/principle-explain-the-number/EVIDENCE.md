# Evaluation evidence

[Per-case results](validation-summary.json) record final source hashes, run IDs, scores, reasons, prior failures and limits. `upstream-before.md` is the pre-change fixture. Subject and judge used Astra Medium; one trial per case per run. Current configs load current source.

GREEN: 2/2. Comparison: 0/2 baseline → 2/2 treatment. Automated triggers: 2/2.

These are instruction-quality scenarios, not executed product behavior. Trigger workspaces are separate from baseline workspaces. Existing global host metadata was not hidden. Provider errors and inappropriate execution demands in hypothetical cases are retained separately from valid RED evidence.

Strict RED/gain limits remain in the JSON. The user accepted behavior-preserving ports with explicit evidence limits on 13 October 2026; that exception does not invent a failed pre-change test or a baseline gain.

Most processes batched twelve explicitly named skills; final laziness replays used fresh single-skill processes.

## Narrowing, 2026-10-19

Restructured into three measurement classes (deterministic; experimental or evaluation; causal speed or capacity with a measured limiter) and pointed to `benchmark-checklist` for the benchmark procedure. Added case "An evaluation result needs repetitions, not a profiler" for the evaluation class. Description unchanged, so triggers were not rerun.

Astra Medium, one trial, no provider errors. Comparison `eval-jyP-2026-10-19T11:05:32`:

| Case | Baseline | Treatment |
| --- | --- | --- |
| A deterministic count needs provenance not a profile | fail | pass |
| A speedup may be skipped work | fail | pass |
| An evaluation result needs repetitions, not a profiler | pass | pass |
