# DATABASE.md

## Database Design
Use PostgreSQL with Prisma.

Core entities:
User, Restaurant, Outlet, Role, RestaurantUser, RestaurantTable, TableSession, MenuCategory, MenuItem, Addon, MenuItemAddon, Order, OrderItem, OrderItemAddon, KOT, KOTItem, Bill, Payment, InventoryItem, InventoryTransaction, Customer, AuditLog.

All restaurant-owned entities scoped by `restaurantId`. Outlet-specific entities scoped by `outletId`.

## Prisma Model Requirements
* Use UUID or cuid IDs, createdAt, updatedAt.
* Use appropriate indexes, unique constraints, foreign keys, enum types for statuses.
* Important indexes: `Order(outletId, createdAt)`, `Order(status)`, `Order(tableId, status)`, `KOT(outletId, status)`, `KOT(createdAt)`, `MenuItem(categoryId, isAvailable)`, `InventoryItem(outletId, isActive)`, `Payment(orderId, status)`, `Payment(createdAt)`.
* Use database transactions for: Order creation, KOT creation, Payment creation, Inventory updates, Order completion.

## Seed Data
Seed script should include:
* **Restaurant**: Demo Restaurant
* **Outlet**: Main Branch
* **Tables**: T1 through T8
* **Categories**: Starters, Main Course, Breads, Rice, Beverages, Desserts
* **Menu Items**: Create at least 20 realistic items.
* **Users**: admin@example.com, manager@example.com, cashier@example.com, kitchen@example.com.
