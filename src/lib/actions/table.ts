"use server";

import { PrismaClient, TableStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { TableSchema, UpdateTableStatusSchema } from "../validations/table";

const prisma = new PrismaClient();

async function getOutletId() {
  const outlet = await prisma.outlet.findFirst();
  if (!outlet) throw new Error("No outlet found in database.");
  return outlet.id;
}

export async function getTables() {
  const outletId = await getOutletId();
  const tables = await prisma.restaurantTable.findMany({
    where: { outletId },
    include: {
      sessions: {
        where: { endedAt: null },
        take: 1,
        orderBy: { startedAt: "desc" },
      },
      orders: {
        where: {
          status: {
            notIn: ["COMPLETED", "CANCELLED"],
          },
        },
        include: {
          items: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return tables.map((t) => {
    const activeOrder = t.orders[0];
    const runningTotal = activeOrder ? activeOrder.grandTotal : 0;
    const activeSession = t.sessions[0] || null;

    return {
      ...t,
      activeSession,
      activeOrder,
      runningTotal,
    };
  });
}

export async function getTableById(id: string) {
  return prisma.restaurantTable.findUnique({
    where: { id },
    include: {
      sessions: {
        where: { endedAt: null },
        take: 1,
      },
      orders: {
        where: {
          status: {
            notIn: ["COMPLETED", "CANCELLED"],
          },
        },
      },
    },
  });
}

export async function saveTable(data: z.infer<typeof TableSchema>) {
  const parsed = TableSchema.parse(data);
  const outletId = await getOutletId();

  if (parsed.id) {
    await prisma.restaurantTable.update({
      where: { id: parsed.id },
      data: {
        name: parsed.name,
        capacity: parsed.capacity,
        status: parsed.status,
      },
    });
  } else {
    await prisma.restaurantTable.create({
      data: {
        outletId,
        name: parsed.name,
        capacity: parsed.capacity,
        status: parsed.status,
      },
    });
  }

  revalidatePath("/tables");
  revalidatePath("/pos");
}

export async function updateTableStatus(id: string, status: TableStatus) {
  const parsedStatus = UpdateTableStatusSchema.parse({ status }).status;

  await prisma.restaurantTable.update({
    where: { id },
    data: { status: parsedStatus },
  });

  revalidatePath("/tables");
  revalidatePath("/pos");
}

export async function openTableSession(id: string) {
  const table = await prisma.restaurantTable.findUnique({
    where: { id },
    include: {
      sessions: {
        where: { endedAt: null },
      },
    },
  });

  if (!table) throw new Error("Table not found.");

  if (table.sessions.length === 0) {
    await prisma.tableSession.create({
      data: {
        tableId: id,
        startedAt: new Date(),
      },
    });
  }

  await prisma.restaurantTable.update({
    where: { id },
    data: { status: TableStatus.OCCUPIED },
  });

  revalidatePath("/tables");
  revalidatePath("/pos");
}

export async function closeTableSession(id: string, nextStatus: TableStatus = TableStatus.CLEANING) {
  const activeSessions = await prisma.tableSession.findMany({
    where: { tableId: id, endedAt: null },
  });

  for (const session of activeSessions) {
    await prisma.tableSession.update({
      where: { id: session.id },
      data: { endedAt: new Date() },
    });
  }

  await prisma.restaurantTable.update({
    where: { id },
    data: { status: nextStatus },
  });

  revalidatePath("/tables");
  revalidatePath("/pos");
}

export async function deleteTable(id: string) {
  const table = await prisma.restaurantTable.findUnique({
    where: { id },
    include: {
      orders: {
        where: {
          status: {
            notIn: ["COMPLETED", "CANCELLED"],
          },
        },
      },
    },
  });

  if (table?.orders.length && table.orders.length > 0) {
    throw new Error("Cannot delete table with active orders.");
  }

  if (table?.status === TableStatus.OCCUPIED) {
    throw new Error("Cannot delete an occupied table.");
  }

  await prisma.restaurantTable.delete({ where: { id } });

  revalidatePath("/tables");
  revalidatePath("/pos");
}
