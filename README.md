# Bayup

Bayup is a dark, premium marketplace for buying game-boosting services (Valorant, Apex Legends, Dota 2, Genshin Impact, Zenless Zone Zero) — in the spirit of Playerok/GGsel, with its own visual identity.

This is the MVP build: full catalog, checkout, order lifecycle, a pluggable payment architecture with a working mock provider (Tribute-ready but not yet connected), accounts, reviews, seller profiles, an admin panel, and full UI localization across 9 languages.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack), TypeScript |
| Styling | Tailwind CSS v4 |
| Backend | Next.js Route Handlers (`src/app/api/**`) |
| Database | PostgreSQL |
| ORM | Prisma 6 |
| Auth | Auth.js / NextAuth v5 (credentials + JWT sessions, bcrypt password hashing) |
| Validation | Zod |
| i18n | next-intl (`en` default, unprefixed; `hu it pl fr es ro cs de` under `/xx`) |

## Getting started

```bash
npm install
cp .env.example .env
# edit .env — at minimum set DATABASE_URL to a running Postgres instance
npm run db:push
npm run db:seed
npm run dev
```

App runs at http://localhost:3000.

### Environment variables

See `.env.example`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/bayup?schema=public"
AUTH_SECRET="a long random string"
PAYMENT_PROVIDER=mock
TRIBUTE_API_URL=
TRIBUTE_API_KEY=
TRIBUTE_WEBHOOK_SECRET=
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

`PAYMENT_PROVIDER` selects the active `PaymentProvider` implementation (see below). The `TRIBUTE_*` variables are placeholders only — they are not read by any code yet.

### Database

Any Postgres instance works. To spin one up quickly with Docker:

```bash
docker run -d --name bayup-postgres -e POSTGRES_USER=bayup -e POSTGRES_PASSWORD=bayup -e POSTGRES_DB=bayup -p 5433:5432 postgres:16-alpine
```

Then `DATABASE_URL="postgresql://bayup:bayup@localhost:5433/bayup?schema=public"`.

```bash
npm run db:push   # sync prisma/schema.prisma to the database
npm run db:seed   # 5 games, categories, ~20 products with option groups,
                   # 4 demo sellers, demo users, an admin user, and demo
                   # orders across every OrderStatus
```

Seeded accounts (password for all: `Password123!`):

| Email | Role |
|---|---|
| admin@bayup.dev | ADMIN |
| alice@bayup.dev / bob@bayup.dev | Customers, with demo orders |
| boostmaster@bayup.dev, rankpro@bayup.dev, gamefast@bayup.dev, eliteboost@bayup.dev | Sellers |

### Commands

```bash
npm run dev      # start dev server (Turbopack)
npm run build    # production build
npm run start    # run the production build
npm run lint     # eslint
npm run db:push  # push prisma/schema.prisma to the database
npm run db:seed  # (re)run the seed script
```

## Project structure

```
prisma/
  schema.prisma        # User, Seller, Game, Category, Product, ProductOptionGroup/Value,
                        # Order, OrderItem, Payment, Review, Favorite
  seed.ts
locales/{en,hu,it,pl,fr,es,ro,cs,de}/common.json   # all UI copy, one namespace per locale
src/
  app/
    [locale]/           # every user-facing route lives under the locale segment
      page.tsx           # home
      games/, browse/[gameSlug]/, product/[productId]/
      checkout/, payment/[orderId]/, payment/mock/[paymentId]/,
      payment/success/[orderId]/, payment/failed/[orderId]/
      login/, register/, profile/**, sellers/**, search/, admin/**
    api/                # Route Handlers — auth, games, products, orders, payments,
                        # favorites, reviews, sellers, search, admin/*
    sitemap.ts, robots.ts
  components/           # layout/, ui/, filters/, product/, checkout/, payment/, reviews/, admin/
  lib/
    db.ts               # Prisma client singleton
    auth.ts              # NextAuth config
    pricing.ts            # server-side price calculation (see Security below)
    currency.ts
    schemas/              # zod schemas
    payments/             # see Payment architecture below
  i18n/                 # next-intl routing/navigation/request config
  middleware.ts
```

