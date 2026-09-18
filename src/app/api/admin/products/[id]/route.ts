import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, AdminGuardError } from "@/lib/adminGuard";
import { updateProductSchema } from "@/lib/schemas/product";
import { slugify } from "@/lib/slugify";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof AdminGuardError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }

  const { id } = await context.params;
  const product = await db.product.findUnique({
    where: { id },
    include: {
      game: true,
      seller: true,
      category: true,
      optionGroups: { include: { values: { orderBy: { sortOrder: "asc" } } }, orderBy: { sortOrder: "asc" } },
    },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof AdminGuardError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = updateProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [game, category, seller] = await Promise.all([
    db.game.findUnique({ where: { id: data.gameId } }),
    db.category.findUnique({ where: { id: data.categoryId } }),
    db.seller.findUnique({ where: { id: data.sellerId } }),
  ]);
  if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 });
  if (!category || category.gameId !== game.id) {
    return NextResponse.json({ error: "Category not found for this game" }, { status: 400 });
  }
  if (!seller) return NextResponse.json({ error: "Seller not found" }, { status: 404 });

  let slug = existing.slug;
  if (data.slug && data.slug !== existing.slug) {
    slug = data.slug;
  } else if (data.title !== existing.title && !data.slug) {
    slug = slugify(data.title);
  }
  if (slug !== existing.slug) {
    let candidate = slug;
    let suffix = 1;
    while (
      await db.product.findFirst({
        where: { gameId: data.gameId, slug: candidate, NOT: { id } },
      })
    ) {
      suffix += 1;
      candidate = `${slug}-${suffix}`;
    }
    slug = candidate;
  }

  const product = await db.$transaction(async (tx) => {
    await tx.productOptionGroup.deleteMany({ where: { productId: id } });
    return tx.product.update({
      where: { id },
      data: {
        sellerId: data.sellerId,
        gameId: data.gameId,
        categoryId: data.categoryId,
        title: data.title,
        slug,
        description: data.description,
        basePrice: data.basePrice,
        deliveryTime: data.deliveryTime,
        images: data.images,
        status: data.status,
        optionGroups: {
          create: data.optionGroups.map((group, gi) => ({
            name: group.name,
            type: group.type,
            required: group.required,
            sortOrder: gi,
            values: {
              create: group.values.map((value, vi) => ({
                label: value.label,
                priceModifier: value.priceModifier,
                sortOrder: vi,
              })),
            },
          })),
        },
      },
      include: { optionGroups: { include: { values: true } } },
    });
  });

  return NextResponse.json({ product });
}
