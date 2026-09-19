import type { PaymentProvider } from "@/lib/payments/types";
import { MockPaymentProvider } from "@/lib/payments/providers/MockPaymentProvider";
import { TributePaymentProvider } from "@/lib/payments/providers/TributePaymentProvider";

type ConfiguredProviderName = "mock" | "tribute";

/**
 * Single source of truth for which provider is configured, used by both
 * getPaymentProvider() and isMockProvider() so they can never disagree.
 *
 * Only the exact strings "mock" and "tribute" are accepted — no case
 * folding, no trimming. An unset PAYMENT_PROVIDER keeps the existing safe
 * default ("mock"). Anything else (a typo, wrong casing, stray whitespace)
 * is a configuration mistake and must fail loudly here instead of silently
 * being treated as "mock" by one helper and "not mock" by the other.
 */
function getConfiguredProviderName(): ConfiguredProviderName {
  const raw = process.env.PAYMENT_PROVIDER;
  if (raw === undefined) return "mock";
  if (raw === "mock" || raw === "tribute") return raw;
  throw new Error(
    `Invalid PAYMENT_PROVIDER value: ${JSON.stringify(raw)}. Expected exactly "mock" or "tribute".`
  );
}

let cachedProvider: PaymentProvider | undefined;

export function getPaymentProvider(): PaymentProvider {
  if (cachedProvider) return cachedProvider;

  cachedProvider =
    getConfiguredProviderName() === "tribute" ? new TributePaymentProvider() : new MockPaymentProvider();

  return cachedProvider;
}

export function isMockProvider(): boolean {
  return getConfiguredProviderName() === "mock";
}
