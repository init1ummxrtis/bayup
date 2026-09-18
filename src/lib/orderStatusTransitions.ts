import { orderStatuses } from "@/lib/schemas/adminOrder";

export type OrderStatus = (typeof orderStatuses)[number];

/**
 * Explicit allow-list of Order status transitions, mirroring exactly the
 * lifecycle the app already implements elsewhere — nothing here is a new
 * business flow:
 *
 *   PENDING -> PAYMENT_PENDING -> PAID -> PROCESSING -> COMPLETED   (normal flow)
 *   PAYMENT_PENDING -> CANCELLED                                    (failed payment, PaymentService.applyWebhookResult)
 *   CANCELLED -> PAYMENT_PENDING                                    (retry, PaymentService.createPayment)
 *
 * REFUNDED has no legitimate entry point today: PaymentService.refundPayment()
 * is never called from any route (real refunds aren't implemented yet), so
 * nothing may transition into or out of REFUNDED through this table. It stays
 * unreachable until a real refund flow is built.
 */
const ALLOWED_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  PENDING: ["PAYMENT_PENDING"],
  PAYMENT_PENDING: ["PAID", "CANCELLED"],
  PAID: ["PROCESSING"],
  PROCESSING: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: ["PAYMENT_PENDING"],
  REFUNDED: [],
};

/** Whether `from -> to` is an allowed *distinct* transition. Same-status is handled separately by callers as a no-op. */
export function isValidOrderStatusTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

/** Statuses `from` may move to next, for driving UI choices. Does not include `from` itself. */
export function getAllowedNextStatuses(from: OrderStatus): readonly OrderStatus[] {
  return ALLOWED_TRANSITIONS[from];
}
