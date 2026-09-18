import { getTranslations } from "next-intl/server";

export default async function SupportPage() {
  const t = await getTranslations("footer");
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-text">{t("support")}</h1>
      <div className="flex flex-col gap-4 text-sm leading-relaxed text-text-muted">
        <p>Need help with an order, a payment, or your account? Reach us anytime.</p>
        <p>
          Email:{" "}
          <a href="mailto:support@bayup.dev" className="text-primary hover:underline">
            support@bayup.dev
          </a>
        </p>
        <p>Most tickets are answered within a few hours. For order-specific issues, include your order number.</p>
      </div>
    </div>
  );
}
