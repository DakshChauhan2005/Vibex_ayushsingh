# POST /api/auth/register

## Summary
Register a new customer or provider account.

## Auth
Public

## Request Body
```json
{
  "name": "Daksh Sharma",
  "email": "daksh@example.com",
  "password": "secret123",
  "role": "provider",
  "location": "Delhi"
}
```

## Notes
- `role` is optional and only accepts `user` or `provider`.
- Password is hashed before storage.

## Success Response
- Status: `201 Created`
- Body includes JWT token and user payload.
