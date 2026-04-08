# GET /api/auth/me

## Summary
Get current authenticated user profile.

## Auth
Bearer token required.

## Headers
`Authorization: Bearer <jwt>`

## Success Response
- Status: `200 OK`
- Body includes current user data.
