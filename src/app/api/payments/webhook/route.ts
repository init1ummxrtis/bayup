import { NextResponse } from "next/server";
import { PaymentService, PaymentServiceError } from "@/lib/payments/PaymentService";

/**
 * Real inbound webhook endpoint. Today only the mock provider is wired up
 * (whose "webhook" is simulated from /payment/mock/:paymentId, see the
 * /api/payments/mock/:id/simulate route). Once TributePaymentProvider is
 * implemented, Tribute will POST here directly and nothing in this route
 * needs to change — verification/parsing is entirely the provider's job.
 */
export async function POST(request: Request) {
  try {
    await PaymentService.handleWebhook(request);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof PaymentServiceError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}
