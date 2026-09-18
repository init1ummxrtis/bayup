import { getTranslations, getLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Price } from "@/components/Price";
import { formatOrderNumber } from "@/lib/pricing";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Package } from "lucide-react";

export default async function OrdersPage() {
  const [session, t, locale] = await Promise.all([auth(), getTranslations("orders"), getLocale()]);

  const orders = await db.order.findMany({
    where: { userId: session!.user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-text">{t("myOrders")}</h1>

      {orders.length === 0 ? (
        <EmptyState
          icon={<Package size={22} />}
          title={t("empty")}
          action={<ButtonLink href="/games">{t("browseGames")}</ButtonLink>}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/profile/orders/${order.id}`}
              className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-border-strong"
            >
              <div>
                <p className="font-medium text-text">{order.items[0]?.title}</p>
                <p className="mt-1 text-xs text-text-subtle">
                  {t("orderNumber", { orderNumber: formatOrderNumber(order.orderNumber) })} ·{" "}
                  {t("placedOn", { date: new Date(order.createdAt).toLocaleDateString(locale) })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Price amount={Number(order.totalPrice)} />
                <StatusBadge status={order.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
