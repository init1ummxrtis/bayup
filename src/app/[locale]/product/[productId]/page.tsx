import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Link } from "@/i18n/navigation";
import { Rating } from "@/components/Rating";
import { OptionSelector } from "@/components/product/OptionSelector";
import { gameGradient } from "@/lib/gameTheme";
import { Clock, MessageSquare } from "lucide-react";

interface PageProps {
  params: Promise<{ productId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { productId } = await params;
  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) return {};
  return { title: product.title, description: product.description };
}

export default async function ProductPage({ params }: PageProps) {
  const { productId } = await params;

  const [t, tSeller, session] = await Promise.all([
    getTranslations("product"),
    getTranslations("seller"),
    auth(),
  ]);

  const product = await db.product.findUnique({
    where: { id: productId },
    include: {
      game: true,
      seller: true,
      optionGroups: { include: { values: { orderBy: { sortOrder: "asc" } } }, orderBy: { sortOrder: "asc" } },
      reviews: { include: { user: true }, orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!product || product.status !== "ACTIVE") notFound();

  const isFavorite = session?.user
    ? Boolean(
        await db.favorite.findUnique({
          where: { userId_productId: { userId: session.user.id, productId } },
        })
      )
    : false;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 h-40 w-full rounded-2xl sm:h-56" style={{ backgroundImage: gameGradient(product.game.slug) }} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          <Link href={`/browse/${product.game.slug}`} className="text-sm text-primary hover:underline">
            {product.game.name}
          </Link>
          <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-text sm:text-3xl">{product.title}</h1>
          <div className="mt-2 flex items-center gap-4">
            <Rating value={Number(product.rating)} count={product.reviewCount} />
            <div className="flex items-center gap-1.5 text-sm text-text-subtle">
              <Clock size={14} />
              {product.deliveryTime}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-surface p-5 sm:p-6">
            <h2 className="mb-2 font-semibold text-text">{t("description")}</h2>
            <p className="text-sm leading-relaxed text-text-muted">{product.description}</p>
          </div>

          <div className="mt-6 lg:hidden">
            <OptionSelector
              productId={product.id}
              basePrice={Number(product.basePrice)}
              optionGroups={product.optionGroups.map(serializeGroup)}
              isFavorite={isFavorite}
              isAuthenticated={Boolean(session?.user)}
            />
          </div>

          <div className="mt-8">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-text">
              <MessageSquare size={18} />
              {t("reviewsTitle")}
            </h2>
            {product.reviews.length === 0 ? (
              <p className="text-sm text-text-muted">{t("noReviews")}</p>
            ) : (
              <div className="flex flex-col gap-4">
                {product.reviews.map((review) => (
                  <div key={review.id} className="rounded-xl border border-border bg-surface p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-text">{review.user.name}</span>
                      <Rating value={review.rating} size="sm" />
                    </div>
                    {review.comment && <p className="mt-2 text-sm text-text-muted">{review.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="hidden lg:block">
            <OptionSelector
              productId={product.id}
              basePrice={Number(product.basePrice)}
              optionGroups={product.optionGroups.map(serializeGroup)}
              isFavorite={isFavorite}
              isAuthenticated={Boolean(session?.user)}
            />
          </div>

          <Link href={`/sellers/${product.seller.id}`} className="rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-border-strong">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-text-subtle">{t("seller")}</p>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-lg font-bold text-primary">
                {product.seller.displayName.charAt(0)}
              </span>
              <div>
                <p className="font-semibold text-text">{product.seller.displayName}</p>
                <Rating value={Number(product.seller.rating)} size="sm" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-text-subtle">{tSeller("ordersCompleted")}</p>
                <p className="font-medium text-text">{product.seller.ordersCompleted}+</p>
              </div>
              <div>
                <p className="text-text-subtle">{tSeller("responseTime")}</p>
                <p className="font-medium text-text">~{product.seller.responseTimeMinutes} min</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

function serializeGroup(group: {
  id: string;
  name: string;
  type: "SINGLE_SELECT" | "MULTI_SELECT";
  required: boolean;
  values: { id: string; label: string; priceModifier: unknown }[];
}) {
  return {
    id: group.id,
    name: group.name,
    type: group.type,
    required: group.required,
    values: group.values.map((v) => ({ id: v.id, label: v.label, priceModifier: Number(v.priceModifier) })),
  };
}
