import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, AdminGuardError } from "@/lib/adminGuard";

export async function GET() {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof AdminGuardError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }

  const sellers = await db.seller.findMany({
    include: {
      user: { select: { email: true } },
      _count: { select: { products: true } },
    },
    orderBy: { memberSince: "asc" },
  });

  return NextResponse.json({ sellers });
}
