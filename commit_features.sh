#!/bin/bash
set -e

# 1. Docs & Agents
git add AGENTS.md docs/ .agent/ .agents/ .claude/ skills-lock.json || true
git commit -m "docs: initialize agentic workflow and architecture documentation" || true

# 2. Config, UI, Global layout
git add package.json package-lock.json components.json .gitignore docker-compose.yml src/app/globals.css src/app/layout.tsx src/components/ src/lib/utils.ts || true
git commit -m "chore: setup project dependencies, UI library, and global layouts" || true

# 3. Database
git add prisma/ prisma.config.ts || true
git commit -m "feat(database): setup prisma schema and initial seed" || true

# 4. Auth
git add src/lib/auth/ src/lib/auth-client.ts src/middleware.ts src/app/\(auth\)/ src/app/api/auth/ || true
git commit -m "feat(auth): implement better-auth and middleware" || true

# 5. Menu Management
git add src/app/\(dashboard\)/menu/ src/lib/actions/menu.ts src/app/api/categories/ src/app/api/items/ || true
git commit -m "feat(menu): implement menu categories and items management" || true

# 6. Table Management
git add src/app/\(dashboard\)/tables/ src/lib/actions/table.ts src/app/api/tables/ || true
git commit -m "feat(tables): implement restaurant floor plan and session management" || true

# 7. POS & Orders
git add src/app/\(dashboard\)/pos/ src/lib/actions/order.ts src/app/api/orders/ || true
git commit -m "feat(pos): implement point of sale cart and order creation" || true

# 8. KDS
git add src/app/\(dashboard\)/kitchen/ src/lib/actions/kot.ts src/app/api/kots/ || true
git commit -m "feat(kds): implement kitchen display system and KOT workflow" || true

# 9. Billing
git add src/app/\(dashboard\)/orders/\[id\]/bill/ src/lib/actions/billing.ts src/app/api/orders/\[id\]/generate-bill/ || true
git commit -m "feat(billing): implement bill generation and invoice preview" || true

# 10. Payments
git add src/app/\(dashboard\)/orders/\[id\]/payment/ src/lib/actions/payment.ts src/app/api/orders/\[id\]/payment/ || true
git commit -m "feat(payment): implement payment capture and table release" || true

# 11. Catch-all for any remaining files (Dashboard skeleton, etc)
git add .
git commit -m "feat: complete MVP integration and dashboard skeleton" || true

# Setup remote and push
git remote add origin https://github.com/aryan-pratik/Restro.git || true
git branch -M main
git push -u origin main
