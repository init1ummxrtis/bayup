import { db } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import { ButtonLink } from "@/components/ui/Button";
import { formatPrice } from "@/lib/currency";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "border-border bg-border/30 text-text-muted",
  ACTIVE: "border-accent/30 bg-accent-soft text-accent",
  ARCHIVED: "border-danger/30 bg-danger-soft text-danger",
};

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    include: { game: true, seller: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-text">Products</h1>
        <ButtonLink href="/admin/products/new">New product</ButtonLink>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-text-muted">
          No products yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/admin/products/${product.id}/edit`}
              className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-border-strong"
            >
              <div>
                <p className="font-medium text-text">{product.title}</p>
                <p className="mt-1 text-xs text-text-subtle">
                  {product.game.name} · {product.seller.displayName} · {product.ordersCount} orders
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-text">{formatPrice(Number(product.basePrice))}</span>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
                    STATUS_STYLES[product.status]
                  )}
                >
                  {product.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
