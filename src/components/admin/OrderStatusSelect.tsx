"use client";

import { useState, type ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

const STATUSES = [
  "PENDING",
  "PAYMENT_PENDING",
  "PAID",
  "PROCESSING",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
] as const;

type OrderStatus = (typeof STATUSES)[number];

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { show } = useToast();
  const t = useTranslations("orders.status");

  async function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextStatus = event.target.value;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(typeof data.error === "string" ? data.error : "Failed to update status");
      }
      show("Order status updated", "success");
      router.refresh();
    } catch (err) {
      show(err instanceof Error ? err.message : "Failed to update status", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <select
      value={status}
      disabled={loading}
      onChange={handleChange}
      className={cn(
        "h-9 rounded-lg border border-border bg-surface px-2 text-sm text-text disabled:opacity-50",
        "focus:outline-none focus:ring-2 focus:ring-primary/40"
      )}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {t(s)}
        </option>
      ))}
    </select>
  );
}
