---
name: local-ai-models
description: >
  WHEN building, integrating, or evaluating on-device generative AI in Swift apps with Apple Foundation Models or MLX Swift for local LLMs, VLMs, embeddings, image generation, guided or structured output, tool calling, streaming, or multi-turn chat;
  NOT for cloud-only inference, generic Core ML models, or model training with no Apple-app integration;
  routes each feature through a verified runtime capability and proves availability, privacy, performance, and output on target hardware
---

# On-Device Generative AI for Swift

Use a **capability contract**: define the behavior and device constraints first, prove that the current runtime supports them, then implement only the selected branch.

## 1. Lock the capability contract

Record:

- task and modality: text, image input, image output, embedding, structured value, or tool action;
- conversation behavior: single turn, retained context, streaming, cancellation, and reset;
- input and output schemas, quality examples, failure thresholds, and safety constraints;
- target platforms, OS versions, devices, locales, and deployment environment;
- privacy and connectivity promises, including model downloads and any tool or telemetry traffic;
- storage, memory, context, latency, energy, and app-size budgets;
- unavailable-device, unsupported-locale, missing-model, and offline fallbacks.

Inspect the project before asking for these values. Reuse its deployment targets, package resolution, model owner, UI state flow, and test conventions.

**Complete when:** every requested feature has an observable output, a target device and OS, a resource budget, a data-flow promise, and a fallback.

## 2. Prove the live capability map

Read [framework selection](references/framework-selection.md), then verify the candidate against the installed SDK, the project's resolved package revision, and current primary documentation:

- [Foundation Models documentation](https://developer.apple.com/documentation/foundationmodels) and [updates](https://developer.apple.com/documentation/updates/foundationmodels);
- [MLX Swift](https://github.com/ml-explore/mlx-swift), [MLX Swift LM](https://github.com/ml-explore/mlx-swift-lm), and [MLX Swift examples](https://github.com/ml-explore/mlx-swift-examples).

Treat bundled code as a pattern, not API-version authority. Follow the symbols and platform requirements exposed by the project's resolved toolchain. Record any bundled example that conflicts with them.

Route each capability to the smallest branch that proves it:

| Capability | Read completely |
| --- | --- |
| Apple on-device system model, availability, locale, guided output, or tools | [Foundation Models setup](references/foundation-models/setup.md), then current Apple documentation |
| Foundation Models chat, streaming, cancellation, or multi-turn sessions | [Foundation Models chat patterns](references/foundation-models/chat-patterns.md) |
| Custom MLX text or vision model and package/model loading | [MLX Swift setup](references/mlx-swift/setup.md) |
| MLX text generation, chat, parameters, or model retention | [MLX Swift chat patterns](references/mlx-swift/chat-patterns.md) |
| MLX image or video understanding | [MLX Swift vision patterns](references/mlx-swift/vision-patterns.md) |
| MLX tools, embeddings, structured output, or batching | [MLX Swift advanced patterns](references/mlx-swift/advanced-patterns.md) |
| MLX image generation | Current [MLX Swift examples](https://github.com/ml-explore/mlx-swift-examples) |
| Model conversion or quantization | [MLX-LM quantization](references/mlx-swift/quantization.md) |

Choose Foundation Models only when the selected model and current OS satisfy the contract. Choose MLX Swift when the contract requires custom weights or MLX-specific control. Use both only when separate capabilities require separate runtimes.

**Complete when:** every capability maps to one verified runtime and version, every model source and license is known, and mixed-framework use has a requirement that one runtime cannot satisfy.

## 3. Implement the selected branch

Also read the shared reference that governs each changed concern:

| Concern | Read completely |
| --- | --- |
| Lifecycle, memory, generation, locale, or performance | [Best practices](references/shared/best-practices.md) |
| Availability, model loading, generation, tool, or decoding failures | [Error handling](references/shared/error-handling.md) |
| Unit, integration, performance, or device checks | [Testing](references/shared/testing.md) |

Keep one owner for each loaded model and one session per retained conversation. Load and generate with structured concurrency, propagate cancellation, and isolate UI mutation to the app's existing main-actor boundary. Load `app:swiftui-architecture` before changing SwiftUI state flow.

Check runtime availability before exposing the feature. Bound input, context, output, and concurrent work; release custom models when their lifecycle ends. Prefer the current framework's typed generation and tool APIs over parsing prompt-shaped JSON. Validate tool arguments, tool results, generated structures, downloaded model artifacts, and user-visible failure states at their trust boundaries.

Keep local data local: logging, analytics, downloads, and tool calls are separate data flows even when inference is on-device. Make each flow match the capability contract.

**Complete when:** the implementation builds against the resolved SDK and packages, owns model/session state for the intended lifetime, exposes cancellation and fallbacks, and has no unaccounted network or persistence path.

## 4. Verify on target hardware

Load `app:swift-testing` before adding or changing Swift tests. Run:

1. deterministic tests for app logic around a fake model boundary;
2. integration checks for availability, loading, streaming, cancellation, structured output, tools, and recovery used by the selected branch;
3. representative prompt and modality evaluations with pass criteria from the capability contract;
4. Release-device measurements for latency, peak memory, storage, energy-sensitive work, and first-run download behavior;
5. supported and unavailable device, OS, locale, connectivity, and model-state scenarios promised by the feature.

Test behavior rather than exact prose. Re-run prompt evaluations when the system model, OS, custom weights, tokenizer, quantization, or MLX package revision changes.

**Complete when:** every contract item has passing evidence on each promised target, every unavailable path reaches its fallback, and each unmet quality or resource threshold is reported against the affected model and version.

## Handoff

Report the chosen runtime and model, resolved SDK/package/model versions, model source and license, target devices and OS versions, data flows and fallbacks, changed files, build and test commands, device evaluation and resource results, and remaining blocked contract items.
