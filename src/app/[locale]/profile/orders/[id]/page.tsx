import { notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Rating } from "@/components/Rating";
import { formatPrice } from "@/lib/currency";
import { formatOrderNumber } from "@/lib/pricing";
import { OrderReviewSection } from "@/components/reviews/OrderReviewSection";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-border/30 text-text-muted border-border",
  SUCCEEDED: "bg-accent-soft text-accent border-accent/30",
  FAILED: "bg-danger-soft text-danger border-danger/30",
  REFUNDED: "bg-border/30 text-text-muted border-border",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [session, t, tCheckout, tReview, tPaymentInfo, tPaymentStatus, tPaymentProvider, locale] = await Promise.all([
    auth(),
    getTranslations("orders"),
    getTranslations("checkout"),
    getTranslations("review"),
    getTranslations("payment.info"),
    getTranslations("payment.status"),
    getTranslations("payment.provider"),
    getLocale(),
  ]);

  const order = await db.order.findUnique({
    where: { id },
    include: { items: true, payments: { orderBy: { createdAt: "desc" } }, review: true },
  });

  if (!order || order.userId !== session!.user.id) notFound();

  const item = order.items[0];
  const selectedOptions = (item?.selectedOptions ?? []) as { groupName: string; valueLabel: string }[];
  const payment = order.payments[0];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-text">
          {t("orderNumber", { orderNumber: formatOrderNumber(order.orderNumber) })}
        </h1>
        <StatusBadge status={order.status} />
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="font-semibold text-text">{item?.title}</h2>
        {selectedOptions.length > 0 && (
          <ul className="mt-2 flex flex-col gap-1 text-sm text-text-muted">
            {selectedOptions.map((o, i) => (
              <li key={i}>
                {o.groupName}: {o.valueLabel}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-text-subtle">{tCheckout("total")}</p>
            <p className="font-medium text-text">{formatPrice(Number(order.totalPrice), "EUR", locale)}</p>
          </div>
          <div>
            <p className="font-medium text-text">
              {t("placedOn", { date: new Date(order.createdAt).toLocaleDateString(locale) })}
            </p>
          </div>
          <div>
            <p className="text-text-subtle">{tCheckout("gamingUsername")}</p>
            <p className="font-medium text-text">{order.gamingUsername}</p>
          </div>
        </div>

        {order.additionalInformation && (
          <div className="mt-4 border-t border-border pt-4 text-sm">
            <p className="text-text-subtle">{tCheckout("additionalInformation")}</p>
            <p className="mt-1 text-text">{order.additionalInformation}</p>
          </div>
        )}
      </div>

      {payment && (
        <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-semibold text-text">{tPaymentInfo("title")}</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div>
              <p className="text-text-subtle">{tPaymentInfo("status")}</p>
              <span
                className={cn(
                  "mt-1 inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
                  PAYMENT_STATUS_STYLES[payment.status]
                )}
              >
                {tPaymentStatus(payment.status)}
              </span>
            </div>
            <div>
              <p className="text-text-subtle">{tPaymentInfo("provider")}</p>
              <p className="font-medium text-text">{tPaymentProvider(payment.provider)}</p>
            </div>
            <div>
              <p className="text-text-subtle">{tPaymentInfo("amount")}</p>
              <p className="font-medium text-text">{formatPrice(Number(payment.amount), "EUR", locale)}</p>
            </div>
            <div>
              <p className="text-text-subtle">{tPaymentInfo("date")}</p>
              <p className="font-medium text-text">{new Date(payment.createdAt).toLocaleString(locale)}</p>
            </div>
          </div>
        </div>
      )}

      {(order.status === "PENDING" || order.status === "PAYMENT_PENDING") && (
        <div className="mt-6">
          <ButtonLink href={`/payment/${order.id}`}>{t("continueToPayment")}</ButtonLink>
        </div>
      )}

      {order.status === "COMPLETED" && (
        <div className="mt-6">
          {order.review ? (
            <div className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex items-center justify-between">
                <span className="font-medium text-text">{tReview("yourReview")}</span>
                <Rating value={order.review.rating} size="sm" />
              </div>
              {order.review.comment && <p className="mt-2 text-sm text-text-muted">{order.review.comment}</p>}
            </div>
          ) : (
            <OrderReviewSection orderId={order.id} />
          )}
        </div>
      )}
    </div>
  );
}
