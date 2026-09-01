---
name: local-ai-models
description: Comprehensive guide for implementing on-device AI models on iOS using Foundation Models and MLX Swift frameworks. Use WHEN building iOS apps with (1) Local LLM inference, (2) Vision Language Models (VLMs), (3) Text embeddings, (4) Image generation, (5) Tool/function calling, (6) Multi-turn conversations, (7) Custom model integration, or (8) Structured generation.
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

1. **Compatibility Gate** - Before selecting a framework, verify current SDK/OS compile availability and runtime Apple Intelligence eligibility, model readiness, and locale support against authoritative SDK/platform sources and every required deployment target and device. Runtime availability checks cannot satisfy an incompatible deployment or device promise.
2. **Single-Flight Streaming** - Give one isolation boundary ownership of each conversation's session, transcript, and generation task. Queue or reject overlapping sends; Stop and teardown cancel and await that task, the stream checks cancellation, and only a completed response becomes a transcript turn.
3. **Session Persistence** - Reuse LanguageModelSession across completed turns and keep partial streaming text separate from committed history.
4. **Memory Awareness** - Use quantized models and monitor memory usage.
5. **Async Everything** - Load models asynchronously, never block the main thread.
6. **Device Proof** - Before calling the design viable, exercise support boundaries and generation lifecycle in focused tests, then verify a Release build on the oldest or lowest-memory required physical device, including offline operation when the product promises on-device behavior.
7. **Locale Support** - Use supportsLocale(_:) and locale instructions for Foundation Models.

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
Can Foundation Models compile for the required deployment target and run on
every device the feature promises to support?
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
