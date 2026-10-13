---
name: benchmark-checklist
description: WHEN validating a benchmark or measured performance claim; NOT for an unmeasured optimization guess; checks completed work, fairness and repeatability
---

# Benchmark checklist

Write the claim before measuring, then test its validity. Read the harness: what starts and stops timing, what completes inside it, and what it counts or omits. Use available platform tools and existing project harnesses; tool installation or interference with unrelated work is not implicit.

1. **Completed work and correctness.** Await/consume the real result inside the timed region and verify substantive outputs or side effects. Count failures, rejected responses, timeouts and retries; fast errors, lazy generators, discarded results and cached no-ops are not the intended work.
2. **Fair settings.** Compare equivalent data, versions, concurrency and production settings: release builds, batching, transactions, pools, indexes and the intended warm/cold cache state. Tune each option fairly before an adoption decision; unequal defaults compare configurations rather than intrinsic capability. An untuned side leaves that decision inconclusive.
3. **Limiter and plausibility.** Check host load and load-generator saturation. Profile CPU/I/O/runtime separately from reported timing, identify the bottleneck and map it to source where possible. Compare throughput with hardware limits and the changed component's share of total time. Removing a component that takes 10% of the run can reduce time by at most 10%, about 1.11× throughput; larger gains need explanation before reporting.
4. **Repeatability.** Run at least five times per side with balanced alternating/interleaved order. Keep conditions comparable when noise cannot be removed. Report the median and range; a gap smaller than ordinary run variation is not a demonstrated improvement. Use appropriate statistics or the harness's uncertainty analysis for close calls.
5. **Relevance.** Measure the user-visible end-to-end path with realistic workloads alongside a microbenchmark, and show the component's contribution. A local helper gain is not an equal whole-request gain.

For an explicitly requested one-run ballpark, completed work, correctness and error checks still apply; label the single run and scope. Choosing between options is a comparison, not a ballpark.

Lead the report with faster, slower, no measurable difference or inconclusive. Give units, workload/revision/environment, run count, median/range, limiter and limitations. A claimed difference without a known limiter, fair tuning or verified work/correctness remains inconclusive. Put supporting runs in a linked artifact when useful; never invent measurements or turn build-time counts into runtime proof.
