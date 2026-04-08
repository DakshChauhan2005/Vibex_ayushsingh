# GET /api/services

## Summary
Fetch service list with filters, pagination, and sorting.

## Auth
Public

## Query Params
- `category` (optional)
- `location` (optional)
- `keyword` (optional)
- `minPrice` (optional)
- `maxPrice` (optional)
- `page` (optional, default `1`)
- `limit` (optional, default `10`)
- `sortBy` (optional: `price`, `rating`, `createdAt`)
- `order` (optional: `asc`, `desc`)

## Example
`/api/services?keyword=plumber&page=1&limit=10&sortBy=rating&order=desc`

## Success Response
- Status: `200 OK`
- Body includes services and pagination meta.
