import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, AdminGuardError } from "@/lib/adminGuard";
import { updateOrderStatusSchema } from "@/lib/schemas/adminOrder";
import { isValidOrderStatusTransition } from "@/lib/orderStatusTransitions";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const order = await db.order.findUnique({
      where: { id },
      include: {
        items: true,
        payments: true,
        review: true,
        user: { select: { email: true, name: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    if (error instanceof AdminGuardError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await request.json().catch(() => null);
    const parsed = updateOrderStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const toStatus = parsed.data.status;

    // Same per-order advisory lock PaymentService uses for createPayment()
    // and applyWebhookResult() — a webhook processing this exact order can no
    // longer interleave with this admin update. Order is read fresh AFTER the
    // lock is held, never from a stale pre-lock value.
    const outcome = await db.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${id})::bigint)`;

      const existing = await tx.order.findUnique({ where: { id } });
      if (!existing) return { kind: "not_found" as const };

      const fromStatus = existing.status;
      if (fromStatus === toStatus) return { kind: "noop" as const, order: existing };

      if (!isValidOrderStatusTransition(fromStatus, toStatus)) {
        return { kind: "invalid" as const, fromStatus, toStatus };
      }

      // Nothing else can be concurrently changing this order's status while
      // we hold the lock, so this always matches — kept as an explicit
      // condition for consistency with the rest of the codebase's writes.
      await tx.order.updateMany({ where: { id, status: fromStatus }, data: { status: toStatus } });
      const updated = await tx.order.findUnique({ where: { id } });
      return { kind: "ok" as const, order: updated };
    });

    if (outcome.kind === "not_found") {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (outcome.kind === "invalid") {
      return NextResponse.json(
        { error: `Cannot transition order from ${outcome.fromStatus} to ${outcome.toStatus}` },
        { status: 400 }
      );
    }

    return NextResponse.json({ order: outcome.order });
  } catch (error) {
    if (error instanceof AdminGuardError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
