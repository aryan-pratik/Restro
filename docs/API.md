# API.md

## API Structure
Use REST APIs through `app/api/**/route.ts`.

## Auth
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/session

## Restaurant APIs
GET  /api/restaurants, GET /api/restaurants/[id], POST /api/restaurants, PATCH /api/restaurants/[id]

## Outlet APIs
GET  /api/outlets, GET /api/outlets/[id], POST /api/outlets, PATCH /api/outlets/[id]

## Table APIs
GET /api/tables, POST /api/tables, GET /api/tables/[id], PATCH /api/tables/[id], DELETE /api/tables/[id]
POST /api/tables/[id]/open, POST /api/tables/[id]/close

## Menu APIs
Categories: GET, POST, PATCH, DELETE under /api/menu/categories
Items: GET, POST, GET [id], PATCH [id], DELETE [id] under /api/menu/items
Addons: GET, POST, PATCH, DELETE under /api/menu/addons

## Order APIs
GET /api/orders, POST /api/orders, GET /api/orders/[id], PATCH /api/orders/[id]
POST /api/orders/[id]/items, PATCH /api/orders/[id]/items/[itemId], DELETE /api/orders/[id]/items/[itemId]
POST /api/orders/[id]/send-kot, POST /api/orders/[id]/cancel, POST /api/orders/[id]/generate-bill

## KOT APIs
GET /api/kots, GET /api/kots/[id]
POST /api/kots/[id]/accept, POST /api/kots/[id]/start, POST /api/kots/[id]/ready, POST /api/kots/[id]/complete, POST /api/kots/[id]/cancel

## Payment APIs
GET /api/payments, POST /api/payments, GET /api/payments/[id]
POST /api/orders/[id]/payment, POST /api/payments/[id]/refund

## Inventory APIs
GET /api/inventory/items, POST /api/inventory/items, GET [id], PATCH [id]
GET /api/inventory/transactions, POST /api/inventory/transactions
POST /api/inventory/items/[id]/adjust

## Reports APIs
GET /api/reports/sales, GET /api/reports/orders, GET /api/reports/products, GET /api/reports/payments

## API Contract Discipline
For every endpoint define: Request schema (Zod), Response schema, Errors, Authentication requirement, Role requirement.

## Error Handling
Success: `{"success": true, "data": {}}`
Error: `{"success": false, "error": {"code": "ORDER_NOT_FOUND", "message": "Order not found"}}`
Use appropriate HTTP status codes (400, 401, 403, 404, 409, 422, 500).
