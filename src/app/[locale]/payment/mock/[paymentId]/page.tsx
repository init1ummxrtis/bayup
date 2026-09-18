import { notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isMockProvider } from "@/lib/payments";
import { formatOrderNumber } from "@/lib/pricing";
import { formatPrice } from "@/lib/currency";
import { MockSimulator } from "@/components/payment/MockSimulator";

interface PageProps {
  params: Promise<{ paymentId: string }>;
}

export default async function MockPaymentPage({ params }: PageProps) {
  if (!isMockProvider()) notFound();

  const { paymentId } = await params;
  const [session, t, locale] = await Promise.all([auth(), getTranslations("payment.mock"), getLocale()]);
  if (!session?.user) notFound();

  const payment = await db.payment.findUnique({ where: { id: paymentId }, include: { order: true } });
  if (!payment || payment.order.userId !== session.user.id) notFound();

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="rounded-2xl border border-dashed border-warning/50 bg-surface p-6">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-warning">{t("title")}</p>
        <p className="mb-6 text-sm text-text-muted">{t("subtitle")}</p>

        <div className="mb-6 rounded-xl bg-bg-elevated p-4">
          <p className="text-sm text-text-muted">Order #{formatOrderNumber(payment.order.orderNumber)}</p>
          <p className="mt-1 text-2xl font-bold text-text">{formatPrice(Number(payment.amount), "EUR", locale)}</p>
        </div>

        <MockSimulator paymentId={payment.id} orderId={payment.orderId} />
      </div>
    </div>
  );
}
