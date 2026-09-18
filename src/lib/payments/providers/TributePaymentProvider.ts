import type {
  CreatePaymentInput,
  PaymentProvider,
  PaymentResult,
  PaymentStatusResult,
  WebhookResult,
} from "@/lib/payments/types";
import { NotImplementedError } from "@/lib/payments/types";

/**
 * Placeholder only. Tribute's API documentation and credentials have not been
 * provided yet, so nothing here is real: no endpoint, no request/response
 * shape, no auth scheme, no webhook signature format has been invented.
 *
 * When Tribute's docs are available, implement each method against the real
 * API and flip PAYMENT_PROVIDER=tribute in the environment — nothing above
 * this class (PaymentService, routes, pages) needs to change.
 */
export class TributePaymentProvider implements PaymentProvider {
  async createPayment(_input: CreatePaymentInput): Promise<PaymentResult> {
    throw new NotImplementedError(
      "TributePaymentProvider.createPayment is not implemented yet — awaiting Tribute API documentation and credentials."
    );
  }

  async getPaymentStatus(_providerPaymentId: string): Promise<PaymentStatusResult> {
    throw new NotImplementedError(
      "TributePaymentProvider.getPaymentStatus is not implemented yet — awaiting Tribute API documentation and credentials."
    );
  }

  async handleWebhook(_request: Request): Promise<WebhookResult> {
    throw new NotImplementedError(
      "TributePaymentProvider.handleWebhook is not implemented yet — awaiting Tribute API documentation and credentials."
    );
  }

  async refundPayment(_providerPaymentId: string): Promise<void> {
    throw new NotImplementedError(
      "TributePaymentProvider.refundPayment is not implemented yet — awaiting Tribute API documentation and credentials."
    );
  }
}
