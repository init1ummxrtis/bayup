import { notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "@/i18n/navigation";
import { db } from "@/lib/db";
import { formatOrderNumber } from "@/lib/pricing";
import { formatPrice } from "@/lib/currency";
import { PayButton } from "@/components/payment/PayButton";

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export default async function PaymentPage({ params }: PageProps) {
  const { orderId } = await params;
  const [session, t, tCheckout, locale] = await Promise.all([
    auth(),
    getTranslations("payment"),
    getTranslations("checkout"),
    getLocale(),
  ]);

  if (!session?.user) {
    redirect({ href: { pathname: "/login", query: { callbackUrl: `/payment/${orderId}` } }, locale });
  }

  const order = await db.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order || order.userId !== session!.user.id) notFound();

  if (order.status === "PAID" || order.status === "PROCESSING" || order.status === "COMPLETED") {
    redirect({ href: `/payment/success/${order.id}`, locale });
  }
  // CANCELLED orders (today, always the result of a failed payment) are
  // retryable: fall through to the same pay UI as a fresh PENDING order
  // instead of bouncing to the failed page, which would be a dead-end loop.

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="rounded-2xl border border-border bg-surface p-6">
        <h1 className="text-xl font-bold text-text">{t("title", { orderNumber: formatOrderNumber(order.orderNumber) })}</h1>
        <p className="mt-1 text-sm text-text-muted">{order.items[0]?.title}</p>

        <div className="my-6 flex items-center justify-between rounded-xl bg-bg-elevated p-4">
          <span className="text-sm text-text-muted">{tCheckout("total")}</span>
          <span className="text-2xl font-bold text-text">{formatPrice(Number(order.totalPrice), "EUR", locale)}</span>
        </div>

        <p className="mb-2 text-sm font-medium text-text-muted">{t("method")}</p>
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-border-strong bg-bg-elevated px-4 py-3 text-sm font-medium text-text">
          <span className="h-2 w-2 rounded-full bg-accent" />
          Tribute
        </div>

        <PayButton orderId={order.id} amount={Number(order.totalPrice)} locale={locale} />
      </div>
    </div>
  );
}
