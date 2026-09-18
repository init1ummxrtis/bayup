import { getTranslations, getLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Price } from "@/components/Price";
import { formatOrderNumber } from "@/lib/pricing";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";

export default async function AdminOrdersPage() {
  const [t, locale, orders] = await Promise.all([
    getTranslations("admin.nav"),
    getLocale(),
    db.order.findMany({
      include: {
        items: true,
        payments: true,
        user: { select: { email: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-text">{t("orders")}</h1>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-text-muted">No orders yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-text">{order.items[0]?.title}</p>
                <p className="mt-1 text-xs text-text-subtle">
                  Order #{formatOrderNumber(order.orderNumber)} · {order.user.email} ·{" "}
                  {new Date(order.createdAt).toLocaleDateString(locale)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Price amount={Number(order.totalPrice)} />
                <StatusBadge status={order.status} />
                <OrderStatusSelect orderId={order.id} status={order.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
