import { db } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import { Rating } from "@/components/Rating";

export default async function AdminSellersPage() {
  const sellers = await db.seller.findMany({
    include: {
      user: { select: { email: true } },
      _count: { select: { products: true } },
    },
    orderBy: { memberSince: "asc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-text">Sellers</h1>

      {sellers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-text-muted">
          No sellers yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sellers.map((seller) => (
            <Link
              key={seller.id}
              href={`/admin/sellers/${seller.id}/edit`}
              className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-border-strong"
            >
              <div>
                <p className="font-medium text-text">{seller.displayName}</p>
                <p className="mt-1 text-xs text-text-subtle">
                  {seller.user.email} · {seller._count.products} products · {seller.ordersCompleted} orders ·{" "}
                  {seller.responseTimeMinutes} min response
                </p>
              </div>
              <Rating value={Number(seller.rating)} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
