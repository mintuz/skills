# Testing Forms

## Controlled inputs

```tsx
it('should update input value as user types', async () => {
  const user = userEvent.setup();
  render(<SearchInput />);

  const input = screen.getByLabelText(/search/i);
  await user.type(input, 'react');

  expect(input).toHaveValue('react');
});
```

## Submissions

```tsx
it('should submit form with user input', async () => {
  const handleSubmit = vi.fn();
  const user = userEvent.setup();
  render(<RegistrationForm onSubmit={handleSubmit} />);

  await user.type(screen.getByLabelText(/name/i), 'Alice');
  await user.type(screen.getByLabelText(/email/i), 'alice@example.com');
  await user.type(screen.getByLabelText(/password/i), 'password123');
  await user.click(screen.getByRole('button', { name: /sign up/i }));

  expect(handleSubmit).toHaveBeenCalledTimes(1);
  expect(handleSubmit).toHaveBeenCalledWith({
    name: 'Alice',
    email: 'alice@example.com',
    password: 'password123',
  });
});
```

## Validation

This form validates synchronously on submit, so the errors are present directly after the click. When validation waits on a request, await the errors with `findByText`.

```tsx
it('should show validation errors for invalid input', async () => {
  const user = userEvent.setup();
  render(<RegistrationForm />);

  await user.click(screen.getByRole('button', { name: /sign up/i }));

  expect(screen.getByText(/name is required/i)).toBeInTheDocument();
  expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  expect(screen.getByText(/password is required/i)).toBeInTheDocument();
});
```
