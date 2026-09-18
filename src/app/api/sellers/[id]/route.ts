import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const seller = await db.seller.findUnique({
    where: { id },
    include: { products: { where: { status: "ACTIVE" } } },
  });
  if (!seller) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ seller });
}
