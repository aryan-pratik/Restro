# DOMAIN_MODEL.md

## Database Relationships
```
Restaurant
   ├── Users
   └── Outlets
         ├── Tables
         ├── MenuCategories
         │      └── MenuItems
         │             └── Addons
         ├── Orders
         │      ├── OrderItems
         │      ├── KOTs
         │      ├── Bill
         │      └── Payments
         ├── InventoryItems
         │      └── InventoryTransactions
         └── Customers
```

## Order State Machine
Implement explicit order states:
DRAFT → OPEN → KOT_SENT → PREPARING → READY → BILL_REQUESTED → BILLED → PARTIALLY_PAID → PAID → COMPLETED → CANCELLED

Do not allow arbitrary status changes.

## Inventory Logic
For MVP, keep inventory simple.
* Received stock: `InventoryTransaction` type = PURCHASE, quantity = +100
* Wasted stock: type = WASTE, quantity = -5
* Manually adjusted: type = ADJUSTMENT, quantity = ±X

Do not implement automatic ingredient deduction from recipes in the first iteration.
