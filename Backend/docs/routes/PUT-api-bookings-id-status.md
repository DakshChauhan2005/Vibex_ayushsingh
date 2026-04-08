# PUT /api/bookings/:id/status

## Summary
Update booking status in lifecycle flow.

## Auth
Bearer token required.

## Role Access
`provider`, `admin`

## Path Params
- `id`: booking ObjectId

## Request Body
```json
{
  "status": "accepted"
}
```

## Allowed transitions
- `pending -> accepted`
- `pending -> rejected`
- `accepted -> completed`

## Success Response
- Status: `200 OK`
- Body includes updated booking.
