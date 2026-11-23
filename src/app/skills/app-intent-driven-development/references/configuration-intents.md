# Widget and Control Configuration Intents

## `WidgetConfigurationIntent` (iOS 17+) and `ControlConfigurationIntent` (iOS 18 / macOS 26+)

- Configuration intents are **parameter-only schemas** for widget and Control Center pickers. The framework supplies a default `perform()` returning `Never` (which throws if invoked directly).
- **Do not implement `perform()` to load widget or control data:** WidgetKit resolves the configured `@Parameter` values and passes the intent struct directly to `AppIntentTimelineProvider` or the control's value provider without ever calling `perform()`.
- Implement `perform()` only if you intentionally reuse the exact same intent type as a runnable action outside widget/control configuration.

## Control Actions (`SetValueIntent`)

Separate Control configuration from Control interaction:

- Configuration schema: `ControlConfigurationIntent` (parameters only, no `perform()`).
- Toggle or value-change action: `SetValueIntent` with `@Parameter(title: "...") var value: Bool` and a real `perform()` that mutates the shared service.
