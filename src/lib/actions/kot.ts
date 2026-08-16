"use server";

import { PrismaClient, KOTStatus, OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

async function getOutletId() {
  const outlet = await prisma.outlet.findFirst();
  if (!outlet) throw new Error("No outlet found in database.");
  return outlet.id;
}

export async function getActiveKOTs() {
  const outletId = await getOutletId();

  return prisma.kOT.findMany({
    where: {
      outletId,
      status: {
        notIn: [KOTStatus.COMPLETED, KOTStatus.CANCELLED],
      },
    },
    include: {
      order: {
        include: {
          table: true,
        },
      },
      items: {
        include: {
          menuItem: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function getKOTById(id: string) {
  return prisma.kOT.findUnique({
    where: { id },
    include: {
      order: {
        include: {
          table: true,
        },
      },
      items: {
        include: {
          menuItem: true,
        },
      },
    },
  });
}

export async function updateKOTStatus(kotId: string, status: KOTStatus) {
  const kot = await prisma.kOT.findUnique({ where: { id: kotId } });
  if (!kot) throw new Error("KOT not found");

  // Update KOT status
  const updatedKOT = await prisma.kOT.update({
    where: { id: kotId },
    data: { status },
  });

  // Cascade status to all items within KOT (simplified MVP logic)
  await prisma.kOTItem.updateMany({
    where: { kotId },
    data: { status },
  });

  // Automatically update parent Order status based on KOT progress
  let orderStatusToUpdate: OrderStatus | undefined;
  
  if (status === KOTStatus.PREPARING) {
    orderStatusToUpdate = OrderStatus.PREPARING;
  } else if (status === KOTStatus.READY) {
    orderStatusToUpdate = OrderStatus.READY;
  }

  if (orderStatusToUpdate) {
    await prisma.order.update({
      where: { id: kot.orderId },
      data: { status: orderStatusToUpdate },
    });
  }

  revalidatePath("/kitchen");
  revalidatePath("/pos/table");
  revalidatePath("/pos");
  
  return updatedKOT;
}
