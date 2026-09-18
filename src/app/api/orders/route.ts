import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createOrderSchema } from "@/lib/schemas/order";
import { computeProductPrice, PricingError } from "@/lib/pricing";
import { rateLimit, clientKeyFromRequest } from "@/lib/rateLimit";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    include: { items: true, payments: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!rateLimit(clientKeyFromRequest(request, "create-order"), 10, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { productId, selectedValueIds, customerEmail, gamingUsername, additionalInformation } = parsed.data;

  try {
    // The client only supplies productId + selected option ids — price is
    // always computed here, server-side, never trusted from the request body.
    const { product, totalPrice, selectedOptions } = await computeProductPrice(productId, selectedValueIds);

    const order = await db.order.create({
      data: {
        userId: session.user.id,
        status: "PENDING",
        currency: product.currency,
        totalPrice,
        customerEmail,
        gamingUsername,
        additionalInformation,
        items: {
          create: {
            productId: product.id,
            sellerId: product.sellerId,
            gameId: product.gameId,
            title: product.title,
            unitPrice: totalPrice,
            selectedOptions: selectedOptions.map((o) => ({
              groupName: o.groupName,
              valueLabel: o.valueLabel,
              priceModifier: o.priceModifier,
            })),
          },
        },
      },
      include: { items: true },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    if (error instanceof PricingError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}
