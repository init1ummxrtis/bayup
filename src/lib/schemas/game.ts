import { z } from "zod";

export const createGameSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z
    .string()
    .trim()
    .max(140)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
  description: z.string().trim().min(1),
  bannerUrl: z.string().trim().max(500).optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  iconUrl: z.string().trim().max(500).optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const updateGameSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  slug: z.string().trim().min(1).max(140).optional(),
  description: z.string().trim().min(1).optional(),
  bannerUrl: z.string().trim().max(500).optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  iconUrl: z.string().trim().max(500).optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  sortOrder: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(120),
});

export type CreateGameInput = z.infer<typeof createGameSchema>;
export type UpdateGameInput = z.infer<typeof updateGameSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
