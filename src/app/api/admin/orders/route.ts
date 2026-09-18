import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, AdminGuardError } from "@/lib/adminGuard";

export async function GET() {
  try {
    await requireAdmin();

    const orders = await db.order.findMany({
      include: {
        items: true,
        payments: true,
        user: { select: { email: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    if (error instanceof AdminGuardError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
