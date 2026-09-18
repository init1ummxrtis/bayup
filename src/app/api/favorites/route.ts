import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const favorites = await db.favorite.findMany({
    where: { userId: session.user.id },
    include: { product: { include: { game: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ favorites });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const productId = body?.productId as string | undefined;
  if (!productId) return NextResponse.json({ error: "productId is required" }, { status: 400 });

  const favorite = await db.favorite.upsert({
    where: { userId_productId: { userId: session.user.id, productId } },
    update: {},
    create: { userId: session.user.id, productId },
  });

  return NextResponse.json({ favorite }, { status: 201 });
}
