"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";

interface MockSimulatorProps {
  paymentId: string;
  orderId: string;
}

export function MockSimulator({ paymentId, orderId }: MockSimulatorProps) {
  const t = useTranslations("payment.mock");
  const router = useRouter();
  const [loading, setLoading] = useState<"success" | "failure" | null>(null);

  async function simulate(result: "success" | "failure") {
    setLoading(result);
    const res = await fetch(`/api/payments/mock/${paymentId}/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ result }),
    });

    if (res.ok) {
      router.push(result === "success" ? `/payment/success/${orderId}` : `/payment/failed/${orderId}`);
    } else {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Button size="lg" onClick={() => simulate("success")} loading={loading === "success"} disabled={loading !== null}>
        {t("simulateSuccess")}
      </Button>
      <Button
        size="lg"
        variant="secondary"
        onClick={() => simulate("failure")}
        loading={loading === "failure"}
        disabled={loading !== null}
      >
        {t("simulateFailure")}
      </Button>
    </div>
  );
}