## Payment architecture

The business flow is always: **Product → Order (server-priced) → Payment → webhook → Order status updated.** The frontend never creates a payment directly, and never sends a price — it only ever sends a `productId` and the ids of the option values the user picked.

```
Frontend "Pay" button
   → POST /api/payments/create { orderId }
        → PaymentService.createPayment(order)
             → provider = getPaymentProvider()   // reads env PAYMENT_PROVIDER
             → provider.createPayment({ paymentId, orderId, amount, currency })
             → writes a Payment row (PENDING), order.status → PAYMENT_PENDING
        ← { paymentId, redirectUrl }
   → browser redirects to redirectUrl
```

`src/lib/payments/`:

- `types.ts` — the `PaymentProvider` interface every provider implements: `createPayment`, `getPaymentStatus`, `handleWebhook`, `refundPayment`.
- `PaymentService.ts` — the only thing the rest of the app talks to. Owns the Order/Payment state machine (`applyWebhookResult` verifies the payment exists and that amount/currency match before flipping `Payment.status` and `Order.status` together, and is idempotent against duplicate webhooks).
- `providers/MockPaymentProvider.ts` — fully working today. `createPayment` returns a redirect to `/payment/mock/:paymentId`, a dev-only page with "Simulate successful payment" / "Simulate failed payment" buttons that call `POST /api/payments/mock/:id/simulate`, which runs through the exact same `PaymentService.applyWebhookResult` path a real webhook would.
- `providers/TributePaymentProvider.ts` — **placeholder only.** Every method throws `NotImplementedError`. No endpoint, request/response shape, auth scheme or webhook format has been invented — none of that is real yet.
- `index.ts` — factory that reads `PAYMENT_PROVIDER` and returns the right provider. Swapping providers is a one-line env change.

`POST /api/payments/webhook` is the real inbound webhook endpoint. It already delegates to `PaymentService.handleWebhook(request)`, which calls `provider.handleWebhook(request)` to parse/verify the payload before applying it — so once Tribute is implemented, nothing here needs to change.

### Connecting the real Tribute API later

1. Get Tribute's API docs and credentials, fill in `TRIBUTE_API_URL` / `TRIBUTE_API_KEY` / `TRIBUTE_WEBHOOK_SECRET`.
2. Implement the four methods in `TributePaymentProvider.ts` against the real API.
3. Set `PAYMENT_PROVIDER=tribute`.
4. Test: successful payment, failed payment, a duplicate webhook delivery (must be a no-op — `applyWebhookResult` already ignores webhooks for a payment that isn't still `PENDING`), and a retried payment on the same order.

No frontend code, no order-creation code, and no route other than the provider file itself should need to change.

## Security notes

- **Price is never trusted from the client.** `POST /api/orders` accepts `productId` + selected option value ids; `src/lib/pricing.ts` loads the product/options from the database and computes the total — that's the only value ever written to `Order.totalPrice`.
- Passwords are hashed with bcrypt; sessions are JWT-based via NextAuth, delivered as httpOnly cookies.
- `/admin/**` is guarded both in `src/app/[locale]/admin/layout.tsx` (page tree) and inside every `/api/admin/**` route handler (`src/lib/adminGuard.ts`).
- Login, registration and order creation are rate-limited per IP (`src/lib/rateLimit.ts` — in-memory, fine for a single instance; swap for a Redis-backed limiter before scaling out).
- The mock payment "simulate" endpoint only works while `PAYMENT_PROVIDER=mock` and only for the payment's own owner.

## i18n

`en` (default, unprefixed URLs), `hu it pl fr es ro cs de` (URL-prefixed, e.g. `/de/browse/valorant`). All UI chrome — nav, forms, checkout, payment, order statuses, admin, errors — is translated in `locales/*/common.json`. Game names are kept as-is per convention; seeded product descriptions are English-only for this MVP. Switching language is a client-side transition (no full page reload).

## What's intentionally out of scope for this MVP

- Real Tribute integration (by design — see above).
- Multi-currency conversion (architecture supports it — `src/lib/currency.ts` — only EUR is enabled).
- Image uploads for products/sellers (URLs only).
