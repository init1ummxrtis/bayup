import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createReviewSchema } from "@/lib/schemas/review";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = createReviewSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { orderId, rating, comment } = parsed.data;

  const order = await db.order.findUnique({ where: { id: orderId }, include: { items: true, review: true } });
  if (!order || order.userId !== session.user.id) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.status !== "COMPLETED") {
    return NextResponse.json({ error: "Only completed orders can be reviewed" }, { status: 400 });
  }
  if (order.review) {
    return NextResponse.json({ error: "This order already has a review" }, { status: 409 });
  }

  const item = order.items[0];
  const review = await db.review.create({
    data: {
      orderId: order.id,
      userId: session.user.id,
      sellerId: item.sellerId,
      productId: item.productId,
      rating,
      comment,
    },
  });

  const [productReviews, sellerReviews] = await Promise.all([
    db.review.aggregate({ where: { productId: item.productId }, _avg: { rating: true }, _count: true }),
    db.review.aggregate({ where: { sellerId: item.sellerId }, _avg: { rating: true } }),
  ]);

  await Promise.all([
    db.product.update({
      where: { id: item.productId },
      data: { rating: productReviews._avg.rating ?? rating, reviewCount: productReviews._count },
    }),
    db.seller.update({
      where: { id: item.sellerId },
      data: { rating: sellerReviews._avg.rating ?? rating },
    }),
  ]);

  return NextResponse.json({ review }, { status: 201 });
}
