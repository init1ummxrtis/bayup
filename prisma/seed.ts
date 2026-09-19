import { PrismaClient, OrderStatus, PaymentStatus, PaymentProviderType } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const DEMO_PASSWORD = "Password123!";

const RANK_NAMES = ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Immortal"];

function rankOptionGroups() {
  return [
    {
      name: "Current rank",
      type: "SINGLE_SELECT" as const,
      required: true,
      sortOrder: 0,
      values: RANK_NAMES.slice(0, 6).map((label, i) => ({
        label,
        priceModifier: -(i * 2),
        sortOrder: i,
      })),
    },
    {
      name: "Target rank",
      type: "SINGLE_SELECT" as const,
      required: true,
      sortOrder: 1,
      values: RANK_NAMES.slice(1).map((label, i) => ({
        label,
        priceModifier: (i + 1) * 8,
        sortOrder: i,
      })),
    },
    {
      name: "Additional options",
      type: "MULTI_SELECT" as const,
      required: false,
      sortOrder: 2,
      values: [
        { label: "Fast delivery", priceModifier: 8, sortOrder: 0 },
        { label: "Play together (duo queue)", priceModifier: 12, sortOrder: 1 },
        { label: "Stream my sessions", priceModifier: 5, sortOrder: 2 },
      ],
    },
  ];
}

function progressionOptionGroups() {
  return [
    {
      name: "Current level",
      type: "SINGLE_SELECT" as const,
      required: true,
      sortOrder: 0,
      values: [
        { label: "Level 1-20", priceModifier: 0, sortOrder: 0 },
        { label: "Level 21-40", priceModifier: -5, sortOrder: 1 },
        { label: "Level 41-60", priceModifier: -10, sortOrder: 2 },
      ],
    },
    {
      name: "Target level",
      type: "SINGLE_SELECT" as const,
      required: true,
      sortOrder: 1,
      values: [
        { label: "Level 40", priceModifier: 10, sortOrder: 0 },
        { label: "Level 60", priceModifier: 25, sortOrder: 1 },
        { label: "Level 70 (max)", priceModifier: 45, sortOrder: 2 },
      ],
    },
    {
      name: "Additional options",
      type: "MULTI_SELECT" as const,
      required: false,
      sortOrder: 2,
      values: [
        { label: "Priority queue", priceModifier: 10, sortOrder: 0 },
        { label: "Session recordings", priceModifier: 5, sortOrder: 1 },
      ],
    },
  ];
}

const CATEGORY_SETS: Record<string, string[]> = {
  valorant: ["Rank Boost", "Placement Matches", "Leveling", "Competitive", "Other"],
  "apex-legends": ["Rank Boost", "Leveling", "Placement Matches", "Competitive", "Other"],
  "dota-2": ["MMR Boost", "Placement Matches", "Leveling", "Competitive", "Other"],
  "genshin-impact": ["Progression", "Farming", "Abyss Clear", "Leveling", "Other"],
  "zenless-zone-zero": ["Progression", "Farming", "Leveling", "Other"],
};

const GAMES = [
  {
    slug: "valorant",
    name: "Valorant",
    description:
      "Riot Games' tactical 5v5 shooter. Climb the competitive ladder from Iron to Radiant with a trusted booster.",
    ranked: true,
    prices: [15, 40, 80, 150],
  },
  {
    slug: "apex-legends",
    name: "Apex Legends",
    description: "Respawn's battle royale. Rank up in Arenas and Battle Royale ranked with an experienced player.",
    ranked: true,
    prices: [25, 60, 100, 200],
  },
  {
    slug: "dota-2",
    name: "Dota 2",
    description: "Valve's flagship MOBA. Gain MMR and climb the ranked medals with a dedicated booster.",
    ranked: true,
    prices: [15, 40, 100, 150],
  },
  {
    slug: "genshin-impact",
    name: "Genshin Impact",
    description: "HoYoverse's open-world RPG. Level up your Adventure Rank, clear Spiral Abyss and farm resources.",
    ranked: false,
    prices: [25, 60, 80, 200],
  },
  {
    slug: "zenless-zone-zero",
    name: "Zenless Zone Zero",
    description: "HoYoverse's urban action RPG. Progress your Inter-Knot level and farm character materials.",
    ranked: false,
    prices: [15, 40, 60, 100],
  },
];

