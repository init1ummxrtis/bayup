"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

export function ReviewForm({ orderId, onSubmitted }: { orderId: string; onSubmitted: () => void }) {
  const t = useTranslations("review");
  const tToast = useTranslations("toast");
  const tErrors = useTranslations("errors");
  const { show } = useToast();

  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, rating, comment: comment || undefined }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(typeof data?.error === "string" ? data.error : tErrors("generic"));
      setSubmitting(false);
      return;
    }

    show(tToast("reviewSubmitted"), "success");
    onSubmitted();
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-surface p-5">
      <h3 className="mb-3 font-semibold text-text">{t("title")}</h3>

      <div className="mb-4 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => setRating(n)}
            aria-label={`${t("rating")}: ${n}`}
          >
            <Star
              size={26}
              className={cn(
                (hovered ?? rating) >= n ? "fill-warning text-warning" : "text-border-strong"
              )}
            />
          </button>
        ))}
      </div>

      <textarea
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={t("commentPlaceholder")}
        className="w-full resize-none rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-text outline-none focus:border-primary"
      />

      {error && <p className="mt-2 text-sm text-danger">{error}</p>}

      <Button type="submit" loading={submitting} className="mt-3">
        {t("submit")}
      </Button>
    </form>
  );
}
