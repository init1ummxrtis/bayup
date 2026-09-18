import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { SellerForm } from "@/components/admin/SellerForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSellerPage({ params }: PageProps) {
  const { id } = await params;
  const seller = await db.seller.findUnique({ where: { id } });
  if (!seller) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-text">Edit seller</h1>
      <SellerForm
        seller={{
          id: seller.id,
          displayName: seller.displayName,
          bio: seller.bio,
          avatarUrl: seller.avatarUrl,
          ordersCompleted: seller.ordersCompleted,
          responseTimeMinutes: seller.responseTimeMinutes,
          rating: Number(seller.rating),
        }}
      />
    </div>
  );
}
