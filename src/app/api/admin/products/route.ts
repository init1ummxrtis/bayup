import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, AdminGuardError } from "@/lib/adminGuard";
import { createProductSchema } from "@/lib/schemas/product";
import { slugify } from "@/lib/slugify";

export async function GET() {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof AdminGuardError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }

  const products = await db.product.findMany({
    include: { game: true, seller: true, category: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof AdminGuardError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }

  const body = await request.json().catch(() => null);
  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

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

  const slugBase = data.slug ?? slugify(data.title);
  let slug = slugBase;
  let suffix = 1;
  while (await db.product.findUnique({ where: { gameId_slug: { gameId: game.id, slug } } })) {
    suffix += 1;
    slug = `${slugBase}-${suffix}`;
  }

  const product = await db.product.create({
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

  return NextResponse.json({ product }, { status: 201 });
}
