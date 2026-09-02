# Utility Types and Patterns

## Branded Types

### Prevent Primitive Obsession

Create distinct types for domain concepts:

```typescript
// Bad - easy to mix up
const processPayment = (userId: string, orderId: string, amount: number) => {
  // Could accidentally swap userId and orderId
};

// Good - compile-time safety
type UserId = string & { readonly brand: unique symbol };
type OrderId = string & { readonly brand: unique symbol };
type Amount = number & { readonly brand: unique symbol };

const createUserId = (id: string): UserId | null => {
  if (!id.startsWith("usr_")) return null;
  // SAFE: id matches the checked `usr_` prefix that defines UserId
  return id as UserId;
};

const createOrderId = (id: string): OrderId | null => {
  if (!id.startsWith("ord_")) return null;
  // SAFE: id matches the checked `ord_` prefix that defines OrderId
  return id as OrderId;
};

const createAmount = (value: number): Amount | null => {
  if (!Number.isFinite(value) || value < 0) return null;
  // SAFE: value is checked finite and non-negative, which is what Amount means
  return value as Amount;
};

type ProcessPaymentOptions = {
  userId: UserId;
  orderId: OrderId;
  amount: Amount;
};

const processPayment = (options: ProcessPaymentOptions) => {
  // Cannot accidentally swap - compiler will error
};
```

## Built-in Utility Types

```typescript
// Pick specific properties
type UserSummary = Pick<User, "id" | "email">;

// Omit specific properties
type CreateUserInput = Omit<User, "id" | "createdAt">;

// Make all properties optional
type UpdateUserInput = Partial<User>;

// Make all properties required
type CompleteUser = Required<User>;

// Make all properties readonly
type ImmutableUser = Readonly<User>;

// Extract return type of function
type FetchResult = ReturnType<typeof fetchUser>;

// Extract parameter types
type FetchParams = Parameters<typeof fetchUser>;

// Extract resolved type from Promise
type ResolvedUser = Awaited<ReturnType<typeof fetchUser>>;
```

## Custom Utility Types

```typescript
// Deep partial for nested objects
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Require specific properties
type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Make specific properties optional
type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Non-nullable
type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};
```

## Code Smells and Anti-Patterns

### Critical Issues (Must Fix)

| Smell                         | Problem                       | Solution                        |
| ----------------------------- | ----------------------------- | ------------------------------- |
| `any` type                    | Disables all type checking    | Use `unknown` or specific type  |
| Missing schema at boundary    | Invalid data can enter system | Add schema validation           |
| Type assertion without reason | Bypasses type safety          | Use schema or document why safe |
| `@ts-ignore`                  | Hides type errors             | Fix the type issue              |
| `interface` for data          | Wrong tool, can be extended   | Use `type`                      |
| Mutating a caller-owned array | Side effects, unpredictable   | Return a new array; mutate only a local accumulator you created |

### High Priority (Should Fix)

| Smell                 | Problem                      | Solution              |
| --------------------- | ---------------------------- | --------------------- |
| 3+ positional params  | Easy to swap, unclear        | Options object        |
| Boolean parameters    | Unclear at call site         | Descriptive options   |
| Missing `readonly`    | Accidental mutation possible | Add readonly          |
| Nested conditionals   | Hard to follow               | Early returns         |
| Implicit return types | Type changes go unnoticed    | Explicit return types |

### Style Improvements (Consider)

| Smell                  | Problem              | Solution                |
| ---------------------- | -------------------- | ----------------------- |
| Long type definitions  | Hard to read         | Extract named types     |
| Repeated type patterns | Duplication          | Create utility types    |
| Unclear type names     | Poor documentation   | Use descriptive names   |
| Missing discriminant   | Union not narrowable | Add discriminated union |
