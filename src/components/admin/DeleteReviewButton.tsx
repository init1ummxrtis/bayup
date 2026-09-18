"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";

export function DeleteReviewButton({ reviewId }: { reviewId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { show } = useToast();

  async function handleDelete() {
    if (!window.confirm("Delete this review? This cannot be undone.")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(typeof data.error === "string" ? data.error : "Failed to delete review");
      }
      show("Review deleted", "success");
      router.refresh();
    } catch (err) {
      show(err instanceof Error ? err.message : "Failed to delete review", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="danger" size="sm" loading={loading} onClick={handleDelete}>
      Delete
    </Button>
  );
}
