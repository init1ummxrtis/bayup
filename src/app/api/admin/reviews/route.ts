import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, AdminGuardError } from "@/lib/adminGuard";

export async function GET() {
  try {
    await requireAdmin();

    const reviews = await db.review.findMany({
      include: {
        user: { select: { name: true } },
        product: { select: { title: true } },
        seller: { select: { displayName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    if (error instanceof AdminGuardError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
