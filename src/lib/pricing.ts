import { db } from "@/lib/db";

export class PricingError extends Error {}

export interface PricedOption {
  groupId: string;
  groupName: string;
  valueId: string;
  valueLabel: string;
  priceModifier: number;
}

type LoadedProduct = NonNullable<Awaited<ReturnType<typeof loadProduct>>>;

export interface PricingResult {
  product: LoadedProduct;
  totalPrice: number;
  selectedOptions: PricedOption[];
}

async function loadProduct(productId: string) {
  return db.product.findUnique({
    where: { id: productId },
    include: {
      optionGroups: { include: { values: true }, orderBy: { sortOrder: "asc" } },
      seller: true,
      game: true,
      category: true,
    },
  });
}

/**
 * The single source of truth for order pricing. The client only ever sends a
 * productId and the ids of the option values it selected — this function is
 * what actually decides the price. Never trust a price sent from the client.
 */
export async function computeProductPrice(
  productId: string,
  selectedValueIds: string[]
): Promise<PricingResult> {
  const product = await loadProduct(productId);
  if (!product || product.status !== "ACTIVE") {
    throw new PricingError("Product not found or not available");
  }

  const selectedSet = new Set(selectedValueIds);
  let total = Number(product.basePrice);
  const selectedOptions: PricedOption[] = [];

  for (const group of product.optionGroups) {
    const chosenValues = group.values.filter((v) => selectedSet.has(v.id));

    if (group.required && chosenValues.length === 0) {
      throw new PricingError(`Missing required option: ${group.name}`);
    }
    if (group.type === "SINGLE_SELECT" && chosenValues.length > 1) {
      throw new PricingError(`Only one value allowed for: ${group.name}`);
    }

    for (const value of chosenValues) {
      const modifier = Number(value.priceModifier);
      total += modifier;
      selectedOptions.push({
        groupId: group.id,
        groupName: group.name,
        valueId: value.id,
        valueLabel: value.label,
        priceModifier: modifier,
      });
    }
  }

  const unknownIds = selectedValueIds.filter(
    (id) => !product.optionGroups.some((g) => g.values.some((v) => v.id === id))
  );
  if (unknownIds.length > 0) {
    throw new PricingError("Unknown option value(s) submitted");
  }

  total = Math.round(total * 100) / 100;

  return { product, totalPrice: total, selectedOptions };
}

export function formatOrderNumber(orderNumber: number): string {
  return String(10000 + orderNumber);
}
