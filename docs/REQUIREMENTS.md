# REQUIREMENTS.md

## Application Pages
* `/login`, `/register`, `/forgot-password` (Registration creates User, Restaurant, Outlet, Admin role)
* `/dashboard`
* `/pos`
* `/pos/table/[tableId]`
* `/menu`, `/menu/categories`, `/menu/items`, `/menu/items/new`, `/menu/items/[id]`, `/menu/addons`, `/menu/addons/[id]`
* `/kitchen`, `/kitchen/kot/[id]`
* `/orders/[id]/bill`, `/orders/[id]/payment`
* `/inventory`, `/inventory/items`, `/inventory/transactions`
* `/customers`, `/customers/[id]`
* `/reports`, `/reports/sales`, `/reports/orders`, `/reports/products`, `/reports/payments`

## Dashboard
* **Top KPIs**: Today's Revenue, Today's Orders, Average Order Value, Pending KOTs, Occupied Tables, Low Stock Items.
* **Charts**: Revenue by Hour, Day, Menu category.
* **Recent Orders**: Order #, Table, Customer, Amount, Payment Status, Order Status, Created At.
* **Quick Actions**: New Order, View Tables, Add Menu Item, Inventory, Reports.

## POS / Tables
Display restaurant tables visually (e.g., Table 1 - OCCUPIED - ₹820, Table 2 - EMPTY).
Statuses: AVAILABLE, OCCUPIED, RESERVED, CLEANING.
Clicking a table opens its current order.

## Order Creation Page (`/pos/table/[tableId]`)
Layout includes Categories, Menu Items, Current Order, Subtotal, Discount, Tax, Total, Send KOT, Save Order, Generate Bill.
Features: Search items, Filter by category, Add item, Adjust quantity, Remove item, Add notes/modifiers.

## Menu Management
* **Category**: id, name, description, displayOrder, isActive
* **Menu Item**: id, categoryId, name, description, price, imageUrl, isVeg, isAvailable, taxRate, sku, preparationTime, spicyLevel.
* **Modifiers / Add-ons**: Examples: Extra Cheese (+₹40). Relationship: MenuItem → MenuItemAddon → Addon.

## KOT System
* KOT creation includes KOT and KOTItem.
* KOT statuses: PENDING, ACCEPTED, PREPARING, READY, COMPLETED, CANCELLED.
* Kitchen screen displays cards with table, items, and status. Staff can update statuses.

## Billing
* Bill contains: Restaurant name, Outlet, Order number, Table, Date/time, Items (Qty, Rate, Amt), Subtotal, Discount, Tax, Grand Total.
* Support: Percentage Discount, Flat Discount, Tax, Service Charge.

## Payments
* Methods: CASH, CARD, UPI, OTHER.
* Statuses: PENDING, PARTIALLY_PAID, PAID, FAILED, REFUNDED.
* Flow: Generate Bill → Select Payment Method → Enter Amount → Confirm Payment → Payment Created → Order Paid → Table Released.

## Inventory
* **Item**: id, name, sku, unit, currentStock, minimumStock, costPerUnit, isActive.
* **Units**: KG, GRAM, LITRE, ML, PIECE, PACK.
* **Transactions**: PURCHASE, ADJUSTMENT, WASTE, SALE, RETURN.

## Customer Management
* Fields: id, name, phone, email, notes, createdAt.
* View: Total Orders, Total Spent, Average Order Value, Last Visit.

## Reports
* **Sales**: Total Revenue, Net Sales, Taxes, Discounts, Orders, AOV. Filters: Today, Yesterday, Last 7/30 Days, Custom.
* **Payment**: Group by Cash, Card, UPI, Other.
* **Product**: Best/Worst Selling Items, Revenue by Item, Quantity Sold.
