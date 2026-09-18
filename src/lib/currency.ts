export type Currency = "EUR" | "USD" | "GBP" | "PLN" | "CZK" | "HUF" | "RON";

export const ACTIVE_CURRENCY: Currency = "EUR";

export const SUPPORTED_CURRENCIES: { code: Currency; label: string; enabled: boolean }[] = [
  { code: "EUR", label: "Euro", enabled: true },
  { code: "USD", label: "US Dollar", enabled: false },
  { code: "GBP", label: "British Pound", enabled: false },
  { code: "PLN", label: "Polish Zloty", enabled: false },
  { code: "CZK", label: "Czech Koruna", enabled: false },
  { code: "HUF", label: "Hungarian Forint", enabled: false },
  { code: "RON", label: "Romanian Leu", enabled: false },
];

/**
 * Formats a decimal amount as currency. Only EUR is wired to real prices today;
 * other currencies are listed for UI purposes and will need conversion rates
 * before being enabled.
 */
export function formatPrice(
  amount: number | string,
  currency: Currency = ACTIVE_CURRENCY,
  locale = "en"
): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatFromPrice(amount: number | string, currency: Currency = ACTIVE_CURRENCY, locale = "en"): string {
  return formatPrice(amount, currency, locale);
}
