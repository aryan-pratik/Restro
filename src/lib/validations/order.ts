import { z } from "zod";

export const CreateOrderSchema = z.object({
  tableId: z.string().optional(),
  tableSessionId: z.string().optional(),
  customerId: z.string().optional(),
});

export const OrderItemSchema = z.object({
  menuItemId: z.string().min(1, "Menu item ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").default(1),
  notes: z.string().optional(),
});

export const UpdateOrderItemSchema = z.object({
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

export const SendKOTSchema = z.object({
  orderItemIds: z.array(z.string()).min(1, "At least one item is required for KOT"),
});
