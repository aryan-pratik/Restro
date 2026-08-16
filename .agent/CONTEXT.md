# CONTEXT.md

## Current Session

Working on order creation.

## Relevant Files

src/services/order.service.ts
src/app/api/orders/route.ts
prisma/schema.prisma

## Current Problem

Order creation currently accepts client subtotal.

## Required Fix

Server must calculate subtotal from MenuItem prices.

## Investigation

MenuItem price is already stored in database.

## Next

Refactor OrderService.create().
