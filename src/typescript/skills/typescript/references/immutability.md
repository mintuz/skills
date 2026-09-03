# Immutability

## No Data Mutation Across a Boundary

Mutation of a value a caller owns causes bugs that are hard to track. Return a new value instead:

```typescript
// Bad - mutates array
const addItem = (items: Item[], newItem: Item) => {
  items.push(newItem);
  return items;
};

// Good - returns new array
const addItem = (items: readonly Item[], newItem: Item): Item[] => {
  return [...items, newItem];
};

// Bad - mutates object
const updateUser = (user: User, email: string) => {
  user.email = email;
  return user;
};

// Good - returns new object
const updateUser = (user: User, email: string): User => {
  return { ...user, email };
};
```

## Use `readonly`

Mark properties as readonly to prevent accidental mutation:

```typescript
type User = {
  readonly id: string;
  readonly email: string;
  readonly roles: readonly string[];
};

// Utility for deep readonly
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};
```

## Mutating Array Methods

Never call a mutating array method on an array a caller owns, or on an array you have already returned. Use the alternative instead:

| Forbidden   | Alternative                                 |
| ----------- | ------------------------------------------- |
| `push()`    | `[...arr, item]`                            |
| `pop()`     | `arr.slice(0, -1)`                          |
| `shift()`   | `arr.slice(1)`                              |
| `unshift()` | `[item, ...arr]`                            |
| `splice()`  | `[...arr.slice(0, i), ...arr.slice(i + n)]` |
| `sort()`    | `[...arr].sort()`                           |
| `reverse()` | `[...arr].reverse()`                        |

### Exception: a local accumulator

The alternatives above copy the array. A function that builds a collection may create the array itself and `push` into it, then return it under a `readonly` type, because no caller can observe the mutation. Use this form for any loop over a large input: `[...accumulator, item]` inside a loop copies the accumulator on every step and makes the loop quadratic.

```typescript
// Good - local accumulator, O(n), no caller-visible mutation
const activeIds = (rows: readonly Row[]): readonly string[] => {
  const ids: string[] = [];
  for (const row of rows) {
    if (row.active) ids.push(row.id);
  }
  return ids;
};
```

## Function Parameters

### Options Objects Over Positional Parameters

When a function has 3+ parameters, use an options object:

```typescript
// Bad - positional parameters
const createUser = (
  email: string,
  name: string,
  role: string,
  department: string,
  manager?: string
) => {
  // Easy to swap arguments accidentally
};

// Good - options object
type CreateUserOptions = {
  email: string;
  name: string;
  role: UserRole;
  department: string;
  manager?: string;
};

const createUser = (options: CreateUserOptions) => {
  const { email, name, role, department, manager } = options;
  // Clear what each value represents
};
```

**Benefits:**

- Self-documenting at call site
- Order doesn't matter
- Easy to add optional parameters
- IDE autocomplete shows available options

### Boolean Parameters

Avoid boolean flags - use descriptive options instead:

```typescript
// Bad - what does `true` mean?
fetchUsers(true, false);

// Good - self-documenting
fetchUsers({
  includeInactive: true,
  sortDescending: false,
});
```

## Error Handling

### Result Types

Report a failure through the function's contract. A Result type suits an operation whose caller must handle several failure kinds:

```typescript
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

const parseConfig = (input: string): Result<Config, ParseError> => {
  try {
    const parsed = JSON.parse(input);
    const config = ConfigSchema.parse(parsed);
    return { success: true, data: config };
  } catch (e) {
    return {
      success: false,
      error: new ParseError("Invalid config format"),
    };
  }
};

// Usage with type narrowing
const result = parseConfig(input);
if (result.success) {
  // TypeScript knows result.data exists
  console.log(result.data);
} else {
  // TypeScript knows result.error exists
  console.error(result.error);
}
```

### Early Returns

Use early returns instead of nested conditionals:

```typescript
// Bad - nested conditionals
const processOrder = (order: Order) => {
  if (order) {
    if (order.items.length > 0) {
      if (order.status === "pending") {
        // Process order
      }
    }
  }
};

// Good - early returns
const processOrder = (order: Order | null) => {
  if (!order) return;
  if (order.items.length === 0) return;
  if (order.status !== "pending") return;

  // Process order - flat, readable code
};
```
