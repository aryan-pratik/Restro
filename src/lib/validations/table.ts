import { z } from "zod";
import { TableStatus } from "@prisma/client";

export const TableStatusEnum = z.nativeEnum(TableStatus);

export const TableSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Table name is required"),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1").default(4),
  status: TableStatusEnum.default(TableStatus.AVAILABLE),
});

export const UpdateTableStatusSchema = z.object({
  status: TableStatusEnum,
});
