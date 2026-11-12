# Advanced React Testing Patterns

## Loading states

```tsx
it('should show loading then data', async () => {
  render(<UserList />);

  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  await screen.findByText(/alice/i);
  expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
});
```

## Error boundaries

Suppress `console.error` for the test, then restore it.

```tsx
it('should catch errors with error boundary', () => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

  render(
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <ThrowsError />
    </ErrorBoundary>
  );

  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  spy.mockRestore();
});
```

## Portals

Testing Library queries the entire document, so a portal needs no extra setup.

```tsx
it('should render modal in portal', () => {
  render(<Modal isOpen={true}>Modal content</Modal>);
  expect(screen.getByText(/modal content/i)).toBeInTheDocument();
});
```

## Suspense

```tsx
it('should show fallback then content', async () => {
  render(
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );

  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  await screen.findByText(/lazy content/i);
});
```
