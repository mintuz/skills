---
name: gauntlet-loop
description: WHEN a user asks for a Gauntlet Loop or relentless improvement of an ambitious artifact against a concrete, inspectable bar; NOT for routine changes with clear acceptance tests; coordinates separate builders and fresh critics until evidence supports stopping.
---

# Gauntlet Loop

Give a lead agent the destination and bar. Let it choose the route. Keep building and judging separate.

## 1. Set the bar

State the goal as an observable outcome while preserving the user's constraints. Use a supplied reference when it is inspectable; otherwise find or propose the strongest concrete comparison or measurement available and explain its relevance in one sentence.

Define how a critic can compare the real artifact with the bar:

| Artifact | Useful bar |
|---|---|
| Visual product | Rendered reference, screenshots, or interaction recording |
| Software system | Passing behavior, performance, recovery, or security checks |
| Writing | Reference passages plus factual and structural checks |
| Research | Source quality, coverage criteria, and reproducible calculations |

Name any resource limit and the allowed stop conditions. Exhaustion is a stopping reason, never evidence that the bar was met.

**Complete when:** the goal, inspectable bar, comparison method, and stop policy are explicit.

## 2. Split at judging seams

Inspect the task and current artifact, then divide only the important parts that can be built and judged independently. Keep tightly coupled parts together. Use one loop when decomposition adds no independent judgment.

Assign each part to a builder and reserve a separate critic context. Declare dependencies between parts so independent work can run in parallel without conflicting edits.

**Complete when:** every important part has a judging seam, an owner, and declared integration dependencies.

## 3. Build the artifact

Give each builder the goal, relevant bar and rules, and the actual inputs. Let the builder choose the implementation. Require it to produce or modify the real artifact and run the smallest checks needed to make that artifact inspectable.

The builder reports the artifact and evidence, not a quality verdict.

**Complete when:** every active part has an inspectable artifact and its checks or render path work.

## 4. Run the gauntlet

For each judging round, launch a fresh critic with only:

- the goal and relevant constraints;
- the bar and comparison method;
- the real artifact and raw evidence.

Withhold the builder's history, rationale, summaries, and claimed quality. Ask the critic to inspect the artifact itself, use a blind A/B comparison when practical, and return:

1. `WIN`, `LOSE`, or `UNJUDGEABLE`;
2. direct comparison evidence;
3. the single largest meaningful gap if the artifact loses.

On `LOSE`, send that gap to the builder, repair it, and use another fresh critic. On `UNJUDGEABLE`, repair the inspection path or sharpen the bar before changing the artifact. Freeze a part only on `WIN` or an explicit stop condition.

**Complete when:** every active part has fresh, artifact-level evidence and either wins or has exactly one next gap.

## 5. Converge

Repeat build and gauntlet rounds without choosing an arbitrary round count. Maintain a compact ledger:

| Part | Verdict | Evidence | Largest gap | Repair |
|---|---|---|---|---|

Stop a loop only when the artifact wins, the user stops it, the named resource limit is reached, or the remaining improvement is below the agreed materiality threshold. Record unmet gaps whenever a loop stops without winning.

For long unattended runs, maintain a lightweight progress artifact only when the user needs to observe evolution without interrupting the loop.

**Complete when:** every part has a terminal verdict or named stop reason, with no claimed win unsupported by comparison evidence.

## 6. Integrate and judge whole

Integrate completed parts and run the relevant whole-artifact checks. When separately improved parts conflict, use one fresh smoothing pass to resolve only integration inconsistencies. Then give a fresh critic the complete artifact and original bar.

**Complete when:** the integrated artifact has been inspected against the original bar, relevant checks pass, and every remaining gap or stop reason is explicit.

## Report

Lead with the whole-artifact verdict, bar, and direct evidence. List rounds per part, the largest gaps closed, verification results, unresolved gaps, and the exact reason for stopping.