const SELLERS = [
  { handle: "boostmaster", displayName: "BoostMaster", rating: 4.9, ordersCompleted: 1284, responseTimeMinutes: 12 },
  { handle: "rankpro", displayName: "RankPro", rating: 4.8, ordersCompleted: 942, responseTimeMinutes: 20 },
  { handle: "gamefast", displayName: "GameFast", rating: 4.7, ordersCompleted: 613, responseTimeMinutes: 35 },
  { handle: "eliteboost", displayName: "EliteBoost", rating: 5.0, ordersCompleted: 356, responseTimeMinutes: 8 },
];

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  await db.user.upsert({
    where: { email: "admin@bayup.dev" },
    update: {},
    create: { email: "admin@bayup.dev", name: "WAlosses Admin", passwordHash, role: "ADMIN" },
  });

  const customers = await Promise.all(
    [
      { email: "alice@bayup.dev", name: "Alice Novak" },
      { email: "bob@bayup.dev", name: "Bob Kowalski" },
    ].map((c) =>
      db.user.upsert({ where: { email: c.email }, update: {}, create: { ...c, passwordHash } })
    )
  );

  const sellers = [];
  for (const s of SELLERS) {
    const user = await db.user.upsert({
      where: { email: `${s.handle}@bayup.dev` },
      update: {},
      create: { email: `${s.handle}@bayup.dev`, name: s.displayName, passwordHash, role: "USER" },
    });
    const seller = await db.seller.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        displayName: s.displayName,
        bio: `${s.displayName} is a verified WAlosses booster specializing in fast, safe service delivery.`,
        rating: s.rating,
        ordersCompleted: s.ordersCompleted,
        responseTimeMinutes: s.responseTimeMinutes,
        memberSince: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 600),
      },
    });
    sellers.push(seller);
  }

  const allProducts: { id: string; basePrice: number }[] = [];

  for (let gi = 0; gi < GAMES.length; gi++) {
    const g = GAMES[gi];
    const game = await db.game.upsert({
      where: { slug: g.slug },
      update: { name: g.name, description: g.description, sortOrder: gi },
      create: { slug: g.slug, name: g.name, description: g.description, sortOrder: gi },
    });

    const categoryNames = CATEGORY_SETS[g.slug];
    const categories = [];
    for (let ci = 0; ci < categoryNames.length; ci++) {
      const name = categoryNames[ci];
      const category = await db.category.upsert({
        where: { gameId_slug: { gameId: game.id, slug: slugify(name) } },
        update: {},
        create: { gameId: game.id, slug: slugify(name), name, sortOrder: ci },
      });
      categories.push(category);
    }

    for (let pi = 0; pi < g.prices.length; pi++) {
      const price = g.prices[pi];
      const seller = sellers[(gi + pi) % sellers.length];
      const category = categories[pi % categories.length];
      const title = productTitle(g.name, category.name, pi);
      const slug = slugify(title);

      const existing = await db.product.findUnique({ where: { gameId_slug: { gameId: game.id, slug } } });
      const product = existing
        ? existing
        : await db.product.create({
            data: {
              sellerId: seller.id,
              gameId: game.id,
              categoryId: category.id,
              title,
              slug,
              description: productDescription(g.name, category.name),
              basePrice: price,
              deliveryTime: ["24 hours", "48 hours", "3 days", "5 days"][pi % 4],
              images: [],
              rating: 4.5 + Math.random() * 0.5,
              reviewCount: 10 + Math.floor(Math.random() * 200),
              ordersCount: 20 + Math.floor(Math.random() * 500),
              optionGroups: {
                create: (g.ranked ? rankOptionGroups() : progressionOptionGroups()).map((group) => ({
                  name: group.name,
                  type: group.type,
                  required: group.required,
                  sortOrder: group.sortOrder,
                  values: { create: group.values },
                })),
              },
            },
          });

      allProducts.push({ id: product.id, basePrice: price });
    }
  }

  // ---- Demo orders across every status ----
  const statuses: { status: OrderStatus; payment?: PaymentStatus }[] = [
    { status: OrderStatus.PENDING },
    { status: OrderStatus.PAYMENT_PENDING, payment: PaymentStatus.PENDING },
    { status: OrderStatus.PAID, payment: PaymentStatus.SUCCEEDED },
    { status: OrderStatus.PROCESSING, payment: PaymentStatus.SUCCEEDED },
    { status: OrderStatus.COMPLETED, payment: PaymentStatus.SUCCEEDED },
    { status: OrderStatus.COMPLETED, payment: PaymentStatus.SUCCEEDED },
    { status: OrderStatus.CANCELLED, payment: PaymentStatus.FAILED },
    { status: OrderStatus.REFUNDED, payment: PaymentStatus.REFUNDED },
  ];

  for (let i = 0; i < statuses.length; i++) {
    const { status, payment } = statuses[i];
    const customer = customers[i % customers.length];
    const productRef = allProducts[i % allProducts.length];
    const product = await db.product.findUniqueOrThrow({
      where: { id: productRef.id },
      include: { seller: true, game: true },
    });

    const order = await db.order.create({
      data: {
        userId: customer.id,
        status,
        totalPrice: productRef.basePrice,
        customerEmail: customer.email,
        gamingUsername: `${customer.name.split(" ")[0]}#${1000 + i}`,
        additionalInformation: i % 2 === 0 ? "Please play in the evening (CET)." : null,
        items: {
          create: {
            productId: product.id,
            sellerId: product.sellerId,
            gameId: product.gameId,
            title: product.title,
            unitPrice: productRef.basePrice,
            selectedOptions: [],
          },
        },
      },
    });

    if (payment) {
      await db.payment.create({
        data: {
          orderId: order.id,
          provider: PaymentProviderType.MOCK,
          providerPaymentId: `mock_seed_${i}`,
          amount: productRef.basePrice,
          status: payment,
        },
      });
    }

    if (status === OrderStatus.COMPLETED) {
      await db.review.create({
        data: {
          orderId: order.id,
          userId: customer.id,
          sellerId: product.sellerId,
          productId: product.id,
          rating: 5,
          comment: "Fast, professional and exactly as described. Highly recommend this seller!",
        },
      });
    }
  }

  console.log("Seed complete.");
  console.log(`Demo password for all seeded accounts: ${DEMO_PASSWORD}`);
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function productTitle(gameName: string, categoryName: string, index: number): string {
  const variants = ["Boost", "Service", "Package", "Pro Boost"];
  return `${gameName} ${categoryName} ${variants[index % variants.length]}`;
}

function productDescription(gameName: string, categoryName: string): string {
  return `Professional ${categoryName.toLowerCase()} service for ${gameName}, delivered by a verified WAlosses booster. Safe, fast and account-friendly — choose your options below and we'll take care of the rest.`;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
