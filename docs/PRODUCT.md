# PRODUCT.md

## 1. Product Goal

Build a restaurant management/POS system where a restaurant employee can:
1. Log in.
2. Select a restaurant/outlet.
3. Manage tables.
4. View table occupancy.
5. Create an order for a table.
6. Add menu items and quantities.
7. Add modifiers/add-ons.
8. Send the order to the kitchen as a KOT.
9. Track KOT/order status.
10. Generate a bill.
11. Apply taxes/discounts.
12. Accept payment.
13. Close the order/table.
14. Track inventory.
15. View sales and operational reports.
16. Manage menu items and categories.

The MVP should optimize for one complete happy-path workflow:
**Table → Order → KOT → Kitchen → Bill → Payment → Close Table**

## 2. User Roles

### Admin
Can:
* Manage restaurant, outlets, users, menu, tables, inventory
* View reports and payments

### Manager
Can:
* Manage orders, KOT, tables, menu, inventory
* View reports

### Cashier
Can:
* Create and modify orders
* Generate bills and accept payments
* Close orders
* View basic sales data

### Kitchen Staff
Can:
* View KOTs
* Change KOT status
* Mark items prepared
* Mark KOT completed

## 3. Main Application Flow

After authentication:
Login → Restaurant/Outlet Selection → Dashboard → POS → Tables → Select Table → Create/Open Order → Select Menu Items → Add Items → Review Order → Send KOT → Kitchen → Prepare Items → Order Ready → Generate Bill → Apply Discount/Tax → Payment → Order Completed → Table Available

## 4. Responsive Design

The primary application is desktop/tablet-oriented.
Optimize for:
* Desktop POS
* Tablet POS
* Kitchen display

Mobile support can be basic for the MVP.
