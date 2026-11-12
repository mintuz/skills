# Testing React Components

## Rendered output

✅ **CORRECT:** test the behaviour.
```tsx
it('should display user name when provided', () => {
  render(<UserProfile name="Alice" email="alice@example.com" />);

  expect(screen.getByText(/alice/i)).toBeInTheDocument();
  expect(screen.getByText(/alice@example\.com/i)).toBeInTheDocument();
});
```

❌ **WRONG:** test internal state.
```tsx
const wrapper = mount(<UserProfile name="Alice" />);
expect(wrapper.state('name')).toBe('Alice');
```

## Callback props

```tsx
it('should call onSubmit when form submitted', async () => {
  const handleSubmit = vi.fn();
  const user = userEvent.setup();

  render(<LoginForm onSubmit={handleSubmit} />);

  await user.type(screen.getByLabelText(/email/i), 'test@example.com');
  await user.click(screen.getByRole('button', { name: /submit/i }));

  expect(handleSubmit).toHaveBeenCalledTimes(1);
  expect(handleSubmit).toHaveBeenCalledWith({ email: 'test@example.com' });
});
```

## Conditional rendering

This example uses an MSW `server`. Use the network stub the project already has.

```tsx
it('should show error message when login fails', async () => {
  server.use(
    http.post('/api/login', () =>
      HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    )
  );

  const user = userEvent.setup();
  render(<LoginForm />);

  await user.type(screen.getByLabelText(/email/i), 'wrong@example.com');
  await user.click(screen.getByRole('button', { name: /submit/i }));

  await screen.findByText(/invalid credentials/i);
});
```
