"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/currency";

interface PayButtonProps {
  orderId: string;
  amount: number;
  locale: string;
}

export function PayButton({ orderId, amount, locale }: PayButtonProps) {
  const t = useTranslations("payment");
  const tErrors = useTranslations("errors");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPay() {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/payments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(typeof data?.error === "string" ? data.error : tErrors("generic"));
      setLoading(false);
      return;
    }

    const data = await res.json();
    router.push(data.payment.redirectUrl as string);
  }

  return (
    <div>
      <Button size="lg" onClick={onPay} loading={loading} className="w-full">
        {t("pay", { amount: formatPrice(amount, "EUR", locale) })}
      </Button>
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
    </div>
  );
}
