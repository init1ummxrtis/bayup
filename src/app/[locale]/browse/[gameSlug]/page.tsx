import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/ProductCard";
import { CatalogFilters } from "@/components/filters/CatalogFilters";
import { SortDropdown } from "@/components/filters/SortDropdown";
import { EmptyState } from "@/components/ui/EmptyState";
import { gameGradient } from "@/lib/gameTheme";
import { cn } from "@/lib/utils";
import { PackageX } from "lucide-react";

const PAGE_SIZE = 9;

interface PageProps {
  params: Promise<{ gameSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { gameSlug } = await params;
  const game = await db.game.findUnique({ where: { slug: gameSlug } });
  if (!game) return {};
  return { title: game.name, description: game.description };
}

export default async function GameCatalogPage({ params, searchParams }: PageProps) {
  const { gameSlug } = await params;
  const sp = await searchParams;

  const game = await db.game.findUnique({
    where: { slug: gameSlug },
    include: { categories: { orderBy: { sortOrder: "asc" } } },
  });
  if (!game || !game.isActive) notFound();

  const tCatalog = await getTranslations("catalog");

  const category = typeof sp.category === "string" ? sp.category : undefined;
  const minPrice = typeof sp.minPrice === "string" ? Number(sp.minPrice) : undefined;
  const maxPrice = typeof sp.maxPrice === "string" ? Number(sp.maxPrice) : undefined;
  const rating = typeof sp.rating === "string" ? Number(sp.rating) : undefined;
  const delivery = typeof sp.delivery === "string" ? sp.delivery : undefined;
  const sort = typeof sp.sort === "string" ? sp.sort : "popular";
  const page = typeof sp.page === "string" ? Math.max(1, Number(sp.page)) : 1;

  const where: Prisma.ProductWhereInput = {
    gameId: game.id,
    status: "ACTIVE",
    ...(category ? { category: { slug: category } } : {}),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? { basePrice: { gte: minPrice ?? undefined, lte: maxPrice ?? undefined } }
      : {}),
    ...(rating !== undefined ? { rating: { gte: rating } } : {}),
    ...(delivery === "fast" ? { deliveryTime: { in: ["24 hours"] } } : {}),
    ...(delivery === "normal" ? { deliveryTime: { notIn: ["24 hours"] } } : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "priceAsc"
      ? { basePrice: "asc" }
      : sort === "priceDesc"
        ? { basePrice: "desc" }
        : sort === "rating"
          ? { rating: "desc" }
          : { ordersCount: "desc" };

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.product.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="relative h-48 w-full overflow-hidden sm:h-64" style={{ backgroundImage: gameGradient(game.slug) }}>
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
        <div className="relative mx-auto flex h-full max-w-7xl items-end px-4 pb-6 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{game.name}</h1>
            <p className="mt-1.5 max-w-2xl text-sm text-white/80 sm:text-base">{game.description}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            href={{ pathname: `/browse/${game.slug}`, query: sort !== "popular" ? { sort } : undefined }}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              !category ? "border-primary bg-primary-soft text-primary" : "border-border text-text-muted hover:text-text"
            )}
          >
            {tCatalog("allCategories")}
          </Link>
          {game.categories.map((cat) => (
            <Link
              key={cat.id}
              href={{ pathname: `/browse/${game.slug}`, query: { category: cat.slug, ...(sort !== "popular" ? { sort } : {}) } }}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                category === cat.slug
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border text-text-muted hover:text-text"
              )}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <CatalogFilters />
          </aside>

          <div>
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm text-text-muted">
                {tCatalog("resultsCount", { count: total })}
              </p>
              <SortDropdown />
            </div>

            {products.length === 0 ? (
              <EmptyState icon={<PackageX size={22} />} title={tCatalog("empty")} />
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
                    gameSlug={game.slug}
                  />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const p = i + 1;
                  return (
                    <Link
                      key={p}
                      href={{ pathname: `/browse/${game.slug}`, query: { ...sp, page: String(p) } }}
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium",
                        p === page ? "border-primary bg-primary-soft text-primary" : "border-border text-text-muted hover:text-text"
                      )}
                    >
                      {p}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
