---
name: local-ai-models
description: >-
  WHEN building iOS features on on-device models with Foundation Models or MLX Swift:
  local LLM inference, chat, Vision Language Models (VLMs), text embeddings, image
  generation, tool calling, multi-turn conversations, custom models, or structured
  generation; NOT for cloud-hosted model APIs, Core ML or coremltools model
  conversion, or Vision framework classifiers; returns framework selection,
  compatibility gates, session and streaming patterns, and device-proof
  verification plans.
---

# iOS On-Device AI Models

Production-ready guide for implementing on-device AI models in iOS apps using Apple's Foundation Models framework and MLX Swift.

## When to Use This Skill

- Implementing local LLM inference in iOS apps
- Building chat interfaces with Foundation Models
- Integrating Vision Language Models (VLMs)
- Adding text embeddings or image generation
- Implementing tool/function calling with LLMs
- Managing multi-turn conversations
- Optimizing memory usage for on-device models
- Supporting internationalization in AI features

## Core Principles

1. **Compatibility Gate** - Foundation Models requires iOS 26, iPadOS 26, or macOS 26 or later, and an Apple Intelligence-capable device with Apple Intelligence enabled. Compare this floor with the deployment target and with every device the feature must support before you select a framework. Always check `SystemLanguageModel.default.availability` at runtime before you create a session. Show a fallback UI for each unavailable state: `.modelNotReady` (model not ready, for example a download in progress), `.appleIntelligenceNotEnabled` (disabled in Settings), and `.deviceNotEligible` (hardware cannot run the model). A runtime check reports the state of one device. It cannot make the feature available on an OS version or device below the floor.
2. **Single-Flight Streaming** - Give one isolation boundary ownership of each conversation's session, transcript, and generation task. Do not call the session while `isResponding` is true; reject or queue the new send so that `GenerationError.concurrentRequests` never occurs in normal use. Stop and teardown cancel the owned task and await it before a new send starts. Check `Task.checkCancellation()` while you consume the stream. Commit a transcript turn only when the response completes.
3. **Session Persistence** - Reuse LanguageModelSession across completed turns and keep partial streaming text separate from committed history.
4. **Memory Awareness** - Use quantized models and monitor memory usage. iOS limits one app to a fraction of the device's total RAM. Reject any model whose weight files are about the size of, or larger than, the total RAM of the lowest-memory required device: it cannot load. Pick the smallest model that meets quality on that device and measure peak memory there. Give one `@Observable` owner the load state, the loaded model, and generation. For a multi-gigabyte download, ask for consent, default to Wi-Fi, make the download resumable, and keep the feature in an explicit "not downloaded" state until the files are complete.
5. **Async Everything** - Load models asynchronously, never block the main thread.
6. **Device Proof** - Before calling the design viable, exercise support boundaries and generation lifecycle in focused tests, then verify a Release build on the oldest or lowest-memory required physical device, including offline operation when the product promises on-device behavior.
7. **Locale Support** - Call `supportsLocale(_:)` for each user locale before you create a session. Treat an unsupported locale as an unavailable state; do not use a prompt instruction such as "answer in <language>" to work around it. For a supported locale, put the locale in the session instructions, not in each prompt. Test each locale branch on a physical device set to that locale.
8. **Typed Tools and Outputs** - For structured output, define a `@Generable` type and call `respond(to:generating:)`; do not parse free text with regular expressions. For an app action the model needs, implement the Foundation Models `Tool` protocol with `@Generable` arguments and pass the tool when you create the session. The session invokes the tool. The view never calls the service on the model's behalf. A tool error surfaces from the session call as `LanguageModelSession.ToolCallError`. Catch it and show the user a normal failure state; never crash or show an empty result.

## Quick Reference

### Framework Comparison

| Topic                              | Guide                                                       |
| ---------------------------------- | ----------------------------------------------------------- |
| Framework comparison and selection | [framework-selection.md](references/framework-selection.md) |

