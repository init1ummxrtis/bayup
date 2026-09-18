import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, AdminGuardError } from "@/lib/adminGuard";
import { createGameSchema } from "@/lib/schemas/game";
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

  const games = await db.game.findMany({
    include: { _count: { select: { products: true, categories: true } } },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({ games });
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
  const parsed = createGameSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const slug = data.slug ?? slugify(data.name);

  const existing = await db.game.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "A game with this slug already exists" }, { status: 409 });
  }

  const game = await db.game.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      bannerUrl: data.bannerUrl,
      iconUrl: data.iconUrl,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
    },
  });

  return NextResponse.json({ game }, { status: 201 });
}
