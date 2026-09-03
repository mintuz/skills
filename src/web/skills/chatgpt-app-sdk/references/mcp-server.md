# Building MCP Servers

## Architecture Components

ChatGPT apps consist of three layers:

1. **MCP Server** - Defines tools and enforces auth
2. **Widget** - Renders in ChatGPT's iframe
3. **Model** - Decides when to invoke tools

## Implementation Steps

### 1. Register Widget Templates

Widget templates are MCP resources with `mimeType: "text/html+skybridge"`. Reference CDN-hosted assets:

```typescript
const CDN_BASE = process.env.WIDGET_CDN_URL || "http://localhost:5173";

server.registerResource(
  "kanban-widget",
  "ui://widget/kanban.html",
  {},
  async () => ({
    contents: [
      {
        uri: "ui://widget/kanban.html",
        mimeType: "text/html+skybridge",
        text: `
          <!DOCTYPE html>
          <html>
            <head>
              <link rel="stylesheet" href="${CDN_BASE}/widget.css" />
            </head>
            <body>
              <div id="root"></div>
              <script type="module" src="${CDN_BASE}/widget.js"></script>
            </body>
          </html>
        `,
      },
    ],
  })
);
```

**Environment configuration:**

- Local: `WIDGET_CDN_URL=http://localhost:5173` (Vite dev server)
- Production: `WIDGET_CDN_URL=https://cdn.example.com` (CDN base URL)

See [ui-components.md](./ui-components.md) for widget build configuration.

### 2. Describe Tools with Clear Contracts

Design tools around user intents with JSON schemas:

```typescript
server.registerTool(
  "kanban-board",
  {
    title: "Show Kanban Board",
    inputSchema: { workspace: z.string(), cursor: z.string().optional() },
    _meta: {
      "openai/outputTemplate": "ui://widget/kanban.html",
    },
  },
  async ({ workspace, cursor }, { authInfo }) => {
    // Resolve the account from verified auth, then authorise the workspace.
    const accountId = await resolveAccount(authInfo);
    await requireWorkspaceAccess(accountId, workspace);

    // Read only the page the board renders.
    const { tasks, total, nextCursor } = await database.getTaskPage({
      accountId,
      workspace,
      cursor,
      limit: 50,
    });

    return {
      structuredContent: {
        workspace,
        taskCount: total,
        columns: ["Todo", "In Progress", "Done"],
      },
      _meta: {
        initialData: { tasks, workspace, nextCursor },
      },
    };
  }
);
```

### 3. Return Layered Payloads

Responses include three components:

```typescript
{
  // What the model reads (concise)
  structuredContent: { /* model-readable data */ },

  // Optional narration
  content: [{ type: "text", text: "Narration" }],

  // Widget-only presentation data (never credentials or diagnostics)
  _meta: { /* data the widget needs */ }
}
```

For widget runtime and `window.openai` usage, see `./ui-components.md` and `./react-integration.md`.

## Best Practices

### Idempotent Handlers

The model or the widget may retry a tool call, and the server may restart between
attempts. Give every tool with a side effect an idempotency key that the caller
supplies and the server scopes: the authenticated account, the tool name, and a
stable request ID from the original user action. Store the key, a fingerprint of
the validated inputs, and the terminal result in the same durable store as the
effect, and write both in one transaction. Replay the stored result for the same
key and the same fingerprint. Return a conflict for the same key with a different
fingerprint. Pass the same key to any provider that accepts an idempotency key.

An in-memory map is not an idempotency store: it is lost on restart and is not
shared between instances. Never put a clock reading in the key, because a fresh
timestamp makes every retry look like a new request.

```typescript
async function handleCreateTask({ requestId, title }, { authInfo }) {
  const accountId = await resolveAccount(authInfo);
  const key = `${accountId}:create_task:${requestId}`;
  const fingerprint = hashInputs({ title });

  return database.transaction(async (tx) => {
    // A unique index on `key` makes concurrent duplicates lose the insert.
    const claimed = await tx.claimIdempotencyKey({ key, fingerprint });

    if (!claimed) {
      const record = await tx.getIdempotencyRecord(key);
      if (record.fingerprint !== fingerprint) throw new ConflictError(key);
      return record.result;
    }

    const result = await tx.createTask({ accountId, title });
    await tx.completeIdempotencyKey({ key, result });
    return result;
  });
}
```

### Trim Structured Content

Keep model-facing data concise. Send the widget the page it renders, not the whole
result set. See the payload boundary rule in [SKILL.md](../SKILL.md).

```typescript
return {
  // Model sees this (concise)
  structuredContent: {
    summary: "Found 150 tasks",
    topPriorities: tasks.slice(0, 3),
  },
  // Widget sees this: the authorised page plus display-only data
  _meta: {
    initialData: { tasks: page, nextCursor },
  },
};
```

### Error Handling

Return user-friendly errors with an opaque correlation ID; log diagnostics server-side:

```typescript
try {
  const data = await fetchData();
  return { structuredContent: data };
} catch (error) {
  const correlationId = crypto.randomUUID();
  console.error({ correlationId, error });

  return {
    content: [
      {
        type: "text",
        text: "Unable to load data. Please try again.",
      },
    ],
    _meta: {
      correlationId,
    },
  };
}
```

### Security

- Apply the payload boundary rule in [SKILL.md](../SKILL.md); `_meta` is widget-visible
- Enforce auth server-side
- Configure CSP via `openai/widgetCSP`
- Validate all tool inputs with schemas

### Template URIs

Cache-bust by changing URIs when making breaking changes:

```typescript
// Before: ui://widget/kanban.html
// After:  ui://widget/kanban-v2.html
```

### Deployment

Deploy behind HTTPS before connecting to ChatGPT. For local development, see [local-tunnel-setup.md](./local-tunnel-setup.md) to configure persistent Cloudflare Tunnels
