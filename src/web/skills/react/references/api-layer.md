# API Layer

## Single API Client Instance

Configure once, reuse everywhere:

```typescript
// src/lib/api-client.ts
import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add interceptors for auth, error handling
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - logout, refresh token, etc.
    }
    return Promise.reject(error);
  }
);
```

## API Request Structure

Each API endpoint should have three parts. This example uses Zod and TanStack Query; use them only when the project already has them. Without them, keep the same three parts and write the hook with the async-effect rules in [useeffect.md](./useeffect.md).

```typescript
// src/features/users/api/get-user.ts
import { z } from "zod";
import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

// 1. Types and validation schemas
const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(["admin", "user"]),
});

type User = z.infer<typeof UserSchema>;

type GetUserParams = {
  userId: string;
};

// 2. Fetcher function
const getUser = async ({ userId }: GetUserParams): Promise<User> => {
  const response = await apiClient.get(`/users/${userId}`);
  return UserSchema.parse(response.data);
};

// 3. React Query hook
export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ["users", userId],
    queryFn: () => getUser({ userId }),
  });
};
```

## Benefits of This Pattern

- **Discoverability** - All API calls in predictable locations
- **Type safety** - Response typing flows through the app
- **Maintainability** - Types, fetchers, and hooks colocated
- **Testability** - Easy to mock at the fetcher level

## Error Handling

### API Error Interceptors

Handle errors globally at the API client level:

```typescript
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Cancellation is not an error to report. Reject it unchanged.
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    // Do not handle 403 here, not even with a toast. A 403 is the server's
    // answer to one action. Reject so the caller shows the failure where the
    // action happened.
    if (error.response?.status === 403) {
      return Promise.reject(error);
    }

    const message = error.response?.data?.message || "An error occurred";

    // Show toast notification
    toast.error(message);

    // Handle specific status codes
    if (error.response?.status === 401) {
      // Logout user or refresh token
      authStore.logout();
    }

    return Promise.reject(error);
  }
);
```

**403 handling:** A 403 from a user action (delete, update, submit) is a per-action result. The component that made the request renders it as a failed action. Do not redirect the whole app, clear the session, or log the user out for a per-action 403. Redirect only when a route-level access check fails on navigation.

### Error Boundaries

Use multiple error boundaries, not just one at the root:

```typescript
// ✅ Good - granular error boundaries
const App = () => (
  <RootErrorBoundary>
    <Layout>
      <Sidebar />
      <Main>
        <ErrorBoundary fallback={<DashboardError />}>
          <Dashboard />
        </ErrorBoundary>
      </Main>
    </Layout>
  </RootErrorBoundary>
);

// If Dashboard crashes, Sidebar stays functional
```

```typescript
// Error boundary component
import { Component, ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallback: ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error tracking service (e.g., Sentry)
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
```

## Security

### Authentication Token Storage

| Method          | Security | Persistence     | XSS Risk   |
| --------------- | -------- | --------------- | ---------- |
| Memory (state)  | Highest  | Lost on refresh | None       |
| HttpOnly Cookie | High     | Persistent      | None       |
| localStorage    | Low      | Persistent      | Vulnerable |

**Recommendation:** Use HttpOnly cookies when possible. If using localStorage, ensure robust XSS prevention.

### Input Sanitization

Always sanitize user inputs before rendering:

```typescript
// ❌ Dangerous - XSS vulnerability
const Comment = ({ content }: { content: string }) => (
  <div dangerouslySetInnerHTML={{ __html: content }} />
);

// ✅ Safe - escaped by default
const Comment = ({ content }: { content: string }) => <div>{content}</div>;

// ✅ If HTML needed, sanitize first
import DOMPurify from "dompurify";

const Comment = ({ content }: { content: string }) => (
  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />
);
```

### Authorization Patterns

Client permission checks are UX gating only. They decide whether to render or enable a control. They cannot stop a crafted HTTP request. The server must authenticate the actor and authorize each mutation for that actor and resource before it changes data, and it must return 403 with no change when the check fails. Mirror the server rule in the client predicate; never treat the client predicate as the rule.

**Role-Based Access Control (RBAC):**

```typescript
type Role = "admin" | "editor" | "viewer";

const PERMISSIONS = {
  admin: ["read", "write", "delete", "manage-users"],
  editor: ["read", "write"],
  viewer: ["read"],
} as const;

const hasPermission = (role: Role, permission: string): boolean => {
  return PERMISSIONS[role].includes(permission as any);
};

// Usage in components
const DeleteButton = () => {
  const { user } = useAuth();

  if (!hasPermission(user.role, "delete")) {
    return null;
  }

  return <button>Delete</button>;
};
```

**Permission-Based Access Control (PBAC):**

```typescript
// More granular - check specific resource ownership
const canDeleteComment = (user: User, comment: Comment): boolean => {
  return user.id === comment.authorId || user.role === "admin";
};
```
