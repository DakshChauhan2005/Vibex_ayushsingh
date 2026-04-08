# POST /api/reviews

## Summary
Create a review for a service.

## Auth
Bearer token required.

## Request Body
```json
{
  "serviceId": "661f5b0f8c4f98a67ef5f111",
  "rating": 5,
  "comment": "Great service and on-time"
}
```

## Notes
- One review per user per service.
- Requires completed booking for that service.

## Success Response
- Status: `201 Created`
- Body includes created review.
