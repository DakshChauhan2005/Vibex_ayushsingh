# PUT /api/services/:id

## Summary
Update an existing service.

## Auth
Bearer token required.

## Authorization
Owner provider of the service or admin.

## Path Params
- `id`: service ObjectId

## Request Body
Any subset of:
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "category": "updated-category",
  "price": 1500,
  "location": "Gurgaon"
}
```

## Success Response
- Status: `200 OK`
- Body includes updated service.
