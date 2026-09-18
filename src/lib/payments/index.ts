import type { PaymentProvider } from "@/lib/payments/types";
import { MockPaymentProvider } from "@/lib/payments/providers/MockPaymentProvider";
import { TributePaymentProvider } from "@/lib/payments/providers/TributePaymentProvider";

let cachedProvider: PaymentProvider | undefined;

export function getPaymentProvider(): PaymentProvider {
  if (cachedProvider) return cachedProvider;

  const providerName = process.env.PAYMENT_PROVIDER ?? "mock";
  cachedProvider =
    providerName === "tribute" ? new TributePaymentProvider() : new MockPaymentProvider();

  return cachedProvider;
}

export function isMockProvider(): boolean {
  return (process.env.PAYMENT_PROVIDER ?? "mock") === "mock";
}
