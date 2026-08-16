# DECISIONS.md

## Decision 1: Single Source of Decision
All architectural choices, phase order, data schemas, and API contracts follow `AGENTS.md`, `docs/*.md`, and `.agent/*.md` as the single source of truth.

## Decision 2: Local Upload Service
Integrated a Next.js App Router route handler (`/api/upload`) saving to `public/uploads` for local file uploads, keeping external service setup zero-config for local development.

## Decision 3: Table Management & Session Flow (Phase 5)
Implemented `RestaurantTable` CRUD, status indicators (`AVAILABLE`, `OCCUPIED`, `RESERVED`, `CLEANING`), and `TableSession` lifecycle management (`openTableSession`, `closeTableSession`) with full REST API compliance per `docs/API.md`.

## Decision 4: Server Authoritative Pricing (Phase 6)
All POS price calculations (Subtotal, Tax, Total) are performed on the backend using `recalculateOrderTotal()` to prevent malicious payload modification. Prices are recorded historically into the `OrderItem` table at the moment of addition to guard against future menu price changes affecting historical orders.

## Decision 5: KOT Cascading Statuses (Phase 7)
In the MVP Kitchen Display System, updating a KOT status to `PREPARING` or `READY` automatically cascades that status back up to the parent `Order` so front-of-house staff can instantly view the kitchen's progress directly in the POS order view without manual synchronization.

## Decision 6: Immutable Bill Generation (Phase 8)
Bills are generated authoritatively on the server inside a database transaction (`$transaction`). The server does a final recalculation of all items before inserting the `Bill` record and updating the `Order` to `BILL_REQUESTED`. This freezes the transaction payload prior to payment capture.

## Decision 7: Atomic Payment & Table Release (Phase 9)
Processing a payment that meets or exceeds the Bill's Grand Total is handled as a single atomic `$transaction`. The system creates the `Payment` record, marks the `Order` as `COMPLETED`, closes the `TableSession`, and resets the `RestaurantTable` status to `AVAILABLE` simultaneously, ensuring the POS table grid never falls out of sync with paid orders.
