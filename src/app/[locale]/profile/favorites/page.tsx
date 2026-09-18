import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import { HeartOff } from "lucide-react";

export default async function FavoritesPage() {
  const [session, t, tOrders] = await Promise.all([
    auth(),
    getTranslations("profile"),
    getTranslations("orders"),
  ]);

  const favorites = await db.favorite.findMany({
    where: { userId: session!.user.id },
    include: { product: { include: { game: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-text">{t("favorites")}</h1>

      {favorites.length === 0 ? (
        <EmptyState
          icon={<HeartOff size={22} />}
          title={t("noFavorites")}
          action={<ButtonLink href="/games">{tOrders("browseGames")}</ButtonLink>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {favorites.map((fav) => (
            <ProductCard
              key={fav.id}
              id={fav.product.id}
              title={fav.product.title}
              basePrice={Number(fav.product.basePrice)}
              rating={Number(fav.product.rating)}
              reviewCount={fav.product.reviewCount}
              ordersCount={fav.product.ordersCount}
              deliveryTime={fav.product.deliveryTime}
              gameSlug={fav.product.game.slug}
            />
          ))}
        </div>
      )}
    </div>
  );
}
