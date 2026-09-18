import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchX } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const t = await getTranslations("search");

  const products = query
    ? await db.product.findMany({
        where: {
          status: "ACTIVE",
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { game: { name: { contains: query, mode: "insensitive" } } },
          ],
        },
        include: { game: true },
        orderBy: { ordersCount: "desc" },
        take: 30,
      })
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold tracking-tight text-text sm:text-3xl">
        {query ? t("title", { query }) : t("placeholder")}
      </h1>

      {query && products.length === 0 ? (
        <EmptyState icon={<SearchX size={22} />} title={t("empty")} />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
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
      )}
    </div>
  );
}
