# ARCHITECTURE.md

## Stack
Next.js, TypeScript, PostgreSQL, Prisma, Better Auth, Zod, Tailwind, shadcn/ui, TanStack Query, Recharts.

## UI Architecture
Create reusable components:
* `DataTable`, `StatCard`, `StatusBadge`, `Modal`, `ConfirmDialog`, `SearchInput`, `DateRangePicker`, `Pagination`, `EmptyState`, `LoadingState`, `ErrorState`, `MoneyDisplay`, `QuantityControl`.
* **POS-specific**: `TableCard`, `TableGrid`, `CategoryTabs`, `MenuItemCard`, `CartPanel`, `OrderItemRow`, `OrderSummary`, `PaymentModal`.
* **Kitchen**: `KOTCard`, `KOTItemRow`, `KitchenBoard`, `KOTStatusBadge`.

## Recommended Next.js Folder Structure
```
src/
├── app/
│   ├── (auth)/...
│   ├── (dashboard)/...
│   ├── api/...
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   ├── dashboard/, pos/, kitchen/, menu/, inventory/, reports/
├── lib/
│   ├── auth/, db/prisma.ts, validations/, calculations/, permissions/, utils/
├── services/
│   ├── order.service.ts, kot.service.ts, billing.service.ts, payment.service.ts, inventory.service.ts, report.service.ts
├── repositories/
│   ├── order.repository.ts, menu.repository.ts, inventory.repository.ts, payment.repository.ts
├── types/
└── constants/
```

## Business Logic Layer
Do not put business logic directly inside every API route.
Prefer: `route.ts` → `validation` → `service` → `repository / Prisma`

Example `POST /api/orders`:
authenticate user → verify outlet access → validate request with Zod → verify table → verify menu items → calculate prices → calculate taxes → create order → create order items → return response.
