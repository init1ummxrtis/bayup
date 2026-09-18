import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, AdminGuardError } from "@/lib/adminGuard";
import { updateUserRoleSchema } from "@/lib/schemas/adminUser";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    const { id } = await params;

    if (id === session.user.id) {
      return NextResponse.json({ error: "You cannot change your own role" }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    const parsed = updateUserRoleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = await db.user.update({
      where: { id },
      data: { role: parsed.data.role },
    });

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof AdminGuardError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
