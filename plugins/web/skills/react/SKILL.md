---
name: react
description: "WHEN building React components, pages, or apps with JSX/TSX; NOT for non-React frontends or server-only code; creates feature-based folder structures, implements hooks and state management with React Query/Zustand, builds API integration layers, applies code splitting and memoization, and enforces component composition patterns."
---

# React Best Practices

Production-grade React development with feature-based architecture, type-safe state management, and performance optimization.

## Core Principles

1. **Easy to get started with** - Clear patterns that new team members can follow
2. **Simple to understand and maintain** - Readable code with obvious intent
3. **Clean boundaries** - Clear separation between features and layers
4. **Early issue detection** - Catch problems at build time, not runtime
5. **Consistency** - Same patterns throughout the codebase

## Quick Reference

| Topic                                | Guide                                                         |
| ------------------------------------ | ------------------------------------------------------------- |
| Directory layout and feature modules | [project-structure.md](./references/project-structure.md)     |
| Component design patterns            | [component-patterns.md](./references/component-patterns.md)   |
| Compound components (Card pattern)   | [compound-components.md](./references/compound-components.md) |
| State categories and solutions       | [state-management.md](./references/state-management.md)       |
| API client and request structure     | [api-layer.md](./references/api-layer.md)                     |
| Code splitting and optimization      | [performance.md](./references/performance.md)                 |
| useEffect guidance and alternatives  | [useeffect.md](./references/useeffect.md)                     |
| Testing pyramid and strategy         | [testing-strategy.md](./references/testing-strategy.md)       |
| Project tooling standards            | [project-standards.md](./references/project-standards.md)     |

## Canonical Feature Module

```
src/features/auth/
├── components/
│   └── LoginForm.tsx      # Feature-scoped component
├── hooks/
│   └── useAuth.ts         # Custom hook wrapping React Query
├── api/
│   └── auth.ts            # Schema → fetcher → hook
└── index.ts               # Public API (barrel export)
```

```tsx
// src/features/auth/api/auth.ts — schema-first API pattern
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

const UserSchema = z.object({ id: z.string(), email: z.string() });
type User = z.infer<typeof UserSchema>;

const getUser = async (id: string): Promise<User> =>
  api.get(`/users/${id}`).then((r) => UserSchema.parse(r.data));

export const useUser = (id: string) =>
  useQuery({ queryKey: ["user", id], queryFn: () => getUser(id) });
```

## Quick Reference: Decision Trees

### Where should this component live?

```
Is it used by multiple features?
├── Yes → src/components/
└── No → Is it specific to one feature?
    ├── Yes → src/features/[feature]/components/
    └── No → Colocate with the component that uses it
```

### What state solution should I use?

```
Is this data from an API?
├── Yes → React Query / SWR
└── No → Is it form data?
    ├── Yes → React Hook Form
    └── No → Is it URL state (filters, pagination)?
        ├── Yes → React Router
        └── No → Is it needed globally?
            ├── Yes → Zustand / Jotai / Context
            └── No → useState / useReducer
```

### Should I create a new feature folder?

```
Does this functionality have:
- Its own routes/pages?
- Its own API endpoints?
- Components not shared elsewhere?
├── Yes to 2+ → Create feature folder
└── Otherwise → Add to existing feature or shared
```

### Do I need useEffect?

```
Why does this code need to run?

"Because the component was displayed"
├── Is it synchronizing with an external system?
│   ├── Yes → useEffect is appropriate
│   └── No → Probably don't need useEffect
│
"Because the user did something"
└── Put it in the event handler, not useEffect

"Because I need to compute a value"
└── Calculate during render (or useMemo if expensive)

See useeffect.md for detailed guidance.
```
