import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, AdminGuardError } from "@/lib/adminGuard";
import { updateSellerSchema } from "@/lib/schemas/seller";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof AdminGuardError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }

  const { id } = await context.params;
  const seller = await db.seller.findUnique({
    where: { id },
    include: { user: { select: { email: true } } },
  });
  if (!seller) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ seller });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof AdminGuardError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = updateSellerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await db.seller.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const seller = await db.seller.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ seller });
}
