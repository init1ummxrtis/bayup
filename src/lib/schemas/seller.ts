import { z } from "zod";

export const updateSellerSchema = z.object({
  displayName: z.string().trim().min(1).max(120).optional(),
  bio: z.string().trim().max(2000).optional().or(z.literal("")).transform((v) => (v === "" ? null : v)),
  avatarUrl: z.string().trim().max(500).optional().or(z.literal("")).transform((v) => (v === "" ? null : v)),
  ordersCompleted: z.coerce.number().int().nonnegative().optional(),
  responseTimeMinutes: z.coerce.number().int().nonnegative().optional(),
});

export type UpdateSellerInput = z.infer<typeof updateSellerSchema>;
