"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatPrice, ACTIVE_CURRENCY } from "@/lib/currency";
import { cn } from "@/lib/utils";

interface PriceProps {
  amount: number | string;
  from?: boolean;
  className?: string;
}

export function Price({ amount, from, className }: PriceProps) {
  const locale = useLocale();
  const t = useTranslations("common");
  return (
    <span className={cn("font-semibold text-text", className)}>
      {from && <span className="font-normal text-text-muted mr-1">{t("from")}</span>}
      {formatPrice(amount, ACTIVE_CURRENCY, locale)}
    </span>
  );
}
