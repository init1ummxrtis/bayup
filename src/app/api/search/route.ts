import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (!q) return NextResponse.json({ products: [] });

  const products = await db.product.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { game: { name: { contains: q, mode: "insensitive" } } },
      ],
    },
    include: { game: true },
    orderBy: { ordersCount: "desc" },
    take: 30,
  });

  return NextResponse.json({ products });
}
