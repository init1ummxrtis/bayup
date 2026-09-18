import { db } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const [games, sellers] = await Promise.all([
    db.game.findMany({
      include: { categories: { orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
    }),
    db.seller.findMany({ orderBy: { displayName: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-text">New product</h1>
      <ProductForm
        games={games.map((g) => ({
          id: g.id,
          name: g.name,
          categories: g.categories.map((c) => ({ id: c.id, name: c.name })),
        }))}
        sellers={sellers.map((s) => ({ id: s.id, displayName: s.displayName }))}
      />
    </div>
  );
}
