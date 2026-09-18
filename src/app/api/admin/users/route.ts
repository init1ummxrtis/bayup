import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, AdminGuardError } from "@/lib/adminGuard";

export async function GET() {
  try {
    await requireAdmin();

    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        seller: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    if (error instanceof AdminGuardError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