### Foundation Models (Apple's Framework)

| Topic                           | Guide                                                                               |
| ------------------------------- | ----------------------------------------------------------------------------------- |
| Setup and configuration         | [foundation-models/setup.md](references/foundation-models/setup.md)                 |
| Chat patterns and conversations | [foundation-models/chat-patterns.md](references/foundation-models/chat-patterns.md) |

### MLX Swift (Advanced Features)

| Topic                                    | Guide                                                                       |
| ---------------------------------------- | --------------------------------------------------------------------------- |
| Setup and configuration                  | [mlx-swift/setup.md](references/mlx-swift/setup.md)                         |
| Chat patterns with custom models         | [mlx-swift/chat-patterns.md](references/mlx-swift/chat-patterns.md)         |
| Vision Language Models (VLMs)            | [mlx-swift/vision-patterns.md](references/mlx-swift/vision-patterns.md)     |
| Tool calling, embeddings, structured gen | [mlx-swift/advanced-patterns.md](references/mlx-swift/advanced-patterns.md) |
| Model quantization with MLX-LM           | [mlx-swift/quantization.md](references/mlx-swift/quantization.md)           |

### Shared (Both Frameworks)

| Topic                           | Guide                                                           |
| ------------------------------- | --------------------------------------------------------------- |
| Best practices and optimization | [shared/best-practices.md](references/shared/best-practices.md) |
| Error handling and recovery     | [shared/error-handling.md](references/shared/error-handling.md) |
| Testing strategies              | [shared/testing.md](references/shared/testing.md)               |

## Quick Decision Trees

### Which framework should I use?

```
Is Foundation Models available on every OS version and device the feature
must support (iOS 26 or later, Apple Intelligence-capable hardware)?
├── No → Can a suitable MLX model meet the same device floor?
│   ├── Yes → MLX Swift (prove memory, latency, and output on that floor)
│   └── No → The requirements are infeasible; change the support contract
└── Yes → Do you need VLMs, image generation, or custom models?
    ├── Yes → MLX Swift (references/mlx-swift/)
    └── No → Foundation Models (references/foundation-models/)
```

### Where should I start?

```
New to on-device AI?
└── Start with Foundation Models:
    1. Read framework-selection.md
    2. Follow foundation-models/setup.md
    3. Implement foundation-models/chat-patterns.md

Need advanced features?
└── Use MLX Swift:
    1. Read framework-selection.md
    2. Follow mlx-swift/setup.md
    3. Choose pattern:
       - Chat: mlx-swift/chat-patterns.md
       - Vision: mlx-swift/vision-patterns.md
       - Advanced: mlx-swift/advanced-patterns.md
```

### Where should my model loading code live?

```
Is this model shared across features?
├── Yes → Create @Observable service in app/services/
└── No → Is it feature-specific?
    ├── Yes → Create @Observable class in feature/
    └── No → Load inline with @State (simple cases only)
```

### How should I handle conversations?

```
Foundation Models:
└── Reuse LanguageModelSession for context
    (references/foundation-models/chat-patterns.md #multi-turn)

MLX Swift:
└── Implement custom context management
    (references/mlx-swift/chat-patterns.md)
```

### What generation parameters should I use?

```
What's the use case?

Factual answers (summaries, facts)
└── temperature: 0.1-0.3

Balanced (chat, Q&A)
└── temperature: 0.6-0.8

Creative (storytelling, ideas)
└── temperature: 0.9-1.2

See references/shared/best-practices.md for details
```

## Resources

- [MLX Swift Examples](https://github.com/ml-explore/mlx-swift-examples)
- [Foundation Models Docs](https://developer.apple.com/documentation/foundationmodels)
- [Hugging Face Model Hub](https://huggingface.co/models)
- [MLX-LM Quantization](https://github.com/ml-explore/mlx-examples/tree/main/llms)
- [MLX Community Models](https://huggingface.co/mlx-community)
