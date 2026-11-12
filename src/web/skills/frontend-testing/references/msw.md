# MSW integration

Use this reference when the project already has MSW (Mock Service Worker). When the project stubs the network another way, use that stub and do not add MSW unasked.

MSW intercepts requests at the network layer instead of replacing `fetch` or `axios`. The same handlers work in tests, Storybook and development, need no client-specific mocking logic, and exercise the real request code.

```typescript
// ❌ Replaces the fetch implementation; tightly coupled, does not work in Storybook
vi.spyOn(global, 'fetch').mockResolvedValue({
  json: async () => ({ users: [...] }),
});

// ✅ Intercepts at the network layer
http.get('https://api.example.com/users', () => {
  return HttpResponse.json({ users: [...] });
});
```

## setupServer pattern

```typescript
// test-setup.ts
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

export const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

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

## Per-test overrides

Override a handler for one test with `server.use`. The `afterEach` call to `server.resetHandlers()` restores the defaults.

```typescript
it('shows an error when the API fails', async () => {
  // Override for this test only
  server.use(
    http.get('https://api.example.com/users', () => {
      return HttpResponse.json({ error: 'Server error' }, { status: 500 });
    })
  );

  // The application under test owns the request and the error branch
  document.body.innerHTML = '<div id="user-list"></div>';
  await mountUserList(document.getElementById('user-list'));

  await screen.findByText(/failed to load users/i);
});
```

- Mount the real application code, so that the assertion depends on how that code reads `response.ok`. A `fetch` call written inside the test renders the error branch for every response and still passes against a 200.
- Match the URL that the application requests. Here every handler and the application use `https://api.example.com/users`.
- Prefer absolute URLs in handlers under `msw/node`. A relative path resolves against the current origin, which jsdom supplies and plain Node does not; an absolute URL behaves the same in both.

## When not to use MSW

Use MSW when the test exercises the network boundary. When the component receives its request function by injection, for example `mountOrderForm({ submitOrder })`, pass a mock for that function instead. MSW there would stub a boundary that the component does not cross.
