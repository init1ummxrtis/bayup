import { getTranslations, getLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { Price } from "@/components/Price";
import { formatOrderNumber } from "@/lib/pricing";
import { cn } from "@/lib/utils";

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-border/30 text-text-muted border-border",
  SUCCEEDED: "bg-accent-soft text-accent border-accent/30",
  FAILED: "bg-danger-soft text-danger border-danger/30",
  REFUNDED: "bg-border/30 text-text-muted border-border",
};

export default async function AdminPaymentsPage() {
  const [t, locale, payments] = await Promise.all([
    getTranslations("admin.nav"),
    getLocale(),
    db.payment.findMany({
      include: { order: { select: { orderNumber: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-text">{t("payments")}</h1>

      {payments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-text-muted">No payments yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-text-subtle">
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Provider</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Provider payment ID</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-text">#{formatOrderNumber(payment.order.orderNumber)}</td>
                  <td className="px-4 py-3 text-text-muted">{payment.provider}</td>
                  <td className="px-4 py-3">
                    <Price amount={Number(payment.amount)} />
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
                        PAYMENT_STATUS_STYLES[payment.status]
                      )}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-subtle">{payment.providerPaymentId ?? "—"}</td>
                  <td className="px-4 py-3 text-text-subtle">
                    {new Date(payment.createdAt).toLocaleDateString(locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
