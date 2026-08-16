# SECURITY.md

## Pricing / Calculation Rules
Never trust subtotal, tax, discount, or total from the client.
The server should calculate: item subtotal + addons - discount + tax + service charge = grand total.
Store the final calculated values on the order/bill so historical bills do not change when menu prices change later.

## Authentication & Authorization
Use Better Auth. Every protected request should determine: user, restaurant, outlet, role, permissions.
Use helper functions: `requireAuth()`, `requireRole()`, `requireOutletAccess()`.

## Security Rules
Implement: authentication, authorization, restaurant isolation, outlet isolation, server-side validation, server-side price calculation, rate limiting, safe error messages, environment variables for secrets.
Never expose `DATABASE_URL`, auth secrets, API keys, private credentials to the browser.
