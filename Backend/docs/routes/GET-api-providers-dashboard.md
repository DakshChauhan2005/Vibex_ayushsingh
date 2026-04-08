# GET /api/providers/dashboard

## Summary
Get provider dashboard metrics.

## Auth
Bearer token required.

## Role Access
`provider`, `admin`

## Success Response
- Status: `200 OK`
- Body includes:
  - `totalBookings`
  - `totalEarnings`

## Earnings Rule
Counts bookings with status `accepted` and `completed`.
