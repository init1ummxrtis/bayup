import { routing } from "@/i18n/routing";
import { SUPPORTED_CURRENCIES, ACTIVE_CURRENCY } from "@/lib/currency";

export default function AdminSettingsPage() {
  const paymentProvider = process.env.PAYMENT_PROVIDER || "mock";
  const providerLabel = paymentProvider === "tribute" ? "Tribute" : "Mock";

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight text-text">Settings</h1>

      <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="mb-2 font-semibold text-text">Payment provider</h2>
        <p className="mb-3 text-sm text-text-muted">
          Current active provider: <span className="font-medium text-text">{providerLabel}</span>
        </p>
        <p className="text-sm text-text-muted">
          Payments are currently handled by the Mock provider. Switch to Tribute by setting{" "}
          <code className="rounded bg-bg px-1.5 py-0.5 text-xs text-text">PAYMENT_PROVIDER=tribute</code> in the
          environment once TributePaymentProvider (
          <code className="rounded bg-bg px-1.5 py-0.5 text-xs text-text">
            src/lib/payments/providers/TributePaymentProvider.ts
          </code>
          ) is implemented against the real Tribute API.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="mb-3 font-semibold text-text">Supported locales</h2>
        <div className="flex flex-wrap gap-2">
          {routing.locales.map((locale) => (
            <span
              key={locale}
              className="inline-flex items-center rounded-full border border-border bg-bg px-3 py-1 text-xs font-medium uppercase text-text-muted"
            >
              {locale}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="mb-3 font-semibold text-text">Currency</h2>
        <p className="mb-3 text-sm text-text-muted">
          Active currency: <span className="font-medium text-text">{ACTIVE_CURRENCY}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {SUPPORTED_CURRENCIES.map((c) => (
            <span
              key={c.code}
              className="inline-flex items-center rounded-full border border-border bg-bg px-3 py-1 text-xs font-medium text-text-muted"
            >
              {c.code} {c.enabled ? "(enabled)" : ""}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
