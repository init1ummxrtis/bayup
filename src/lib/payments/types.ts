export type PaymentStatusValue = "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";

export interface CreatePaymentInput {
  paymentId: string;
  orderId: string;
  orderNumber: number;
  amount: number;
  currency: string;
}

export interface PaymentResult {
  providerPaymentId: string;
  redirectUrl: string;
}

export interface PaymentStatusResult {
  status: PaymentStatusValue;
  providerPaymentId: string;
}

export interface WebhookResult {
  paymentId: string;
  status: PaymentStatusValue;
  amount: number;
  currency: string;
  raw: unknown;
}

/**
 * Every payment provider (mock, Tribute, future providers) implements this
 * interface. Nothing above this layer — routes, pages, PaymentService itself —
 * is allowed to know provider-specific details.
 */
export interface PaymentProvider {
  createPayment(input: CreatePaymentInput): Promise<PaymentResult>;
  getPaymentStatus(providerPaymentId: string): Promise<PaymentStatusResult>;
  handleWebhook(request: Request): Promise<WebhookResult>;
  refundPayment(providerPaymentId: string): Promise<void>;
}

export class NotImplementedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotImplementedError";
  }
}
