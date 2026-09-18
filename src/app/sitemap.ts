import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { routing } from "@/i18n/routing";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function localizedPath(path: string, locale: string): string {
  return locale === routing.defaultLocale ? `${BASE_URL}${path}` : `${BASE_URL}/${locale}${path}`;
}

function alternates(path: string) {
  return Object.fromEntries(routing.locales.map((locale) => [locale, localizedPath(path, locale)]));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [games, products, sellers] = await Promise.all([
    db.game.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    db.product.findMany({ where: { status: "ACTIVE" }, select: { id: true, updatedAt: true } }),
    db.seller.findMany({ select: { id: true, createdAt: true } }),
  ]);

  const staticPaths = ["/", "/games", "/sellers", "/about", "/support", "/terms", "/privacy"];

  const entries: MetadataRoute.Sitemap = staticPaths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: localizedPath(path, locale),
      alternates: { languages: alternates(path) },
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : 0.7,
    }))
  );

  for (const game of games) {
    const path = `/browse/${game.slug}`;
    for (const locale of routing.locales) {
      entries.push({
        url: localizedPath(path, locale),
        alternates: { languages: alternates(path) },
        lastModified: game.updatedAt,
        changeFrequency: "daily",
        priority: 0.8,
      });
    }
  }

  for (const product of products) {
    const path = `/product/${product.id}`;
    entries.push({
      url: localizedPath(path, routing.defaultLocale),
      alternates: { languages: alternates(path) },
      lastModified: product.updatedAt,
      changeFrequency: "daily",
      priority: 0.6,
    });
  }

  for (const seller of sellers) {
    const path = `/sellers/${seller.id}`;
    entries.push({
      url: localizedPath(path, routing.defaultLocale),
      alternates: { languages: alternates(path) },
      lastModified: seller.createdAt,
      changeFrequency: "weekly",
      priority: 0.5,
    });
  }

  return entries;
}
