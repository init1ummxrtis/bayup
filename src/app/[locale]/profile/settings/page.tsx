import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";
import { cn } from "@/lib/utils";

const LOCALE_LABELS: Record<string, string> = {
  en: "English",
  hu: "Magyar",
  it: "Italiano",
  pl: "Polski",
  fr: "Français",
  es: "Español",
  ro: "Română",
  cs: "Čeština",
  de: "Deutsch",
};

export default async function SettingsPage() {
  const [t, tCurrency, locale] = await Promise.all([
    getTranslations("profile"),
    getTranslations("currency"),
    getLocale(),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-text">{t("settings")}</h1>

      <div className="flex flex-col gap-6">
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="mb-4 font-semibold text-text">{t("language")}</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {routing.locales.map((loc) => (
              <Link
                key={loc}
                href="/profile/settings"
                locale={loc}
                className={cn(
                  "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                  loc === locale ? "border-primary bg-primary-soft text-primary" : "border-border text-text-muted hover:text-text"
                )}
              >
                {LOCALE_LABELS[loc]}
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="mb-4 font-semibold text-text">{t("currency")}</h2>
          <div className="flex flex-col gap-2">
            {SUPPORTED_CURRENCIES.map((c) => (
              <div
                key={c.code}
                className={cn(
                  "flex items-center justify-between rounded-lg border px-3.5 py-2.5 text-sm",
                  c.enabled ? "border-primary bg-primary-soft text-primary" : "border-border text-text-subtle"
                )}
              >
                <span>
                  {c.code} · {c.label}
                </span>
                {!c.enabled && <span className="text-xs">{tCurrency("comingSoon")}</span>}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
