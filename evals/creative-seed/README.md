# creative-seed evaluation

Behavioural scenarios plus invocation and exclusion checks. Treatment reads the live source skill. The skill is new, so the no-skill baseline is the RED record. Trigger fixtures are disposable copies refreshed by the repository runner. Scenario-only evaluation does not establish operational or cross-harness replay.

Behavioural prompts run in `workspace/`; trigger discovery runs in `trigger-workspace/` to keep no-skill comparisons free of generated skill copies. `results.json` is gitignored local output recording per-case responses and grader reasons; verbose local logs and generated fixtures are ignored.

The scenarios supply strings that `seed.sh` printed, because the prompt evaluation does not run the script. The script has deterministic tests in `scripts/`. Install [bats-core](https://github.com/bats-core/bats-core), then run them from the repository root:

```bash
bats evals/creative-seed/scripts
```
