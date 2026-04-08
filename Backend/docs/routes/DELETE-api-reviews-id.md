# DELETE /api/reviews/:id

## Summary
Delete a review.

## Auth
Bearer token required.

## Authorization
Review owner or admin.

## Path Params
- `id`: review ObjectId

## Success Response
- Status: `200 OK`
- Body confirms deletion.
