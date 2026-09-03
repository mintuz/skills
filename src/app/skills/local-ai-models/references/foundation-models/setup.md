# Foundation Models Setup

Setup guide for Apple's Foundation Models framework.

## Requirements

### Platform Requirements

Foundation Models requires iOS 26, iPadOS 26, or macOS 26 or later, and an Apple Intelligence-capable device with Apple Intelligence enabled. If the deployment target is lower than iOS 26, guard the feature with `#available(iOS 26, *)`. Always check availability at runtime and provide a fallback UI when unavailable.

## Framework Import

```swift
import FoundationModels
```

No package dependencies needed - Foundation Models is built into supported iOS versions.

## Checking Availability

ALWAYS check model availability before use. Each element of `streamResponse(to:)` is a snapshot whose `content` holds the cumulative partial response: assign it, do not append it.

```swift
let systemModel = SystemLanguageModel.default

// Simple availability check
guard systemModel.isAvailable else {
    print("Model not available")
    return
}

// Or detailed availability checking
switch systemModel.availability {
case .available:
    // Model ready to use
    print("Model is available")

case .unavailable(.modelNotReady):
    // Model not ready, for example still downloading
    print("Model not ready")

case .unavailable(.appleIntelligenceNotEnabled):
    // Apple Intelligence disabled in Settings
    print("Apple Intelligence not enabled")

case .unavailable(.deviceNotEligible):
    // Device doesn't support Apple Intelligence
    print("Device not eligible")

case .unavailable:
    // Other unavailability reason
    print("Model not available")
}
```

## SwiftUI Availability Handling

```swift
struct ChatAvailabilityView: View {
    @State private var isAvailable = false
    @State private var availabilityStatus: String = "Checking..."

    var body: some View {
        Group {
            if isAvailable {
                ChatInterface()
            } else {
                ContentUnavailableView(
                    "Model Not Available",
                    systemImage: "brain",
                    description: Text(availabilityStatus)
                )
            }
        }
        .task {
            // Check on view appear
            let systemModel = SystemLanguageModel.default
            isAvailable = systemModel.isAvailable

            if !isAvailable {
                switch systemModel.availability {
                case .unavailable(.modelNotReady):
                    availabilityStatus = "The model is not ready yet. Please try again later."
                case .unavailable(.appleIntelligenceNotEnabled):
                    availabilityStatus = "Please enable Apple Intelligence in Settings"
                case .unavailable(.deviceNotEligible):
                    availabilityStatus = "This device doesn't support on-device AI models"
                default:
                    availabilityStatus = "Model not available"
                }
            }
        }
    }
}
```

## Creating a Session

```swift
// Basic session creation
let session = LanguageModelSession()

// Note: Sessions use the system locale automatically.
// Use supportsLocale(_:) before prompting in a specific locale.
```

## Complete Setup Example

```swift
import SwiftUI
import FoundationModels

@Observable
class ChatService {
    private var session: LanguageModelSession?
    var isAvailable = false
    var isReady: Bool {
        isAvailable && session != nil
    }

    func initialize() async {
        // Check availability
        let systemModel = SystemLanguageModel.default
        isAvailable = systemModel.isAvailable

        guard isAvailable else {
            return
        }

        // Create session
        session = LanguageModelSession()
    }

    func send(_ message: String) async throws -> String {
        guard let session else {
            throw ChatError.sessionNotInitialized
        }

        let response = try await session.respond(to: message)
        return response.content
    }

    func sendStreaming(_ message: String) -> AsyncThrowingStream<String, Error> {
        AsyncThrowingStream { continuation in
            // Single-flight: no session, or the session is already responding.
            guard let session, !session.isResponding else {
                continuation.finish(throwing: ChatError.sessionNotInitialized)
                return
            }

            let task = Task {
                do {
                    for try await snapshot in session.streamResponse(to: message) {
                        continuation.yield(snapshot.content)
                    }
                    continuation.finish()
                } catch {
                    continuation.finish(throwing: error)
                }
            }
            // Consumer teardown cancels the producer task.
            continuation.onTermination = { _ in task.cancel() }
        }
    }
}

struct ChatApp: View {
    @State private var chatService = ChatService()

    var body: some View {
        Group {
            if chatService.isAvailable {
                ChatView(service: chatService)
            } else {
                UnavailableView()
            }
        }
        .task {
            await chatService.initialize()
        }
    }
}
```

## Privacy Considerations

Foundation Models runs entirely on-device:

- No data sent to servers
- No internet required (after initial model download)
- Full privacy and offline capability

No special privacy keys needed in Info.plist for basic chat.

## Device Testing

CRITICAL: Always test on physical devices.

**Recommended devices:**

- Test on Apple Intelligence supported devices
- Verify availability states on devices with Apple Intelligence disabled

## Common Issues

### "Model Not Available" Error

**Cause:** Device doesn't support models, Apple Intelligence not enabled, or model not ready yet

**Solution:**

```swift
// Always check before use
let systemModel = SystemLanguageModel.default
guard systemModel.isAvailable else {
    // Show error UI based on specific reason
    switch systemModel.availability {
    case .unavailable(.modelNotReady):
        // Model not ready, for example still downloading
        break
    case .unavailable(.appleIntelligenceNotEnabled):
        // Prompt user to enable in Settings
        break
    case .unavailable(.deviceNotEligible):
        // Device doesn't support
        break
    default:
        break
    }
    return
}
```

### App Crashes on Model Usage

**Cause:** Memory pressure in the app process. The system model runs outside the app process, so the crash usually points at the app's own memory use, not at the model.

**Solution:**

1. Read the crash or jetsam report and measure peak memory in Instruments on a physical device with a Release build
2. Reduce the app's own memory use (images, caches, transcript size) before you change entitlements
3. For a custom MLX model, the Increased Memory Limit entitlement may raise the limit on some devices; the app must still work correctly without it

### Slow Model Loading

**Cause:** First-time model download or model not ready

**Solution:**

```swift
// Check if model is not ready
let systemModel = SystemLanguageModel.default
if case .unavailable(.modelNotReady) = systemModel.availability {
    // Show loading UI
    ContentUnavailableView(
        "Model Not Ready",
        systemImage: "arrow.down.circle",
        description: Text("The model is not ready yet. It may still be downloading. Please try again later.")
    )
}
```

## Internationalization

Foundation Models has built-in language/locale support:

```swift
let model = SystemLanguageModel.default
let locale = Locale.current

guard model.supportsLocale(locale) else {
    // Provide a fallback UI or message
    return
}

// For best results outside U.S. English, include locale instructions.
let instructions = "The person's locale is \(locale.identifier)."
let session = LanguageModelSession(instructions: instructions)
```

Check Apple's documentation for current language support and handle unsupported locales by catching `LanguageModelSession.GenerationError.unsupportedLanguageOrLocale(_:)`.

## Next Steps

Once setup is complete, proceed to:

- [chat-patterns.md](chat-patterns.md) - Implement chat interfaces
- [../shared/best-practices.md](../shared/best-practices.md) - Optimization tips
- [../shared/error-handling.md](../shared/error-handling.md) - Error handling patterns
