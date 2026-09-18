"use client";

import { useState, type ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { getAllowedNextStatuses, type OrderStatus } from "@/lib/orderStatusTransitions";

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { show } = useToast();
  const t = useTranslations("orders.status");
  // The current status is always selectable (no-op) plus whatever the
  // centralized transition policy allows moving to next — the API is still
  // the source of truth, this just keeps the UI from offering dead ends.
  // REFUNDED is excluded even when it would otherwise be the current status:
  // refunds aren't implemented yet, so the admin UI must never present it as
  // an action, not even as an inert "current value" in the dropdown.
  const selectableStatuses = [status, ...getAllowedNextStatuses(status)].filter((s) => s !== "REFUNDED");

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

  // REFUNDED itself has no allowed transitions and is excluded above, so a
  // REFUNDED order has nothing left to select — show it as a plain read-only
  // value instead of rendering an empty, non-functional dropdown.
  if (selectableStatuses.length === 0) {
    return (
      <span className="inline-flex h-9 items-center rounded-lg border border-border bg-surface px-2 text-sm text-text-muted">
        {t(status)}
      </span>
    );
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
      {selectableStatuses.map((s) => (
        <option key={s} value={s}>
          {t(s)}
        </option>
      ))}
    </select>
  );
}
