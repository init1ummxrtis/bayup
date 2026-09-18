import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isMockProvider } from "@/lib/payments";
import { MockPaymentProvider } from "@/lib/payments/providers/MockPaymentProvider";
import { PaymentService, PaymentServiceError } from "@/lib/payments/PaymentService";

/**
 * Development-only endpoint that stands in for a real provider's webhook.
 * It only works while PAYMENT_PROVIDER=mock and only for the payment's own
 * owner, so it can't be used to tamper with real Tribute payments later.
 */
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isMockProvider()) {
    return NextResponse.json({ error: "Mock payments are disabled" }, { status: 404 });
  }

  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const outcome = body?.result as "success" | "failure" | undefined;
  if (outcome !== "success" && outcome !== "failure") {
    return NextResponse.json({ error: "result must be 'success' or 'failure'" }, { status: 400 });
  }

  const payment = await db.payment.findUnique({ where: { id } });
  if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

  const order = await db.order.findUnique({ where: { id: payment.orderId } });
  if (!order || order.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const provider = new MockPaymentProvider();
  const status = provider.simulateOutcome(payment.id, outcome);

  try {
    await PaymentService.applyWebhookResult({
      paymentId: payment.id,
      status,
      amount: Number(payment.amount),
      currency: payment.currency,
      raw: { simulated: true, outcome },
    });
    return NextResponse.json({ ok: true, orderId: order.id });
  } catch (error) {
    if (error instanceof PaymentServiceError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}
