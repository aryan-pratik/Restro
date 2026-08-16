# TESTING.md

## Testing Strategy
* **Unit tests**: price calculations, discount calculations, tax calculations, order totals, permission checks, status transitions.
* **Integration tests**: create order, send KOT, generate bill, payment, complete order.
* **End-to-end test**: Table → Order → KOT → Bill → Payment → Completion.

## Critical MVP Acceptance Test
The MVP is not considered complete until this exact scenario works:
1. Login as cashier.
2. Open POS.
3. Select Table 4.
4. Add: Paneer Tikka × 2, Butter Naan × 3, Coke × 2.
5. Add an addon.
6. Verify subtotal, tax, grand total.
7. Send KOT.
8. Login/view kitchen screen.
9. KOT appears.
10. Change: PENDING → ACCEPTED → PREPARING → READY → COMPLETED.
11. Return to POS.
12. Generate bill.
13. Choose UPI.
14. Record payment.
15. Order becomes PAID/COMPLETED.
16. Table becomes AVAILABLE.
17. Dashboard revenue increases.
18. Sales report contains the completed order.

Never mark a feature complete without verifying its critical behavior.
