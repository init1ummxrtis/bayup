import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;

  const [product, games, sellers] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: { optionGroups: { include: { values: { orderBy: { sortOrder: "asc" } } }, orderBy: { sortOrder: "asc" } } },
    }),
    db.game.findMany({
      include: { categories: { orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
    }),
    db.seller.findMany({ orderBy: { displayName: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-text">Edit product</h1>
      <ProductForm
        games={games.map((g) => ({
          id: g.id,
          name: g.name,
          categories: g.categories.map((c) => ({ id: c.id, name: c.name })),
        }))}
        sellers={sellers.map((s) => ({ id: s.id, displayName: s.displayName }))}
        product={{
          id: product.id,
          gameId: product.gameId,
          categoryId: product.categoryId,
          sellerId: product.sellerId,
          title: product.title,
          description: product.description,
          basePrice: Number(product.basePrice),
          deliveryTime: product.deliveryTime,
          images: product.images,
          status: product.status,
          optionGroups: product.optionGroups.map((g) => ({
            name: g.name,
            type: g.type,
            required: g.required,
            values: g.values.map((v) => ({ label: v.label, priceModifier: Number(v.priceModifier) })),
          })),
        }}
      />
    </div>
  );
}
