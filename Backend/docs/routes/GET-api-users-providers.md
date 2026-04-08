# GET /api/users/providers

## Summary
List all users with provider role.

## Auth
Public

## Query Params
- `location` (optional): filter providers by location (case-insensitive).

## Example
`/api/users/providers?location=delhi`

## Success Response
- Status: `200 OK`
- Body includes provider list.
