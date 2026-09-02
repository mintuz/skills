# State Management

## State Categories

Divide state by usage rather than storing everything globally:

| State Type         | Description                     | Solution                 |
| ------------------ | ------------------------------- | ------------------------ |
| Component State    | Local to one component          | `useState`, `useReducer` |
| Application State  | Global UI state (modals, theme) | XState, Zustand, Context |
| Server Cache State | Data from API responses         | TanStack Query           |
| Form State         | User inputs and validation      | React Hook Form          |
| URL State          | Filters, search terms, page numbers | URL search params via the router |

URL state gives shareable links and browser back and forward history for free; a global store does not. Read and update the search params through the router, with no `useState` copy to keep in sync.

## Component State

Start local, lift only when needed:

```typescript
// ✅ Start with useState
const [isOpen, setIsOpen] = useState(false);

// ✅ Use useReducer when single action updates multiple values
type State = {
  status: "idle" | "loading" | "success" | "error";
  data: User | null;
  error: Error | null;
};

type Action =
  | { type: "loading" }
  | { type: "success"; data: User }
  | { type: "error"; error: Error };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "loading":
      return { status: "loading", data: null, error: null };
    case "success":
      return { status: "success", data: action.data, error: null };
    case "error":
      return { status: "error", data: null, error: action.error };
  }
};
```

## Server Cache State

Never store API data in global state stores. Use the project's data-fetching library (React Query or SWR) when it is installed. When the project has none and dependencies cannot change, keep request state local to the component and follow the async-effect rules in [useeffect.md](./useeffect.md).

```typescript
// ❌ Bad - API data in global store
const useStore = create((set) => ({
  users: [],
  fetchUsers: async () => {
    const users = await api.getUsers();
    set({ users });
  },
}));

// ✅ Good - React Query handles caching
const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => api.getUsers(),
  });
};
```

## State Placement Guidelines

1. **Start local** - Begin with component state
2. **Lift only when needed** - Move up only when sibling components need access
3. **Use Context for low-velocity data** - Theme, user info, feature flags
4. **Use atomic stores for high-velocity data** - Frequently changing values
5. **Never globalize prematurely** - Avoid putting everything in global state
