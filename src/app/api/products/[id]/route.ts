import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const product = await db.product.findUnique({
    where: { id },
    include: {
      game: true,
      seller: true,
      category: true,
      optionGroups: { include: { values: true }, orderBy: { sortOrder: "asc" } },
    },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product });
}
