---
name: chatgpt-app-sdk
description: WHEN building, debugging, testing, or deploying a ChatGPT app with the Apps SDK and MCP; NOT for ordinary OpenAI API clients, standalone chat UIs, or generic MCP servers; traces each user intent through tools, server, optional UI, and observed ChatGPT behavior.
---

# ChatGPT Apps SDK

Treat each user intent as an end-to-end contract between conversation, model-selected tools, the MCP server, and optional UI. The conversation is the primary interface; add a component only when interaction or visual structure improves the outcome.

## 1. Establish the contract

Read the repository instructions, existing server and component code, installed MCP packages, and deployment configuration. List the user intents in scope and, for each one, record:

- the prompt or UI action that starts it;
- the tool, input, output, and side effect;
- whether text/structured data is sufficient or a component is justified;
- the authoritative owner of business, UI, and persisted user state;
- auth, confirmation, error, retry, and empty-state behavior;
- the observable result to verify.

**Complete when:** every requested intent has one traceable contract and every unresolved product decision is explicit.

## 2. Load the live contract

Apps SDK contracts evolve. Read the current official page for every branch the change touches:

| Branch | Current official reference |
|---|---|
| Baseline or first app | [Quickstart](https://developers.openai.com/apps-sdk/quickstart) |
| Tools, resources, payloads, CSP, or server state | [Build your MCP server](https://developers.openai.com/apps-sdk/build/mcp-server) |
| Component UI, bridge events, layout, or UI state | [Build your ChatGPT UI](https://developers.openai.com/apps-sdk/build/chatgpt-ui) |
| Portable UI or `window.openai` usage | [MCP Apps compatibility](https://developers.openai.com/apps-sdk/mcp-apps-in-chatgpt) |
| Authentication or authorization | [Authentication](https://developers.openai.com/apps-sdk/build/auth) |
| End-to-end verification | [Test your integration](https://developers.openai.com/apps-sdk/deploy/testing) |
| Submission or broad distribution | [App guidelines](https://developers.openai.com/apps-sdk/app-guidelines) |

Reconcile those contracts with the installed SDK version and existing app before editing. Prefer the MCP Apps standard form where an equivalent exists; use ChatGPT-specific extensions only for capabilities the app actually needs.

**Complete when:** every version-sensitive field, method, MIME type, and metadata key is supported by the live host contract and installed packages, or the required package change is explicit.

## 3. Shape the tool surface

Give each tool one user intent and a precise name, title, description, input schema, output schema, and truthful impact annotations. Keep required inputs explicit; memory and client hints are optional context, never authority.

Keep the surface composable:

- return concise, model-readable facts in `structuredContent`;
- use `content` for optional narration;
- place widget-only detail in `_meta`;
- keep handlers safe under retries;
- separate data tools from render tools when attaching UI to every call would remount the component or hinder model reasoning;
- restrict app-only tools with the current visibility metadata when the model should not select them.

**Complete when:** every intent maps to the smallest tool set that can complete it, and the model can distinguish each tool from its siblings using the descriptors alone.

## 4. Implement the server boundary

Register component templates with the current MCP Apps resource MIME type and connect render tools through the current resource URI metadata. Version a template URI when a breaking component change must bypass cached bundles.

Enforce schemas, authentication, authorization, and destructive-action confirmation on the server. Treat tool inputs, client hints, and model-visible context as untrusted. Keep secrets out of tool results and widget state; declare the narrow CSP and network domains the component needs.

**Complete when:** each contract runs from tool selection through authoritative server behavior to a schema-valid result, including failure and retry paths.

## 5. Implement the UI branch

When a component is justified, render from validated tool results and use the MCP Apps bridge for baseline host communication. Feature-detect `window.openai` extensions and keep the core flow functional without them unless the requested capability is ChatGPT-specific.

Keep business data server-owned, durable user data in authenticated backend storage, model-relevant context explicit, and transient view state inside the component. Preserve state deliberately across refreshes. Match the host theme and locale, support keyboard and screen-reader use, and choose the smallest display mode that fits the task.

**Complete when:** the component handles initial, loading, empty, success, error, approval, and refreshed-result states without becoming a second source of business truth.

## 6. Prove the conversation

Run the repository's smallest relevant checks, test the server with MCP Inspector, then exercise the app in ChatGPT developer mode. Cover:

- direct and paraphrased prompts for every intent;
- nearby prompts that should select another tool or no tool;
- missing, invalid, and unauthorized inputs;
- retries and repeated side-effecting requests;
- component rendering, CSP, bridge events, tool calls, and state refreshes;
- narration that remains useful with and without the component.

Record commands, results, and any unavailable environment check.

**Complete when:** every contract from step 1 has observed evidence, tool selection is unambiguous, side effects are guarded, and the text and component paths agree on the result.
