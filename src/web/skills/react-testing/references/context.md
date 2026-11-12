# Testing Context

## Hook that needs a provider

```tsx
const { result } = renderHook(() => useAuth(), {
  wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
});

expect(result.current.user).toBeNull();

act(() => {
  result.current.login({ email: 'test@example.com' });
});

expect(result.current.user).toEqual({ email: 'test@example.com' });
```

## Multiple providers

```tsx
const AllProviders = ({ children }) => (
  <AuthProvider>
    <ThemeProvider>
      <RouterProvider>{children}</RouterProvider>
    </ThemeProvider>
  </AuthProvider>
);

const { result } = renderHook(() => useMyHook(), { wrapper: AllProviders });
```

## Component that needs a provider

If the project has a custom render helper for its providers, use it. Write one like this only when none exists.

```tsx
const renderWithAuth = (ui, { user = null, ...options } = {}) =>
  render(<AuthProvider initialUser={user}>{ui}</AuthProvider>, options);

it('should show user menu when authenticated', () => {
  renderWithAuth(<Dashboard />, { user: { name: 'Alice', role: 'admin' } });

  expect(screen.getByRole('button', { name: /user menu/i })).toBeInTheDocument();
});
```
