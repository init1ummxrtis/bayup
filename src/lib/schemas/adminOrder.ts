import { z } from "zod";

export const orderStatuses = [
  "PENDING",
  "PAYMENT_PENDING",
  "PAID",
  "PROCESSING",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
] as const;

export const updateOrderStatusSchema = z.object({
  status: z.enum(orderStatuses),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
