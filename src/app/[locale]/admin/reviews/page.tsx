import { getTranslations, getLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { Rating } from "@/components/Rating";
import { DeleteReviewButton } from "@/components/admin/DeleteReviewButton";

export default async function AdminReviewsPage() {
  const [t, locale, reviews] = await Promise.all([
    getTranslations("admin.nav"),
    getLocale(),
    db.review.findMany({
      include: {
        user: { select: { name: true } },
        product: { select: { title: true } },
        seller: { select: { displayName: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-text">{t("reviews")}</h1>

      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-text-muted">No reviews yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-text">{review.user.name}</p>
                  <p className="mt-0.5 text-xs text-text-subtle">
                    {review.product.title} · {review.seller.displayName} ·{" "}
                    {new Date(review.createdAt).toLocaleDateString(locale)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Rating value={review.rating} size="sm" />
                  <DeleteReviewButton reviewId={review.id} />
                </div>
              </div>
              {review.comment && <p className="mt-3 text-sm text-text-muted">{review.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
