---
name: chatgpt-app-sdk
description: WHEN building ChatGPT apps using the OpenAI Apps SDK and MCP; NOT for OpenAI API chat completions, agent frameworks, or MCP servers with no ChatGPT widget; create conversational, composable experiences with proper UX, UI, state management, and server patterns.
---

# ChatGPT Apps SDK Best Practices

Build ChatGPT apps using the OpenAI Apps SDK, Model Context Protocol (MCP), and component-based UI patterns.

## Quick Reference

| Topic                                           | Guide                                                       |
| ----------------------------------------------- | ----------------------------------------------------------- |
| Display modes, visual design, accessibility     | [ui-guidelines.md](./references/ui-guidelines.md)           |
| MCP architecture, tools, and server patterns    | [mcp-server.md](./references/mcp-server.md)                 |
| React patterns and window.openai API            | [ui-components.md](./references/ui-components.md)           |
| React hooks (useOpenAiGlobal, useWidgetState)   | [react-integration.md](./references/react-integration.md)   |
| Three-tier state architecture and best practice | [state-management.md](./references/state-management.md)     |

## Critical Setup Requirements

| Issue               | Prevention                                            |
| ------------------- | ----------------------------------------------------- |
| CORS blocking       | Enable `https://chatgpt.com` origin on endpoints      |
| Widget 404s         | Use `ui://widget/` prefix format for widget resources |
| Plain text display  | Set MIME type to `text/html+skybridge` for widgets    |
| Tool not suggested  | Use action-oriented descriptions in tool definitions  |
| Missing widget data | Pass initial data via `_meta.initialData` field       |
| CSP script blocking | Reference external scripts from allowed CDN origins   |

## The Payload Boundary Rule

This section owns the rule for what may leave the server. Every other page in
this skill defers to it.

`structuredContent`, `content`, `_meta`, and widget state all reach the user's
browser. `_meta` is widget-visible transport, not a private channel: the model
does not read it, but the user can. Authorise and project on the server first,
then send only the projection the current view renders.

Keep server-side: credentials, records the signed-in user may not see, internal
fields the view does not render, raw diagnostics, stack traces, and technical
logs. Return safe error content with an opaque correlation ID for support cases.

Send the page or slice the view renders, not the whole result set. To show more,
return an opaque cursor or page argument and fetch the next page with another
tool call.

## Decision Trees

### What display mode should I use?

```
Is this a multi-step workflow or deep exploration?
├── Yes → Fullscreen
└── No → Is this a parallel activity (game, live session)?
    ├── Yes → Picture-in-Picture (PiP)
    └── No → Inline
        ├── Single item with quick action → Inline Card
        └── 3-8 similar items → Inline Carousel
```

### Where should state live?

```
Is this data from your API/database?
├── Yes → MCP Server (Business Data)
│   Return in structuredContent from tool calls
└── No → Is it user preference/cross-session data?
    ├── Yes → Backend Storage (via OAuth)
    └── No → Widget State (UI-scoped, model-visible)
        Use window.openai.widgetState / useWidgetState
```

Treat widget state as model-visible context, not private client storage: ChatGPT
carries it into the conversation, so it costs tokens on later turns and the user
can read it. Keep it to identifiers and view preferences, such as the selected
ID, current page, current step, and sort order. Never keep answers, records, file
contents, or credentials there; store those on the server and re-fetch them with
a tool call.

A widget runs only while ChatGPT renders it. It cannot run in the background,
wake up later, or act after the user leaves the conversation. Put scheduled work,
waiting, and outbound notifications on the MCP server or another system you
control, and let the next tool call report the result.

### Should this be a separate tool?

```
Is this action:
- Atomic and standalone?
- Invokable by the model via natural language?
- Returning structured data?
├── Yes → Create public tool (model-accessible)
└── No → Is it only for widget interactions?
    ├── Yes → Use private tool ("openai/visibility": "private")
    └── No → Handle within existing tool logic
```

### What should go in structuredContent vs \_meta?

```
Does the model need this data to:
- Understand results?
- Generate follow-ups?
- Reason about next steps?
├── Yes → structuredContent (concise, model-readable)
└── No → _meta (the authorised projection the widget renders)
```

Precomputed series, layout hints, and other display-only data belong in `_meta`,
because the model does not reason about them. Apply the payload boundary rule
above to both halves.

### Should I use custom UI or just text?

```
Does this require:
- User input beyond text?
- Structured data visualization?
- Interactive selection/filtering?
├── Yes → Custom UI component
└── No → Return plain text/markdown in content
```

# Official Documentation

- MCP Specification: https://modelcontextprotocol.io
- TypeScript MCP SDK: https://github.com/modelcontextprotocol/typescript-sdk
- OpenAI Apps SDK: https://developers.openai.com/apps-sdk
- MCP Apps Extension: http://blog.modelcontextprotocol.io/posts/2025-11-21-mcp-apps
- ChatGPT Component Library: https://openai.github.io/apps-sdk-ui
