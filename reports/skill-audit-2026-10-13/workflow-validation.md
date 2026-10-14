# Workflow validation

The eight final skills passed **35/35 treatment cases** and **23/23 trigger checks**. Conservative comparison is **20/35 no-skill baseline → 35/35 treatment**, with 15 improved cases and no observed regressions. Promptfoo configuration checks passed; treatment and judge used `gpt-6-astra` at medium reasoning.

Native checks used one hypothetical, explicitly invoked scenario per skill: Claude Sonnet 5.5 medium and OMP Astra medium. “Observed” below means the representative response followed the principal contract after native loading. It does not establish runtime behavior, implicit activation across hosts, exhaustive portability, or operational cold replay.

| Skill | RED validity (passes/total) | Final GREEN | Conservative baseline → treatment | Triggers | Native Claude / OMP | Source SHA-256 prefix and evidence |
| --- | --- | --- | --- | --- | --- | --- |
| `create-verification-skill` | Valid, 3/4 | 4/4 | 1/4 → 4/4 | 3/3 | Skill loaded; observed / `skill://` loaded; observed | `237a0bed69cb` · [native](../../evals/create-verification-skill/native-results.json) |
| `blast-radius` | Valid calibrated replay, 3/4 | 4/4 | 1/4 → 4/4 | 3/3 | Skill loaded; residual overclaim / `skill://` loaded; qualified risks | `e6c0f60b27fc` · [native](../../evals/blast-radius/native-results.json) |
| `how` | Valid, 4/5 | 5/5 | 4/5 → 5/5 | 3/3 | Skill loaded; observed / `skill://` loaded; observed | `70ef0f2af537` · [native](../../evals/how/native-results.json) |
| `why` | Valid, 4/5 | 5/5 | 5/5 → 5/5 | 3/3 | Skill loaded; observed / `skill://` loaded; observed | `024dc38a3f3d` · [native](../../evals/why/native-results.json) |
| `benchmark-checklist` | Unmet: upstream 5/5 | 5/5 | 4/5 → 5/5 | 3/3 | Skill loaded; observed / `skill://` loaded; observed | `0169e8efdef2` · [native](../../evals/benchmark-checklist/native-results.json) |
| `correct` | Valid, 3/4 | 4/4 | 2/4 → 4/4 | 3/3 | Skill loaded; observed / `skill://` loaded; observed | `17e6d698f839` · [native](../../evals/correct/native-results.json) |
| `recall` | Valid, 3/4 | 4/4 | 2/4 → 4/4 | 3/3 | Skill loaded; observed / `skill://` loaded; observed | `e83765cc5c04` · [native](../../evals/recall/native-results.json) |
| `design-handover` | Valid minimal fixture, 1/4 | 4/4 | 1/4 → 4/4 | 2/2 | Manual slash expanded; observed / `skill://` loaded; observed | `b1c06b8f0e6a` · [native](../../evals/design-handover/native-results.json) |

Native evidence links remain. Per-case Promptfoo `results.json` files are gitignored local output and are not committed. Native copies and source directories matched their recorded file hashes. Seven prechange fixtures come from upstream commit `dbf49813a39c1a5389c5e28cb8e4c1c2379e2454`; design-handover used a minimal new-skill fixture.

- **Why:** the no-skill comparison tied at 5/5. Its upstream portability failure supplied RED, but this comparison demonstrates no gain over the no-skill baseline.
- **Benchmark:** upstream already passed all five cases. This is a concise preservation rewrite; the strict RED gate remains unmet. Its comparison gain is against no skill, not against upstream.
- **Handover:** the grader scored the baseline 0/4. The exclusion response correctly stayed with spacing/alignment and declined handover; its failure is disputed and conservatively counted as a pass (1/4). Raw grades and the manual review remain linked. Claude correctly rejected model-driven invocation first; a separate user `/design-handover` command expanded the installed skill and produced the representative response without a file-read bypass.
- **Blast radius:** earlier overstrict test grades were retained but excluded; a calibrated upstream replay still failed a material mobile ownership/device-proof case. Native Claude initially asserted a persisted-key change from ambiguous “renames persisted” wording. A fresh replay explicitly limited the change to a Swift property; it inspected encoding assumptions conditionally, but still inferred unsupplied fresh/current-format details from the simulator save. Both responses remain recorded. OMP explicitly required inspecting coding keys before concluding the encoded key changed, despite an overbroad opening sentence. These are behavioral limits, not loader failures; no claim of an entirely clean native sweep is made.

Operational provider errors and the initial judge's demand for execution in plan-only scenarios are preserved but excluded from behavioral RED. Trigger fixtures were isolated from behavior workspaces before comparison. This report covers instruction and discovery evidence only; runtime verification is separate.
