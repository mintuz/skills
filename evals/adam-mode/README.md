# adam-mode evaluation

Behavioural scenarios plus invocation and exclusion checks. The `prechange/` snapshot records the minimal runnable new-skill baseline for RED provenance. Treatment reads the live source skill and its playbooks. Trigger fixtures are disposable copies refreshed by the repository runner. Scenario-only evaluation does not establish operational or cross-harness replay, and it does not exercise the `adam-agent` subagent.

Behavioural prompts run in `workspace/`; trigger discovery runs in `trigger-workspace/` to keep no-skill comparisons free of generated skill copies. `results.json` is gitignored local output recording per-case responses and grader reasons; verbose local logs and generated fixtures are ignored.

The skill's scripts have deterministic tests in `scripts/`. Each test builds a throwaway git repository in a temporary folder. Install [bats-core](https://github.com/bats-core/bats-core), then run them from the repository root:

```bash
bats evals/adam-mode/scripts
```

The prompt evaluation does not run the scripts. It checks only that the skill routes worktree and scope work through them.
