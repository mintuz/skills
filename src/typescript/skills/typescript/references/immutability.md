# Immutability

## No Data Mutation Across a Boundary

Mutating a caller-owned value causes hard-to-trace bugs. Return a new value:

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

Mark properties `readonly` to prevent accidental mutation:

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

Never call a mutating array method on a caller-owned or already-returned array. Use the alternative:

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

The alternatives copy the array. For the local-accumulator exception (and why loops over large input need it), see SKILL.md "Building a collection in a hot path":

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

With 3+ parameters, use an options object:

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

Replace boolean flags with descriptive options:

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

Use early returns, not nested conditionals:

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
