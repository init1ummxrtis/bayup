import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, AdminGuardError } from "@/lib/adminGuard";
import { createCategorySchema } from "@/lib/schemas/game";
import { slugify } from "@/lib/slugify";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof AdminGuardError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }

  const { id: gameId } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = createCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const game = await db.game.findUnique({ where: { id: gameId } });
  if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 });

  const slugBase = slugify(parsed.data.name);
  let slug = slugBase;
  let suffix = 1;
  while (await db.category.findUnique({ where: { gameId_slug: { gameId, slug } } })) {
    suffix += 1;
    slug = `${slugBase}-${suffix}`;
  }

  const count = await db.category.count({ where: { gameId } });

  const category = await db.category.create({
    data: {
      gameId,
      name: parsed.data.name,
      slug,
      sortOrder: count,
    },
  });

  return NextResponse.json({ category }, { status: 201 });
}
