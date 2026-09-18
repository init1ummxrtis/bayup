"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "next-intl";

export function OrderReviewSection({ orderId }: { orderId: string }) {
  const t = useTranslations("orders");
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  if (showForm) {
    return <ReviewForm orderId={orderId} onSubmitted={() => router.refresh()} />;
  }

  return (
    <Button variant="secondary" onClick={() => setShowForm(true)}>
      {t("leaveReview")}
    </Button>
  );
}
