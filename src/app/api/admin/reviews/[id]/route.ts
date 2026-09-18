import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, AdminGuardError } from "@/lib/adminGuard";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const review = await db.review.findUnique({ where: { id } });
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    await db.review.delete({ where: { id } });

    const [productReviews, sellerReviews] = await Promise.all([
      db.review.aggregate({ where: { productId: review.productId }, _avg: { rating: true }, _count: true }),
      db.review.aggregate({ where: { sellerId: review.sellerId }, _avg: { rating: true } }),
    ]);

    await Promise.all([
      db.product.update({
        where: { id: review.productId },
        data: {
          rating: productReviews._avg.rating ?? 0,
          reviewCount: productReviews._count,
        },
      }),
      db.seller.update({
        where: { id: review.sellerId },
        data: { rating: sellerReviews._avg.rating ?? 0 },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AdminGuardError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
