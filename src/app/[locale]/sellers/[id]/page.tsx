import { notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import { Rating } from "@/components/Rating";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SellerPage({ params }: PageProps) {
  const { id } = await params;
  const [t, locale] = await Promise.all([getTranslations("seller"), getLocale()]);

  const seller = await db.seller.findUnique({
    where: { id },
    include: { products: { where: { status: "ACTIVE" }, include: { game: true } } },
  });
  if (!seller) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-2xl font-bold text-primary">
            {seller.displayName.charAt(0)}
          </span>
          <div>
            <h1 className="text-xl font-bold text-text">{seller.displayName}</h1>
            <Rating value={Number(seller.rating)} />
          </div>
        </div>
        {seller.bio && <p className="mt-4 text-sm leading-relaxed text-text-muted">{seller.bio}</p>}

        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border pt-6 text-sm">
          <div>
            <p className="text-text-subtle">{t("ordersCompleted")}</p>
            <p className="font-medium text-text">{seller.ordersCompleted}+</p>
          </div>
          <div>
            <p className="text-text-subtle">{t("responseTime")}</p>
            <p className="font-medium text-text">~{seller.responseTimeMinutes} min</p>
          </div>
          <div>
            <p className="text-text-subtle">{t("memberSince", { date: new Date(seller.memberSince).toLocaleDateString(locale) })}</p>
          </div>
        </div>
      </div>

      <h2 className="mb-4 mt-10 font-semibold text-text">{t("availableServices")}</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {seller.products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            title={product.title}
            basePrice={Number(product.basePrice)}
            rating={Number(product.rating)}
            reviewCount={product.reviewCount}
            ordersCount={product.ordersCount}
            deliveryTime={product.deliveryTime}
            gameSlug={product.game.slug}
          />
        ))}
      </div>
    </div>
  );
}
