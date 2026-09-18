import { notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "@/i18n/navigation";
import { computeProductPrice, PricingError } from "@/lib/pricing";
import { formatPrice } from "@/lib/currency";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

interface PageProps {
  searchParams: Promise<{ product?: string; options?: string }>;
}

export default async function CheckoutPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const productId = sp.product;
  if (!productId) notFound();

  const [session, t, locale] = await Promise.all([auth(), getTranslations("checkout"), getLocale()]);

  if (!session?.user) {
    redirect({ href: { pathname: "/login", query: { callbackUrl: `/checkout?product=${productId}&options=${sp.options ?? ""}` } }, locale });
  }

  const selectedValueIds = (sp.options ?? "").split(",").filter(Boolean);

  let pricing;
  try {
    pricing = await computeProductPrice(productId, selectedValueIds);
  } catch (error) {
    if (error instanceof PricingError) notFound();
    throw error;
  }

  const { product, totalPrice, selectedOptions } = pricing;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-extrabold tracking-tight text-text sm:text-3xl">{t("title")}</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <h2 className="mb-4 font-semibold text-text">{t("orderSummary")}</h2>
          <dl className="flex flex-col gap-3 text-sm">
            <Row label={t("game")} value={product.game.name} />
            <Row label={t("service")} value={product.title} />
            {selectedOptions.length > 0 && (
              <div className="flex justify-between gap-4">
                <dt className="text-text-muted">{t("options")}</dt>
                <dd className="text-right text-text">
                  {selectedOptions.map((o) => (
                    <div key={o.valueId}>{o.valueLabel}</div>
                  ))}
                </dd>
              </div>
            )}
          </dl>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <span className="font-semibold text-text">{t("total")}</span>
            <span className="text-xl font-bold text-text">{formatPrice(totalPrice, "EUR", locale)}</span>
          </div>
        </div>

        <CheckoutForm productId={productId} selectedValueIds={selectedValueIds} defaultEmail={session!.user.email ?? ""} />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-text-muted">{label}</dt>
      <dd className="text-right font-medium text-text">{value}</dd>
    </div>
  );
}
