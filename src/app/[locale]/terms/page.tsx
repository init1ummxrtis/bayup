import { getTranslations } from "next-intl/server";

export default async function TermsPage() {
  const t = await getTranslations("footer");
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-text">{t("terms")}</h1>
      <div className="flex flex-col gap-4 text-sm leading-relaxed text-text-muted">
        <p>
          By placing an order on BuyUP you agree that the service is delivered by an independent seller,
          and that account details you provide are used solely to complete that service.
        </p>
        <p>This is placeholder legal copy for the demo build — replace with reviewed terms before launch.</p>
      </div>
    </div>
  );
}
