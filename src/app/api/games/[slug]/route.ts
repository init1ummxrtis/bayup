import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const game = await db.game.findUnique({
    where: { slug },
    include: { categories: { orderBy: { sortOrder: "asc" } } },
  });
  if (!game) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ game });
}
