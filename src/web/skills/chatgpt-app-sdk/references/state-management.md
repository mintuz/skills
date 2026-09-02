# State Management

## Contents

- Three-Tier Architecture (Business Data, UI State)
- Best Practices (Don't Auto-Sync UI State)
- State Flow Diagram
- Common Patterns (Optimistic Updates, Syncing State, Form State)

## Three-Tier Architecture

### Business Data (Server-Owned)

- MCP server owns business data and diagnostics; responses expose only authorized data and opaque correlation IDs
- Widget sees updated data when tool call completes
- Reapply local UI state on top of snapshot

**When to use:**

- API/database data
- User records, transactions, content
- Any data that needs server-side validation

**Example:**

```typescript
// Server returns business data in structuredContent
{
  structuredContent: {
    tasks: [
      { id: 1, title: "Design homepage", status: "done" },
      { id: 2, title: "Build API", status: "in-progress" },
    ];
  }
}
```

### UI State (Widget-Scoped)

- Ephemeral UI interactions (selections, expansions, sort orders)
- Use `window.openai.widgetState` and `setWidgetState()`
- Or `useWidgetState` hook in React
- Treat widget state as model-visible context, not private client storage. It
  costs tokens on later turns. Keep it to identifiers and view preferences.
  Store answers, records, and file contents on the server and re-fetch them with
  a tool call. See the payload boundary rule in [SKILL.md](../SKILL.md).

**When to use:**

- Selected items in a list
- Expanded/collapsed sections
- Sort order, filter preferences
- Current tab or view mode

**Example:**

```typescript
// React component
const [uiState, setUiState] = useWidgetState({
  selectedTaskId: 2,
  sortBy: "status",
  expandedSections: ["completed"],
});
```

**For detailed hook implementation and patterns:** See [react-integration.md](./react-integration.md)

## Best Practices

### Don't Auto-Sync UI State

Widgets retain selections and view preferences when server data refreshes - this is intentional design

```typescript
// GOOD - UI state persists across data updates
const [tasks, setTasks] = useState(toolOutput.tasks);
const [selectedId, setSelectedId] = useWidgetState();

// When new data arrives, selection stays
useEffect(() => {
  setTasks(toolOutput.tasks);
  // selectedId remains unchanged
}, [toolOutput]);
```

## State Flow Diagram

```
User Action
    ↓
Widget Event Handler
    ↓
    ├─→ UI State Change → useWidgetState/setWidgetState
    │                      (selections, view preferences)
    │
    └─→ Business Logic → window.openai.callTool()
                             ↓
                        MCP Server Tool
                             ↓
                        Database/API Update
                             ↓
                        Return Fresh Snapshot
                             ↓
                        Widget Re-renders
                             ↓
                        Apply UI State on Top
```

## Common Patterns

### Optimistic Updates

Call the hook at the top level of the component. The handler closes over it.

```typescript
function TaskRow({ taskId }) {
  const [uiState, setUiState] = useWidgetState({ optimisticUpdate: null });

  async function handleToggleTask() {
    // 1. Update UI state immediately
    setUiState((prev) => ({ ...prev, optimisticUpdate: taskId }));

    // 2. Call server
    try {
      await window.openai.callTool("toggle_task", { taskId });
    } catch (error) {
      // 3. Revert on failure
      setUiState((prev) => ({ ...prev, optimisticUpdate: null }));
    }
  }

  return <button onClick={handleToggleTask}>Toggle</button>;
}
```

### Syncing Local and Server State

```typescript
function TaskList() {
  // Server data (from tool response)
  const toolOutput = useOpenAiGlobal("toolOutput");
  const tasks = toolOutput?.tasks ?? [];

  // UI state (persisted)
  const [uiState, setUiState] = useWidgetState({
    selectedId: null,
    sortBy: "status",
  });

  // Derived state
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (uiState.sortBy === "status") return a.status.localeCompare(b.status);
      return a.title.localeCompare(b.title);
    });
  }, [tasks, uiState.sortBy]);

  return (
    <div>
      {sortedTasks.map((task) => (
        <Task
          key={task.id}
          task={task}
          selected={uiState.selectedId === task.id}
        />
      ))}
    </div>
  );
}
```

**For more syncing patterns:** See [react-integration.md](./react-integration.md)

### Form State vs Widget State

```typescript
function EditTaskForm() {
  // Use local component state for form (uncontrolled)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  // Use widget state for form preferences (controlled)
  const [preferences, setPreferences] = useWidgetState();

  const handleSubmit = async () => {
    // Submit form data to server
    await window.openai.callTool("create_task", formData);

    // Persist form preferences
    setPreferences({
      ...preferences,
      defaultPriority: formData.priority,
    });
  };
}
```
