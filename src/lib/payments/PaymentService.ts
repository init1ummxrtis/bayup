import { db } from "@/lib/db";
import { getPaymentProvider } from "@/lib/payments";
import type { Payment } from "@prisma/client";
import type { WebhookResult } from "@/lib/payments/types";
import { isValidOrderStatusTransition } from "@/lib/orderStatusTransitions";

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
    if (order.status !== "PENDING" && order.status !== "PAYMENT_PENDING" && order.status !== "CANCELLED") {
      throw new PaymentServiceError(`Order is not payable in status ${order.status}`);
    }

    const providerName = (process.env.PAYMENT_PROVIDER ?? "mock") === "tribute" ? "TRIBUTE" : "MOCK";

    // Two concurrent calls could both see "no pending payment yet" from a
    // plain findFirst and both create one. A Postgres advisory lock keyed on
    // the order id serializes that check-then-create per order — it needs no
    // schema change (the lock is transaction-scoped and releases itself on
    // commit/rollback) and only holds the DB transaction open for the short
    // find-or-create step below, not for the provider call that follows it.
    const { payment, isExisting } = await db.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${orderId})::bigint)`;

      const existingPending = await tx.payment.findFirst({
        where: { orderId: order.id, status: "PENDING" },
        orderBy: { createdAt: "desc" },
      });
      if (existingPending) {
        return { payment: existingPending, isExisting: true };
      }

      const created = await tx.payment.create({
        data: {
          orderId: order.id,
          provider: providerName,
          amount: order.totalPrice,
          currency: order.currency,
          status: "PENDING",
        },
      });
      return { payment: created, isExisting: false };
    });

    // A pending payment that already has its redirectUrl is fully usable as-is
    // — reuse it and leave Order/Payment untouched (no duplicate, no provider call).
    if (isExisting && payment.redirectUrl) {
      return payment;
    }

    // Either a brand-new payment, or an existing one whose provider call/update
    // never finished (e.g. an earlier attempt was interrupted) — ask the
    // provider for a redirect and store it on that SAME row either way.
    const provider = getPaymentProvider();
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

    if (!isExisting) {
      // Same per-order lock as above (and as applyWebhookResult/admin PATCH):
      // this runs after the provider call, outside the earlier transaction,
      // so re-validate against a freshly-read Order instead of the stale
      // value captured before that call — an admin could have moved the
      // order elsewhere in the meantime.
      await db.$transaction(async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${orderId})::bigint)`;
        const currentOrder = await tx.order.findUnique({ where: { id: order.id } });
        if (!currentOrder) return;
        if (!isValidOrderStatusTransition(currentOrder.status, "PAYMENT_PENDING")) return;
        await tx.order.updateMany({
          where: { id: order.id, status: currentOrder.status },
          data: { status: "PAYMENT_PENDING" },
        });
      });
    }

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
   * Order status together, atomically, inside one transaction.
   */
  async applyWebhookResult(result: WebhookResult): Promise<void> {
    const payment = await db.payment.findUnique({ where: { id: result.paymentId } });
    if (!payment) throw new PaymentServiceError("Payment not found for webhook");
    if (payment.status !== "PENDING") return; // fast path: already processed, nothing to do

    if (Number(payment.amount) !== result.amount || payment.currency !== result.currency) {
      throw new PaymentServiceError("Webhook amount/currency does not match payment record");
    }

    await db.$transaction(async (tx) => {
      // Same per-order advisory lock createPayment() already uses, and the
      // admin PATCH endpoint now uses too — a webhook result and an admin
      // status change for the SAME order can no longer interleave. Whoever
      // acquires this lock first fully completes (or safely no-ops) before
      // the other side is even allowed to read the order's current status.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${payment.orderId})::bigint)`;

      // Re-check Payment now that we hold the lock: a concurrent identical
      // webhook may have already resolved it while we were waiting.
      const currentPayment = await tx.payment.findUnique({ where: { id: payment.id } });
      if (!currentPayment || currentPayment.status !== "PENDING") return;

      if (result.status !== "SUCCEEDED" && result.status !== "FAILED") {
        // Non-terminal result (e.g. still PENDING) — record it, no Order impact,
        // so no need to touch/validate Order at all.
        await tx.payment.updateMany({
          where: { id: payment.id, status: "PENDING" },
          data: { status: result.status, rawWebhookPayload: result.raw as object },
        });
        return;
      }

      // Order is read fresh, under the lock — never the stale pre-lock value —
      // so this reflects anything an admin (or another payment) already did.
      const order = await tx.order.findUnique({ where: { id: payment.orderId } });
      if (!order) return;

      const nextOrderStatus = result.status === "SUCCEEDED" ? "PAID" : "CANCELLED";
      // Reuses the same centralized policy the admin endpoint enforces — Order
      // only ever advances through transitions that are already legitimate,
      // never forced blindly regardless of its current state.
      if (!isValidOrderStatusTransition(order.status, nextOrderStatus)) {
        // The order was already moved elsewhere (e.g. an admin cancelled it)
        // before this result could be applied. Do NOT silently mark the
        // Payment resolved while leaving Order out of sync with it — surface
        // this as an error instead, so Payment stays PENDING and the
        // mismatch is visible rather than hidden.
        throw new PaymentServiceError(
          `Cannot apply payment result: order ${order.id} is ${order.status}, which no longer allows moving to ${nextOrderStatus}`
        );
      }

      await tx.payment.updateMany({
        where: { id: payment.id, status: "PENDING" },
        data: { status: result.status, rawWebhookPayload: result.raw as object },
      });
      await tx.order.updateMany({
        where: { id: order.id, status: order.status },
        data: { status: nextOrderStatus },
      });
    });
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
