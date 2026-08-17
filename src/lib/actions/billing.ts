"use server";

import { PrismaClient, OrderStatus, PaymentMethod, PaymentStatus, TableStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function generateBill(orderId: string) {
  // First, verify the order
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: { menuItem: true },
      },
    },
  });

  if (!order) throw new Error("Order not found");
  if (order.status === OrderStatus.BILLED || order.status === OrderStatus.PAID || order.status === OrderStatus.COMPLETED) {
    throw new Error("Order is already billed or completed");
  }
  if (order.items.length === 0) {
    throw new Error("Cannot generate a bill for an empty order");
  }

  // Recalculate totals to be absolutely sure before locking the Bill
  let subtotal = 0;
  let tax = 0;

  for (const item of order.items) {
    const itemTotal = item.unitPrice * item.quantity;
    subtotal += itemTotal;
    if (item.menuItem.taxRate) {
      tax += itemTotal * (item.menuItem.taxRate / 100);
    }
  }

  // Assuming discounts and service charges might be applied later, but for MVP they are 0
  const discount = order.discount;
  const serviceCharge = order.serviceCharge;
  const grandTotal = subtotal + tax - discount + serviceCharge;

  // 1. Create the immutable Bill record
  // 2. Update Order status
  // 3. Update the Order totals (just in case they were out of sync)
  const [bill] = await prisma.$transaction([
    prisma.bill.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        subtotal,
        discount,
        tax,
        serviceCharge,
        grandTotal,
      },
      update: {
        subtotal,
        discount,
        tax,
        serviceCharge,
        grandTotal,
      }
    }),
    prisma.order.update({
      where: { id: orderId },
      data: {
        subtotal,
        tax,
        grandTotal,
        status: OrderStatus.BILL_REQUESTED,
      },
    }),
  ]);

  revalidatePath(`/pos/table`);
  revalidatePath(`/orders/${orderId}/bill`);

  return bill;
}

// Captures the payment mode + settlement amount up front, then generates the bill
// and records the payment in one transaction (POS "Settle & Generate Bill" flow).
export async function settleAndGenerateBill(orderId: string, amount: number, method: PaymentMethod) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { menuItem: true } },
    },
  });

  if (!order) throw new Error("Order not found");
  if (order.status === OrderStatus.BILLED || order.status === OrderStatus.PAID || order.status === OrderStatus.COMPLETED) {
    throw new Error("Order is already billed or completed");
  }
  if (order.items.length === 0) {
    throw new Error("Cannot generate a bill for an empty order");
  }
  if (amount <= 0) {
    throw new Error("Settlement amount must be greater than zero");
  }

  // Recalculate totals to be absolutely sure before locking the Bill
  let subtotal = 0;
  let tax = 0;

  for (const item of order.items) {
    const itemTotal = item.unitPrice * item.quantity;
    subtotal += itemTotal;
    if (item.menuItem.taxRate) {
      tax += itemTotal * (item.menuItem.taxRate / 100);
    }
  }

  const discount = order.discount;
  const serviceCharge = order.serviceCharge;
  const grandTotal = subtotal + tax - discount + serviceCharge;
  const amountToRecord = Math.min(amount, grandTotal);

  const bill = await prisma.$transaction(async (tx) => {
    const createdBill = await tx.bill.upsert({
      where: { orderId: order.id },
      create: { orderId: order.id, subtotal, discount, tax, serviceCharge, grandTotal },
      update: { subtotal, discount, tax, serviceCharge, grandTotal },
    });

    await tx.payment.create({
      data: {
        orderId: order.id,
        amount: amountToRecord,
        method,
        status: PaymentStatus.PAID,
      },
    });

    const isFullyPaid = amountToRecord >= grandTotal;

    await tx.order.update({
      where: { id: orderId },
      data: {
        subtotal,
        tax,
        grandTotal,
        status: isFullyPaid ? OrderStatus.COMPLETED : OrderStatus.PARTIALLY_PAID,
      },
    });

    if (isFullyPaid && order.tableId && order.tableSessionId) {
      await tx.tableSession.update({
        where: { id: order.tableSessionId },
        data: { endedAt: new Date() },
      });

      await tx.restaurantTable.update({
        where: { id: order.tableId },
        data: { status: TableStatus.AVAILABLE },
      });
    }

    return createdBill;
  });

  revalidatePath(`/pos/table`);
  revalidatePath(`/tables`);
  revalidatePath(`/orders/${orderId}/bill`);
  revalidatePath(`/orders/${orderId}/payment`);

  return bill;
}
