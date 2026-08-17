"use server";

import { PrismaClient, TableStatus, KOTStatus } from "@prisma/client";
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
          kots: {
            where: {
              status: { notIn: ["COMPLETED", "CANCELLED"] },
              acceptedAt: { not: null },
            },
            include: {
              items: { include: { menuItem: true } },
            },
            orderBy: { acceptedAt: "asc" },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return tables.map((t) => {
    const activeOrder = t.orders[0];
    const runningTotal = activeOrder ? activeOrder.grandTotal : 0;
    const activeSession = t.sessions[0] || null;
    const prepTimer = activeOrder ? getKitchenProgress(activeOrder.kots) : null;

    return {
      ...t,
      activeSession,
      activeOrder,
      runningTotal,
      prepTimer,
    };
  });
}

const DEFAULT_PREP_MINUTES = 15;

interface KOTWithPrepItems {
  status: KOTStatus;
  acceptedAt: Date | null;
  items: { menuItem: { preparationTime: number | null } }[];
}

export interface KitchenProgress {
  // READY takes priority over ACCEPTED/PREPARING so the table reflects the real
  // kitchen state instead of an estimate that's now stale.
  status: "ACCEPTED" | "PREPARING" | "READY";
  estimatedReadyAt: Date | null;
}

// Summarizes a table's in-flight KOTs into one status the table card can show:
// - if any KOT is READY, surface that immediately (countdown is irrelevant once food is ready)
// - otherwise, show the soonest-due estimate among KOTs still being prepped
function getKitchenProgress(kots: KOTWithPrepItems[]): KitchenProgress | null {
  if (kots.length === 0) return null;

  const readyKot = kots.find((k) => k.status === KOTStatus.READY);
  if (readyKot) {
    return { status: "READY", estimatedReadyAt: null };
  }

  let earliest: Date | null = null;
  let anyPreparing = false;

  for (const kot of kots) {
    if (!kot.acceptedAt) continue;
    if (kot.status === KOTStatus.PREPARING) anyPreparing = true;

    const prepMinutes = Math.max(
      DEFAULT_PREP_MINUTES,
      ...kot.items.map((item) => item.menuItem.preparationTime ?? 0)
    );
    const estimatedReadyAt = new Date(kot.acceptedAt.getTime() + prepMinutes * 60_000);
    if (!earliest || estimatedReadyAt < earliest) {
      earliest = estimatedReadyAt;
    }
  }

  if (!earliest) return null;

  return { status: anyPreparing ? "PREPARING" : "ACCEPTED", estimatedReadyAt: earliest };
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
