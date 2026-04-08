# POST /api/services

## Summary
Create a new service listing.

## Auth
Bearer token required.

## Role Access
`provider`, `admin`

## Headers
`Authorization: Bearer <jwt>`

## Request Body
```json
{
  "title": "AC Repair",
  "description": "Home AC installation and repair",
  "category": "home-services",
  "price": 1200,
  "location": "Noida"
}
```

## Success Response
- Status: `201 Created`
- Body includes created service.
