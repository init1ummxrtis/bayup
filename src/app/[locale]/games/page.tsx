import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { GameCard } from "@/components/GameCard";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home.games");
  return { title: t("title"), description: t("subtitle") };
}

export default async function GamesPage() {
  const [t, tGames, games] = await Promise.all([
    getTranslations("home.games"),
    getTranslations("home.gameDescriptions"),
    db.game.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-xl">
        <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">{t("title")}</h1>
        <p className="mt-2 text-text-muted">{t("subtitle")}</p>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <GameCard
            key={game.id}
            slug={game.slug}
            name={game.name}
            description={tGames.has(game.slug) ? tGames(game.slug) : game.description}
          />
        ))}
      </div>
    </div>
  );
}
