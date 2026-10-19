# Evaluation evidence

Date: 19 October 2026. Subject and judge: Astra Medium (`gpt-6-astra`, `openai:codex-sdk`, installed `codex`). One trial per case per run. Synthetic read-only scenarios test instruction behaviour, not product runtime.

New principle. Sources: upstream pstack `create-verification-skill` (Cleanup section and step 4) and `maintain-verification-skill` (live-pass invariants 2 and 3); also stated in repo `xcode-dev-loop` (pinned simulator shutdown, new result-bundle path per attempt).

| Case | Baseline | Treatment |
| --- | --- | --- |
| Teardown kills what the run started and keeps the proof | fail (did not confirm the screenshots and HAR still exist after teardown) | pass |
| A failed retry keeps its evidence and the user's devices | pass | pass |
| On a shared instance clean the residue, not the instance | fail (did not confirm the proof log still exists after cleanup) | pass |

| Stage | Result | Eval ID |
| --- | --- | --- |
| compare (RED + GREEN, first skill text) | baseline 1/3; treatment 3/3; 0 errors | eval-xQf-2026-10-19T10:54:06 |
| trigger | 2/2 (`skill-used` on a teardown-after-failed-run request; `not-skill-used` on a rerunnable-backfill request); 0 errors | eval-sgV-2026-10-19T10:56:17 |

No fix cycles and no provider errors. Trigger runs report rather than gate.
