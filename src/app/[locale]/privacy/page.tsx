import { getTranslations } from "next-intl/server";

export default async function PrivacyPage() {
  const t = await getTranslations("footer");
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-text">{t("privacy")}</h1>
      <div className="flex flex-col gap-4 text-sm leading-relaxed text-text-muted">
        <p>
          We store your account, order and payment records only for as long as needed to deliver and support
          your orders. We never sell your data, and payment details are handled by our payment provider, not
          stored on BuyUP&apos;s servers.
        </p>
        <p>This is placeholder privacy copy for the demo build — replace with a reviewed policy before launch.</p>
      </div>
    </div>
  );
}
