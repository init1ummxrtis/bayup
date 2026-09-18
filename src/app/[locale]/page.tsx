import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { ButtonLink } from "@/components/ui/Button";
import { GameCard } from "@/components/GameCard";
import { Gamepad2, ShieldCheck, Sparkles } from "lucide-react";

export default async function HomePage() {
  const [t, tGames, games] = await Promise.all([
    getTranslations("home"),
    getTranslations("home.gameDescriptions"),
    db.game.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, #7c5cff33, transparent 40%), radial-gradient(circle at 80% 0%, #1fd8b022, transparent 45%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-text-muted">
              <Sparkles size={13} className="text-primary" />
              Valorant · Apex Legends · Dota 2 · Genshin Impact · ZZZ
            </span>
            <h1 className="mt-6 text-balance text-4xl font-extrabold tracking-tight text-text sm:text-6xl">
              {t("hero.title")}
              <br />
              <span className="text-primary">{t("hero.titleAccent")}</span>
            </h1>
            <p className="mt-5 text-lg text-text-muted">{t("hero.subtitle")}</p>
            <div className="mt-8 flex justify-center">
              <ButtonLink href="/games" size="lg">
                {t("hero.cta")}
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section id="games" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-xl">
          <h2 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">{t("games.title")}</h2>
          <p className="mt-2 text-text-muted">{t("games.subtitle")}</p>
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
      </section>

      <section id="how-it-works" className="border-t border-border bg-bg-elevated">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-2xl font-bold tracking-tight text-text sm:text-3xl">
            {t("howItWorks.title")}
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <HowItWorksStep
              icon={<Gamepad2 size={22} />}
              step={1}
              title={t("howItWorks.step1Title")}
              desc={t("howItWorks.step1Desc")}
            />
            <HowItWorksStep
              icon={<Sparkles size={22} />}
              step={2}
              title={t("howItWorks.step2Title")}
              desc={t("howItWorks.step2Desc")}
            />
            <HowItWorksStep
              icon={<ShieldCheck size={22} />}
              step={3}
              title={t("howItWorks.step3Title")}
              desc={t("howItWorks.step3Desc")}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function HowItWorksStep({
  icon,
  step,
  title,
  desc,
}: {
  icon: React.ReactNode;
  step: number;
  title: string;
  desc: string;
}) {
  return (
    <div className="relative rounded-2xl border border-border bg-surface p-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
        {icon}
      </div>
      <span className="absolute right-5 top-5 text-3xl font-extrabold text-border-strong">{step}</span>
      <h3 className="mt-5 font-semibold text-text">{title}</h3>
      <p className="mt-1.5 text-sm text-text-muted">{desc}</p>
    </div>
  );
}
