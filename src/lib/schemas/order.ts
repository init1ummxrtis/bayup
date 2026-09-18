import { z } from "zod";

export const createOrderSchema = z.object({
  productId: z.string().min(1),
  selectedValueIds: z.array(z.string().min(1)).default([]),
  customerEmail: z.string().trim().toLowerCase().email(),
  gamingUsername: z.string().trim().min(2).max(60),
  additionalInformation: z.string().trim().max(1000).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
