import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type OrderStatus = "PENDING" | "PAYMENT_PENDING" | "PAID" | "PROCESSING" | "COMPLETED" | "CANCELLED" | "REFUNDED";

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-border/30 text-text-muted border-border",
  PAYMENT_PENDING: "bg-warning/10 text-warning border-warning/30",
  PAID: "bg-accent-soft text-accent border-accent/30",
  PROCESSING: "bg-primary-soft text-primary border-primary/30",
  COMPLETED: "bg-accent-soft text-accent border-accent/30",
  CANCELLED: "bg-danger-soft text-danger border-danger/30",
  REFUNDED: "bg-border/30 text-text-muted border-border",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const t = useTranslations("orders.status");
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium", STATUS_STYLES[status])}>
      {t(status)}
    </span>
  );
}
