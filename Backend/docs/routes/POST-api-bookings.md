# POST /api/bookings

## Summary
Create a booking for a service.

## Auth
Bearer token required.

## Role Access
`user`

## Request Body
```json
{
  "serviceId": "661f5b0f8c4f98a67ef5f111",
  "date": "2026-05-02T10:30:00.000Z"
}
```

## Notes
- Prevents double booking for provider on same datetime when status is pending/accepted.

## Success Response
- Status: `201 Created`
- Body includes created booking.
