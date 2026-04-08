# POST /api/auth/login

## Summary
Authenticate user and return JWT token.

## Auth
Public

## Request Body
```json
{
  "email": "daksh@example.com",
  "password": "secret123"
}
```

## Success Response
- Status: `200 OK`
- Body includes JWT token and user payload.
