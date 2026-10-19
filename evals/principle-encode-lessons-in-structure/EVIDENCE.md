# Evaluation evidence

[Per-case results](validation-summary.json) record final source hashes, run IDs, scores, reasons, prior failures and limits. `upstream-before.md` is the pre-change fixture. Subject and judge used Astra Medium; one trial per case per run. Current configs load current source.

GREEN: 2/2. Comparison: 1/2 baseline → 2/2 treatment. Automated triggers: 2/2.

These are instruction-quality scenarios, not executed product behavior. Trigger workspaces are separate from baseline workspaces. Existing global host metadata was not hidden. Provider errors and inappropriate execution demands in hypothetical cases are retained separately from valid RED evidence.

Strict RED/gain limits remain in the JSON. The user accepted behavior-preserving ports with explicit evidence limits on 13 October 2026; that exception does not invent a failed pre-change test or a baseline gain.

[Principle validation](../../reports/skill-audit-2026-10-13/principle-validation.md) summarizes loader resolution, representative hypothetical behavior, and the two flagged trigger results. Most processes batched twelve explicitly named skills; final laziness replays used fresh single-skill processes.

## 19 October 2026: narrowed to verified recurrence

Change: a lesson recurs once the same failure or correction has happened twice (pstack `correct`); the guard must reject a real past failure; judgement-only lessons need one instruction plus a review criterion; added a `Distinct from:` line; description now names the recurrence threshold. New case "One occurrence is not yet a recurring lesson". Astra Medium subject and judge; no provider errors.

| Stage | Result | Evidence |
| --- | --- | --- |
| red (pre-change HEAD skill, new case, `--repeat 3`) | 0/3 passed | eval-08i-2026-10-19T11:12:27 |
| compare (`pnpm eval:skills`) | treatment 3/3; baseline 1/3 (failed the judgement case and the new case) | eval-rYD-2026-10-19T11:11:15 |
| trigger (`pnpm test:skills:triggers`) | 2/2 | eval-qBc-2026-10-19T11:14:03 |

`validation-summary.json` source hashes predate this change.
