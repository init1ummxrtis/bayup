import { db } from "@/lib/db";
import { getPaymentProvider } from "@/lib/payments";
import type { Payment } from "@prisma/client";
import type { WebhookResult } from "@/lib/payments/types";

export class PaymentServiceError extends Error {}

/**
 * The only thing routes/pages talk to for payments. It owns the Order/Payment
 * state machine; the provider only knows how to talk to the outside world.
 *
 *   Frontend -> Route Handler -> PaymentService -> PaymentProvider -> (mock | Tribute)
 */
export const PaymentService = {
  async createPayment(orderId: string): Promise<Payment> {
    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order) throw new PaymentServiceError("Order not found");
    if (order.status !== "PENDING" && order.status !== "PAYMENT_PENDING") {
      throw new PaymentServiceError(`Order is not payable in status ${order.status}`);
    }

    const provider = getPaymentProvider();
    const providerName = (process.env.PAYMENT_PROVIDER ?? "mock") === "tribute" ? "TRIBUTE" : "MOCK";

    const payment = await db.payment.create({
      data: {
        orderId: order.id,
        provider: providerName,
        amount: order.totalPrice,
        currency: order.currency,
        status: "PENDING",
      },
    });

    const result = await provider.createPayment({
      paymentId: payment.id,
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: Number(order.totalPrice),
      currency: order.currency,
    });

    const updated = await db.payment.update({
      where: { id: payment.id },
      data: { providerPaymentId: result.providerPaymentId, redirectUrl: result.redirectUrl },
    });

    await db.order.update({ where: { id: order.id }, data: { status: "PAYMENT_PENDING" } });

    return updated;
  },

  async getPaymentStatus(paymentId: string): Promise<Payment> {
    const payment = await db.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new PaymentServiceError("Payment not found");
    return payment;
  },

  /** Entry point for a real inbound webhook request from a provider. */
  async handleWebhook(request: Request): Promise<void> {
    const provider = getPaymentProvider();
    const result = await provider.handleWebhook(request);
    await this.applyWebhookResult(result);
  },

  /**
   * Shared state-machine logic used by both the real webhook endpoint and the
   * dev-only mock "simulate" endpoint. Verifies the payment exists and that
   * amount/currency match before mutating anything, then flips Payment and
   * Order status together.
   */
  async applyWebhookResult(result: WebhookResult): Promise<void> {
    const payment = await db.payment.findUnique({ where: { id: result.paymentId } });
    if (!payment) throw new PaymentServiceError("Payment not found for webhook");
    if (payment.status !== "PENDING") return; // idempotent: ignore duplicate/late webhooks

    if (Number(payment.amount) !== result.amount || payment.currency !== result.currency) {
      throw new PaymentServiceError("Webhook amount/currency does not match payment record");
    }

    await db.payment.update({
      where: { id: payment.id },
      data: { status: result.status, rawWebhookPayload: result.raw as object },
    });

    if (result.status === "SUCCEEDED") {
      await db.order.update({ where: { id: payment.orderId }, data: { status: "PAID" } });
    } else if (result.status === "FAILED") {
      await db.order.update({ where: { id: payment.orderId }, data: { status: "CANCELLED" } });
    }
  },

  async refundPayment(paymentId: string): Promise<void> {
    const payment = await db.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new PaymentServiceError("Payment not found");
    if (payment.status !== "SUCCEEDED") {
      throw new PaymentServiceError("Only succeeded payments can be refunded");
    }

    const provider = getPaymentProvider();
    if (!payment.providerPaymentId) throw new PaymentServiceError("Payment has no provider id");
    await provider.refundPayment(payment.providerPaymentId);

    await db.payment.update({ where: { id: payment.id }, data: { status: "REFUNDED" } });
    await db.order.update({ where: { id: payment.orderId }, data: { status: "REFUNDED" } });
  },
};
