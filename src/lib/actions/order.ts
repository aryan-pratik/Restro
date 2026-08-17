"use server";

import { PrismaClient, OrderStatus, KOTStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { OrderItemSchema, UpdateOrderItemSchema } from "../validations/order";

const prisma = new PrismaClient();

async function getOutletId() {
  const outlet = await prisma.outlet.findFirst();
  if (!outlet) throw new Error("No outlet found in database.");
  return outlet.id;
}

export async function getOrCreateActiveOrder(tableId: string) {
  const outletId = await getOutletId();
  
  // Find table and its active session
  const table = await prisma.restaurantTable.findUnique({
    where: { id: tableId },
    include: {
      sessions: {
        where: { endedAt: null },
      },
    },
  });

  if (!table) throw new Error("Table not found");

  const session = table.sessions[0] || null;

  // Find active order for this table
  let order = await prisma.order.findFirst({
    where: {
      tableId,
      status: { notIn: ["COMPLETED", "CANCELLED"] },
    },
    include: {
      items: {
        include: {
          menuItem: true,
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  // If no active order, create one
  if (!order) {
    order = await prisma.order.create({
      data: {
        outletId,
        tableId,
        tableSessionId: session?.id,
        status: OrderStatus.DRAFT,
      },
      include: {
        items: {
          include: {
            menuItem: true,
          }
        },
      },
    });
  }

  return order;
}

async function recalculateOrderTotal(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: { menuItem: true },
      },
    },
  });

  if (!order) return;

  let subtotal = 0;
  let tax = 0;

  for (const item of order.items) {
    const itemTotal = item.unitPrice * item.quantity;
    subtotal += itemTotal;
    // Calculate tax based on tax rate of the menu item
    if (item.menuItem.taxRate) {
      tax += itemTotal * (item.menuItem.taxRate / 100);
    }
  }

  const grandTotal = subtotal + tax - order.discount + order.serviceCharge;

  await prisma.order.update({
    where: { id: orderId },
    data: {
      subtotal,
      tax,
      grandTotal,
    },
  });
}

export async function addOrderItem(orderId: string, data: z.infer<typeof OrderItemSchema>) {
  const parsed = OrderItemSchema.parse(data);

  // Authoritative price check
  const menuItem = await prisma.menuItem.findUnique({
    where: { id: parsed.menuItemId },
  });

  if (!menuItem) throw new Error("Menu item not found");
  if (!menuItem.isAvailable) throw new Error("Menu item is currently unavailable");

  // Check if item already exists in the order
  const existingItem = await prisma.orderItem.findFirst({
    where: {
      orderId,
      menuItemId: parsed.menuItemId,
    }
  });

  if (existingItem) {
    await prisma.orderItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: existingItem.quantity + parsed.quantity,
        notes: parsed.notes ? `${existingItem.notes ? existingItem.notes + ', ' : ''}${parsed.notes}` : existingItem.notes,
      },
    });
  } else {
    await prisma.orderItem.create({
      data: {
        orderId,
        menuItemId: parsed.menuItemId,
        quantity: parsed.quantity,
        unitPrice: menuItem.price, // Historical lock
        notes: parsed.notes,
      },
    });
  }

  await recalculateOrderTotal(orderId);
  revalidatePath(`/pos/table`);
}

export async function updateOrderItemQuantity(orderItemId: string, quantity: number) {
  const parsed = UpdateOrderItemSchema.parse({ quantity });

  const existing = await prisma.orderItem.findUniqueOrThrow({
    where: { id: orderItemId },
  });

  const item = await prisma.orderItem.update({
    where: { id: orderItemId },
    data: {
      quantity: parsed.quantity,
      // Never let kotQuantity exceed the new quantity (e.g. quantity reduced below what was already sent)
      kotQuantity: Math.min(existing.kotQuantity, parsed.quantity),
    },
  });

  await recalculateOrderTotal(item.orderId);
  revalidatePath(`/pos/table`);
}

export async function removeOrderItem(orderItemId: string) {
  const item = await prisma.orderItem.delete({
    where: { id: orderItemId },
  });

  await recalculateOrderTotal(item.orderId);
  revalidatePath(`/pos/table`);
}

export async function sendKOT(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
    },
  });

  if (!order) throw new Error("Order not found");
  if (order.items.length === 0) throw new Error("Cannot send empty KOT");

  // Only the quantity not yet sent to the kitchen goes into this KOT
  const pendingItems = order.items
    .map(item => ({ item, pendingQuantity: item.quantity - item.kotQuantity }))
    .filter(({ pendingQuantity }) => pendingQuantity > 0);

  if (pendingItems.length === 0) throw new Error("No new items to send to the kitchen");

  const outletId = await getOutletId();

  // Create KOT with only the newly added/increased items, and mark them as sent
  const kot = await prisma.$transaction(async (tx) => {
    const created = await tx.kOT.create({
      data: {
        outletId,
        orderId: order.id,
        status: KOTStatus.PENDING,
        items: {
          create: pendingItems.map(({ item, pendingQuantity }) => ({
            menuItemId: item.menuItemId,
            quantity: pendingQuantity,
          }))
        }
      }
    });

    for (const { item } of pendingItems) {
      await tx.orderItem.update({
        where: { id: item.id },
        data: { kotQuantity: item.quantity },
      });
    }

    return created;
  });

  // Update order status
  if (order.status === OrderStatus.DRAFT || order.status === OrderStatus.OPEN) {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.KOT_SENT },
    });
  }

  revalidatePath(`/pos/table`);
  return kot;
}
