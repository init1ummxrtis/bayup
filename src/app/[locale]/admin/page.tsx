import { getTranslations, getLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { StatCard } from "@/components/admin/StatCard";
import { formatPrice } from "@/lib/currency";
import { Package, Wallet, Clock, CheckCircle2, Users, Store } from "lucide-react";

export default async function AdminDashboardPage() {
  const [t, locale, totalOrders, pendingOrders, completedOrders, users, sellers, paidAgg] = await Promise.all([
    getTranslations("admin.dashboard"),
    getLocale(),
    db.order.count(),
    db.order.count({ where: { status: { in: ["PENDING", "PAYMENT_PENDING"] } } }),
    db.order.count({ where: { status: "COMPLETED" } }),
    db.user.count(),
    db.seller.count(),
    db.order.aggregate({
      where: { status: { in: ["PAID", "PROCESSING", "COMPLETED"] } },
      _sum: { totalPrice: true },
    }),
  ]);

  const revenue = Number(paidAgg._sum.totalPrice ?? 0);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-text">{t("totalOrders")}</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label={t("totalOrders")} value={String(totalOrders)} icon={<Package size={18} />} />
        <StatCard label={t("revenue")} value={formatPrice(revenue, "EUR", locale)} icon={<Wallet size={18} />} />
        <StatCard label={t("pendingOrders")} value={String(pendingOrders)} icon={<Clock size={18} />} />
        <StatCard label={t("completedOrders")} value={String(completedOrders)} icon={<CheckCircle2 size={18} />} />
        <StatCard label={t("users")} value={String(users)} icon={<Users size={18} />} />
        <StatCard label={t("sellers")} value={String(sellers)} icon={<Store size={18} />} />
      </div>
    </div>
  );
}
