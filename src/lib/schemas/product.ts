import { z } from "zod";

export const optionValueSchema = z.object({
  label: z.string().trim().min(1).max(120),
  priceModifier: z.coerce.number().default(0),
});

export const optionGroupSchema = z.object({
  name: z.string().trim().min(1).max(120),
  type: z.enum(["SINGLE_SELECT", "MULTI_SELECT"]),
  required: z.boolean().default(true),
  values: z.array(optionValueSchema).default([]),
});

const baseProductFields = {
  gameId: z.string().min(1),
  categoryId: z.string().min(1),
  sellerId: z.string().min(1),
  title: z.string().trim().min(1).max(200),
  slug: z
    .string()
    .trim()
    .max(220)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
  description: z.string().trim().min(1),
  basePrice: z.coerce.number().nonnegative(),
  deliveryTime: z.string().trim().min(1).max(120),
  images: z.array(z.string().trim().min(1)).default([]),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("ACTIVE"),
  optionGroups: z.array(optionGroupSchema).default([]),
};

export const createProductSchema = z.object(baseProductFields);

export const updateProductSchema = z.object({
  ...baseProductFields,
  slug: z
    .string()
    .trim()
    .max(220)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
