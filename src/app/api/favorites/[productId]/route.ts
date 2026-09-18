import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(_request: Request, context: { params: Promise<{ productId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId } = await context.params;
  await db.favorite.deleteMany({ where: { userId: session.user.id, productId } });

  return NextResponse.json({ ok: true });
}
