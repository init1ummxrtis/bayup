import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PaymentService, PaymentServiceError } from "@/lib/payments/PaymentService";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const orderId = body?.orderId as string | undefined;
  if (!orderId) return NextResponse.json({ error: "orderId is required" }, { status: 400 });

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || order.userId !== session.user.id) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  try {
    const payment = await PaymentService.createPayment(orderId);
    return NextResponse.json({ payment });
  } catch (error) {
    if (error instanceof PaymentServiceError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}
