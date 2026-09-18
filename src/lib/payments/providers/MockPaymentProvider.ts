import { randomUUID } from "crypto";
import type {
  CreatePaymentInput,
  PaymentProvider,
  PaymentResult,
  PaymentStatusResult,
  PaymentStatusValue,
  WebhookResult,
} from "@/lib/payments/types";

/**
 * Fully functional provider for development/demo purposes. It never calls out
 * to a real payment network — "success" and "failure" are triggered by hand
 * from the /payment/mock/:paymentId dev page, which simulates what a real
 * provider's redirect + webhook would eventually do.
 */
export class MockPaymentProvider implements PaymentProvider {
  async createPayment(input: CreatePaymentInput): Promise<PaymentResult> {
    const providerPaymentId = `mock_${randomUUID()}`;
    return {
      providerPaymentId,
      redirectUrl: `/payment/mock/${input.paymentId}`,
    };
  }

  async getPaymentStatus(providerPaymentId: string): Promise<PaymentStatusResult> {
    // The mock provider has no external state of its own — the Payment row in
    // our own database (looked up by PaymentService) is the source of truth.
    return { status: "PENDING", providerPaymentId };
  }

  async handleWebhook(request: Request): Promise<WebhookResult> {
    const body = (await request.json()) as {
      paymentId: string;
      providerPaymentId: string;
      status: PaymentStatusValue;
      amount: number;
      currency: string;
    };
    return {
      paymentId: body.paymentId,
      status: body.status,
      amount: body.amount,
      currency: body.currency,
      raw: body,
    };
  }

  async refundPayment(): Promise<void> {
    // No external ledger to reverse in mock mode; PaymentService marks the
    // Payment/Order rows as REFUNDED after calling this.
  }

  /** Dev-only helper used by /api/payments/mock/:id/simulate. Not part of the PaymentProvider interface. */
  simulateOutcome(paymentId: string, outcome: "success" | "failure"): WebhookResult["status"] {
    return outcome === "success" ? "SUCCEEDED" : "FAILED";
  }
}
