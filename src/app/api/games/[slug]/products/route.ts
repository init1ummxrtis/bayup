import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const { searchParams } = new URL(request.url);

  const game = await db.game.findUnique({ where: { slug } });
  if (!game) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const category = searchParams.get("category") ?? undefined;
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const rating = searchParams.get("rating");
  const sort = searchParams.get("sort") ?? "popular";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = 9;

  const where: Prisma.ProductWhereInput = {
    gameId: game.id,
    status: "ACTIVE",
    ...(category ? { category: { slug: category } } : {}),
    ...(minPrice || maxPrice
      ? { basePrice: { gte: minPrice ? Number(minPrice) : undefined, lte: maxPrice ? Number(maxPrice) : undefined } }
      : {}),
    ...(rating ? { rating: { gte: Number(rating) } } : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "priceAsc" ? { basePrice: "asc" } : sort === "priceDesc" ? { basePrice: "desc" } : sort === "rating" ? { rating: "desc" } : { ordersCount: "desc" };

  const [products, total] = await Promise.all([
    db.product.findMany({ where, orderBy, skip: (page - 1) * pageSize, take: pageSize }),
    db.product.count({ where }),
  ]);

  return NextResponse.json({ products, total, page, pageSize });
}
