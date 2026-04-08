# DELETE /api/services/:id

## Summary
Delete a service listing.

## Auth
Bearer token required.

## Authorization
Owner provider of the service or admin.

## Path Params
- `id`: service ObjectId

## Success Response
- Status: `200 OK`
- Body confirms deletion.
