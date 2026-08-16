"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { CategorySchema, MenuItemSchema, AddonSchema } from "../validations/menu";

const prisma = new PrismaClient();

// Hardcoded outletId for MVP
const OUTLET_ID = "cm004l83l0001y1g16q01xxxx"; // Will fetch the first outlet dynamically for now

async function getOutletId() {
  const outlet = await prisma.outlet.findFirst();
  if (!outlet) throw new Error("No outlet found in database.");
  return outlet.id;
}

export async function getCategories() {
  const outletId = await getOutletId();
  return prisma.menuCategory.findMany({
    where: { outletId },
    orderBy: { displayOrder: "asc" },
  });
}

export async function saveCategory(data: z.infer<typeof CategorySchema>) {
  const parsed = CategorySchema.parse(data);
  const outletId = await getOutletId();

  if (parsed.id) {
    await prisma.menuCategory.update({
      where: { id: parsed.id },
      data: {
        name: parsed.name,
        description: parsed.description || null,
        displayOrder: parsed.displayOrder,
        isActive: parsed.isActive,
      },
    });
  } else {
    await prisma.menuCategory.create({
      data: {
        outletId,
        name: parsed.name,
        description: parsed.description || null,
        displayOrder: parsed.displayOrder,
        isActive: parsed.isActive,
      },
    });
  }
  
  revalidatePath("/menu/categories");
  revalidatePath("/menu/items");
}

export async function deleteCategory(id: string) {
  // Wait: check if it has items first
  const count = await prisma.menuItem.count({ where: { categoryId: id } });
  if (count > 0) {
    throw new Error("Cannot delete category with items.");
  }
  await prisma.menuCategory.delete({ where: { id } });
  revalidatePath("/menu/categories");
}

export async function getMenuItems() {
  const outletId = await getOutletId();
  return prisma.menuItem.findMany({
    where: { category: { outletId } },
    include: { category: true },
    orderBy: [{ category: { displayOrder: "asc" } }, { name: "asc" }],
  });
}

export async function getMenuItem(id: string) {
  return prisma.menuItem.findUnique({ where: { id } });
}

export async function saveMenuItem(data: z.infer<typeof MenuItemSchema>) {
  const parsed = MenuItemSchema.parse(data);
  
  const dataToSave = {
    categoryId: parsed.categoryId,
    name: parsed.name,
    description: parsed.description || null,
    price: parsed.price,
    imageUrl: parsed.imageUrl || null,
    isVeg: parsed.isVeg,
    isAvailable: parsed.isAvailable,
    taxRate: parsed.taxRate,
    sku: parsed.sku || null,
    preparationTime: parsed.preparationTime || null,
    spicyLevel: parsed.spicyLevel || null,
  };

  if (parsed.id) {
    await prisma.menuItem.update({
      where: { id: parsed.id },
      data: dataToSave,
    });
  } else {
    await prisma.menuItem.create({
      data: dataToSave,
    });
  }
  
  revalidatePath("/menu/items");
  return { success: true };
}

export async function toggleItemAvailability(id: string, isAvailable: boolean) {
  await prisma.menuItem.update({
    where: { id },
    data: { isAvailable },
  });
  revalidatePath("/menu/items");
}

export async function deleteMenuItem(id: string) {
  await prisma.menuItem.delete({ where: { id } });
  revalidatePath("/menu/items");
}
