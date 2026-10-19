# Framework Selection

Apply the compatibility gate in SKILL.md first. An app with a lower deployment target can use Foundation Models only conditionally: guard the feature with `#available(iOS 26, *)` and the runtime availability check. If the feature must work below the floor, Foundation Models cannot meet that promise, whatever the use cases below recommend.

## Foundation Models (Recommended Starting Point)

Apple's official on-device framework with simplified APIs.

### Use Foundation Models When:

- Building standard chat interfaces
- Need guided generation or tool calling with the system model
- Need built-in internationalization with language/locale checks
- Want simplified API with LanguageModelSession
- Prioritize ease of implementation
- Using the system on-device model provided by Apple

### Advantages:

- Optimized for Apple Silicon
- Simplified API with LanguageModelSession
- Built-in language/locale support via supportsLocale(_:)
- Official Apple framework with guaranteed support
- Automatic model downloading and availability checking

### Example Use Cases:

- Chatbots and assistants
- Q&A interfaces
- Content summarization
- Basic text generation

```swift
import FoundationModels

// Simple initialization
let model = SystemLanguageModel.default
guard model.isAvailable else { return }

let session = LanguageModelSession()
for try await snapshot in session.streamResponse(to: "Hello") {
    print(snapshot.content)
}
```

## MLX Swift (Advanced Use Cases)

Community-driven framework with more control and advanced features.

### Use MLX Swift When:

- Need tool calling with custom models or non-text modalities
- Working with Vision Language Models (VLMs)
- Implementing image generation
- Using custom models beyond Apple's registry
- Require fine-grained control over model behavior
- Need specialized model configurations

### Advantages:

- Tool use and function calling
- Vision Language Model support
- Image generation capabilities
- Custom model loading beyond registry
- More control over generation parameters
- Active community and examples

### Example Use Cases:

- AI agents with tool calling
- Image analysis and captioning (VLMs)
- Custom model deployment
- Image generation
- Text embeddings
- Structured data extraction

```swift
import MLXSwiftExamples

// Custom model loading
let config = ModelConfiguration(
    id: "qwen2.5-coder-7b-instruct-4bit",
    overrideTokenizer: "Qwen/Qwen2.5-Coder-7B-Instruct"
)

let model = try await LLMModelFactory.shared.loadContainer(
    configuration: config
)
```

## Decision Matrix

| Feature              | Foundation Models | MLX Swift  |
| -------------------- | ----------------- | ---------- |
| Ease of Use          | ⭐⭐⭐⭐⭐        | ⭐⭐⭐     |
| Standard Chat        | ⭐⭐⭐⭐⭐        | ⭐⭐⭐⭐   |
| Tool Calling         | ⭐⭐⭐⭐           | ⭐⭐⭐⭐⭐ |
| Vision Models        | ❌                | ⭐⭐⭐⭐⭐ |
| Image Generation     | ❌                | ⭐⭐⭐⭐⭐ |
| Custom Models        | ❌                | ⭐⭐⭐⭐⭐ |
| Internationalization | ⭐⭐⭐⭐⭐        | ⭐⭐⭐     |
| Documentation        | ⭐⭐⭐⭐⭐        | ⭐⭐⭐⭐   |
| Apple Support        | ⭐⭐⭐⭐⭐        | ⭐⭐⭐     |

## Quick Decision Flow

```
What do you need?

Standard chat interface
└── Foundation Models ✓ (only if the compatibility gate passes)

Tool/function calling
└── Foundation Models ✓ (system model)
    MLX Swift ✓ (custom models)

Vision Language Models (VLMs)
└── MLX Swift ✓

Image generation
└── MLX Swift ✓

Custom models not in registry
└── MLX Swift ✓

Multiple languages (i18n)
└── Foundation Models ✓ (easier)
    MLX Swift ✓ (manual)

Quick prototype
└── Foundation Models ✓
```

## Can I Use Both?

Yes: many apps use Foundation Models for standard chat and MLX Swift for advanced features.

```swift
// Foundation Models for chat
class ChatService {
    private let session = LanguageModelSession()
}

// MLX Swift for vision
class VisionService {
    private var vlm: VLMContainer?
}
```

## Migration Path

**Start with Foundation Models** → If you need advanced features → **Add MLX Swift**

If the support floor is iOS 26 and Apple Intelligence-capable devices, most apps should start with Foundation Models and add MLX Swift only for specific advanced features. If the feature must work below that floor, use MLX Swift or change the support contract.
