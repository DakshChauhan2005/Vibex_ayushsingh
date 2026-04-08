# PUT /api/users/profile

## Summary
Update logged-in user profile fields.

## Auth
Bearer token required.

## Headers
`Authorization: Bearer <jwt>`

## Request Body
```json
{
  "name": "Updated Name",
  "location": "Mumbai",
  "password": "newpassword123"
}
```

## Success Response
- Status: `200 OK`
- Body includes updated user profile.
