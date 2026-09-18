import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Rating } from "@/components/Rating";
import { Price } from "@/components/Price";
import { gameGradient } from "@/lib/gameTheme";
import { Clock } from "lucide-react";

interface ProductCardProps {
  id: string;
  title: string;
  basePrice: number;
  rating: number;
  reviewCount: number;
  ordersCount: number;
  deliveryTime: string;
  gameSlug: string;
}

export async function ProductCard({
  id,
  title,
  basePrice,
  rating,
  reviewCount,
  ordersCount,
  deliveryTime,
  gameSlug,
}: ProductCardProps) {
  const [t, tCommon] = await Promise.all([getTranslations("catalog"), getTranslations("common")]);

  return (
    <Link
      href={`/product/${id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:border-border-strong hover:-translate-y-0.5"
    >
      <div className="h-28 w-full" style={{ backgroundImage: gameGradient(gameSlug) }} />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 font-semibold text-text">{title}</h3>
        <Rating value={rating} count={reviewCount} />
        <div className="flex items-center gap-1.5 text-xs text-text-subtle">
          <Clock size={13} />
          {deliveryTime}
        </div>
        <div className="mt-auto flex items-center justify-between pt-2">
          <Price amount={basePrice} from className="text-base" />
          <span className="text-xs text-text-subtle">
            {ordersCount}+ {tCommon("orders")}
          </span>
        </div>
        <span className="inline-flex w-full items-center justify-center rounded-lg border border-border py-2 text-sm font-medium text-text-muted transition-colors group-hover:border-primary group-hover:text-primary">
          {t("viewOffer")}
        </span>
      </div>
    </Link>
  );
}
