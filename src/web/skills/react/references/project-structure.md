# Project Structure

## Root Directory Layout

```
src/
├── app/           # Application layer (routes, providers, router)
├── assets/        # Static files (images, fonts)
├── components/    # Shared components used across features
├── config/        # Global configuration and environment variables
├── features/      # Feature-based modules (primary organization)
├── hooks/         # Shared custom hooks
├── lib/           # Pre-configured library instances
├── stores/        # Global state stores
├── testing/       # Test utilities and mocks
├── types/         # Shared TypeScript type definitions
├── utils/         # Shared utility functions
```

## Feature-Based Module Pattern

Each feature is a self-contained module:

```
src/features/payments/
├── api/           # API requests and data fetching hooks
├── components/    # Feature-specific components
├── hooks/         # Feature-specific custom hooks
├── stores/        # Feature state management
├── types/         # Feature TypeScript types
├── utils/         # Feature-specific utilities
└── index.ts       # Public API (what this feature exports)
```

**Include only the folders the feature needs.** A simple feature might have only `components/` and `api/`.

## Import Architecture

Enforce unidirectional code flow: **shared → features → app**

```
┌─────────────────────────────────────────────┐
│                    app/                      │
│         (composes features + shared)         │
└─────────────────────────────────────────────┘
                      ↑
┌─────────────────────────────────────────────┐
│                 features/                    │
│        (import from shared only)             │
│      ❌ Cannot import from other features    │
└─────────────────────────────────────────────┘
                      ↑
┌─────────────────────────────────────────────┐
│     shared (components, hooks, utils)        │
│           (no feature imports)               │
└─────────────────────────────────────────────┘
```

## ESLint Boundary Enforcement

```javascript
// eslint config
{
  rules: {
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          // One zone per feature: the feature may import from itself,
          // but not from any sibling feature (not even its index.ts)
          {
            target: './src/features/orders',
            from: './src/features',
            except: ['./orders']
          },
          {
            target: './src/features/customers',
            from: './src/features',
            except: ['./customers']
          },
          // features cannot import from app
          {
            target: './src/features',
            from: './src/app'
          },
          // shared code cannot import from features or app
          {
            target: ['./src/components', './src/hooks', './src/lib', './src/stores', './src/utils', './src/types', './src/config'],
            from: ['./src/features', './src/app']
          }
        ]
      }
    ]
  }
}
```

## Import Conventions

Use absolute imports with the `@/` alias:

```typescript
// ✅ Good - absolute imports
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth";
import { formatCurrency } from "@/utils/format";

// ❌ Bad - relative imports
import { Button } from "../../../components/ui/button";
```

Configure in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## File Naming

Use kebab-case for all files and folders:

```
src/
├── features/
│   └── user-profile/
│       ├── components/
│       │   ├── profile-header.tsx
│       │   └── profile-avatar.tsx
│       └── api/
│           └── get-user-profile.ts
```
