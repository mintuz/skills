# Evaluation evidence

Date: 19 October 2026. Subject and judge: Astra Medium (`gpt-6-astra`, `openai:codex-sdk`, installed `codex`). One trial per case per run. Synthetic read-only scenarios test instruction behaviour, not product runtime.

New principle, split from `principle-sequence-verifiable-units` (baseline inspection, dirty-state preservation, no automatic rebase, stash or reset). The serializer case moved here from that suite.

| Case | Baseline | Treatment |
| --- | --- | --- |
| A failing test fixed on trunk does not license stash and rebase | fail | pass |
| Addressing review does not include bringing a shared PR up to date | pass | pass |
| A serializer plan starts from the real base, not a rebase | fail | pass |

| Stage | Result | Eval ID |
| --- | --- | --- |
| RED + first treatment | baseline 1/3; treatment 2/3 (review case: skill forbade ordinary commits, so the plan withheld the authorised push); 0 errors | eval-snw-2026-10-19T10:47:16 |
| fix 1 | treatment 2/3 (trunk case: pre-existing failure not named as such, base update not tied to an explicit request); 0 errors | eval-OK4-2026-10-19T10:49:06 |
| fix 2 (GREEN) | treatment 3/3; 0 errors | eval-nTA-2026-10-19T10:50:39 |
| compare (final text) | baseline 1/3; treatment 3/3; 0 errors | eval-yh5-2026-10-19T10:51:27 |
| trigger | 2/2 (`skill-used` on a start-from-latest-main request; `not-skill-used` on a serializer unit-ordering request); 0 errors | eval-2VD-2026-10-19T10:53:26 |

Fixes changed skill text only: the forbidden list now matches the plan (stash, reset, rebase), base updates need an explicit request, and failures already on the base are reported as pre-existing. No provider errors occurred. Trigger runs report rather than gate.

## 2026-10-19 review fix

Removed force-push from step 2 and both rubrics (the plan forbids only an automatic stash, reset or rebase). Deleted step 4 (record the base, report pre-existing failures), the step 3 history-effect sentence and the Done clause about naming the base; these belong to `principle-capture-the-baseline` and `principle-label-the-evidence`. Removed the pre-existing-failure outcome from the case 1 rubric. The note above about pre-existing failures describes the earlier text.

- compare: baseline 1/3; treatment 3/3; 0 errors (eval-D5W-2026-10-19T12:28:59)
