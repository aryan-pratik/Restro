"use server";

import { PrismaClient, PaymentMethod, PaymentStatus, OrderStatus, TableStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function processPayment(orderId: string, amount: number, method: PaymentMethod) {
  // 1. Fetch Order and Bill
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      bill: true,
      payments: true,
    },
  });

  if (!order) throw new Error("Order not found");
  if (!order.bill) throw new Error("Bill not generated for this order yet");
  if (order.status === OrderStatus.COMPLETED) throw new Error("Order is already completed");

  // 2. Validate Amount (MVP: Full payment required)
  const currentTotalPaid = order.payments
    .filter(p => p.status === PaymentStatus.PAID)
    .reduce((sum, p) => sum + p.amount, 0);
    
  const remainingDue = order.bill.grandTotal - currentTotalPaid;
  
  // We allow capturing more than the amount (e.g. cash change), but we only record the due amount to balance the books, or we record full and handle change in UI.
  // For simplicity, we record exactly what was needed to close the bill, even if UI shows change due.
  const amountToRecord = Math.min(amount, remainingDue);

  if (amountToRecord <= 0) {
    throw new Error("No payment due");
  }

  // 3. Execute Transaction
  const [payment] = await prisma.$transaction(async (tx) => {
    // Record payment
    const newPayment = await tx.payment.create({
      data: {
        orderId: order.id,
        amount: amountToRecord,
        method,
        status: PaymentStatus.PAID,
      }
    });

    // Check if fully paid
    const newTotalPaid = currentTotalPaid + amountToRecord;
    
    if (newTotalPaid >= order.bill!.grandTotal) {
      // Mark order as COMPLETED
      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.COMPLETED },
      });

      // Free the table and close session if it exists
      if (order.tableId && order.tableSessionId) {
        await tx.tableSession.update({
          where: { id: order.tableSessionId },
          data: { endedAt: new Date() },
        });

        await tx.restaurantTable.update({
          where: { id: order.tableId },
          data: { status: TableStatus.AVAILABLE },
        });
      }
    } else {
      // Partially paid
      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.PARTIALLY_PAID },
      });
    }

    return [newPayment];
  });

  revalidatePath(`/pos/table`);
  revalidatePath(`/orders/${orderId}/payment`);
  
  return payment;
}
