import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import { Rating } from "@/components/Rating";

export default async function SellersPage() {
  const [t, tNav, sellers] = await Promise.all([
    getTranslations("seller"),
    getTranslations("nav"),
    db.seller.findMany({ orderBy: { rating: "desc" } }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold tracking-tight text-text sm:text-3xl">{tNav("sellers")}</h1>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {sellers.map((seller) => (
          <Link
            key={seller.id}
            href={`/sellers/${seller.id}`}
            className="rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-border-strong"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-lg font-bold text-primary">
                {seller.displayName.charAt(0)}
              </span>
              <div>
                <p className="font-semibold text-text">{seller.displayName}</p>
                <Rating value={Number(seller.rating)} size="sm" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-text-subtle">{t("ordersCompleted")}</p>
                <p className="font-medium text-text">{seller.ordersCompleted}+</p>
              </div>
              <div>
                <p className="text-text-subtle">{t("responseTime")}</p>
                <p className="font-medium text-text">~{seller.responseTimeMinutes} min</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
