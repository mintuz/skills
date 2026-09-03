# MSW Integration

**Mock Service Worker** for API-level mocking.

## Why MSW

**Network-level interception:**
- Intercepts requests at network layer (not fetch/axios mocks)
- Same mocks work in tests, Storybook, development
- No client-specific mocking logic
- Tests real request logic

```typescript
// ❌ WRONG - Mocking fetch implementation
vi.spyOn(global, 'fetch').mockResolvedValue({
  json: async () => ({ users: [...] }),
}); // Tight coupling, won't work in Storybook
```

```typescript
// ✅ CORRECT - MSW intercepts at network level
// Works in tests, Storybook, dev server
http.get('https://api.example.com/users', () => {
  return HttpResponse.json({ users: [...] });
});
```

## setupServer Pattern

**In test setup file:**

```typescript
// test-setup.ts
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

export const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

**In handlers file:**

```typescript
// mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('https://api.example.com/users', () => {
    return HttpResponse.json({
      users: [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ],
    });
  }),
];
```

## Per-Test Overrides

**Override handlers for specific tests:**

```typescript
it('should handle API error', async () => {
  // Override for this test only
  server.use(
    http.get('https://api.example.com/users', () => {
      return HttpResponse.json(
        { error: 'Server error' },
        { status: 500 }
      );
    })
  );

  // The application under test owns the request and the error branch
  document.body.innerHTML = '<div id="user-list"></div>';
  await mountUserList(document.getElementById('user-list'));

  await screen.findByText(/failed to load users/i);
});
```

**After test, `afterEach` resets to default handlers.**

**Two rules for this pattern:**

- Mount the real application code, so the assertion depends on how that code
  reads `response.ok`. A `fetch` call written inside the test renders the error
  branch for every response and would still pass against a 200.
- Match the URL the application actually requests. Here every handler and the
  application use `https://api.example.com/users`.
- Prefer absolute URLs in handlers under `msw/node`. A relative path resolves
  against the current origin, which jsdom supplies but a plain Node environment
  does not, so an absolute URL behaves the same in both.

## When Not to Use MSW

Use MSW when the test exercises the network boundary. When the component
receives its request function by injection, for example
`mountOrderForm({ submitOrder })`, pass a mock for that function instead. Adding
MSW there would mock a boundary the component does not cross.
