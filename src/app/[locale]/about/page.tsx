import { getTranslations } from "next-intl/server";

export default async function AboutPage() {
  const t = await getTranslations("footer");
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-text">{t("about")}</h1>
      <div className="flex flex-col gap-4 text-sm leading-relaxed text-text-muted">
        <p>
          Bayup is a marketplace connecting gamers with verified boosters across Valorant, Apex Legends,
          Dota 2, Genshin Impact and Zenless Zone Zero.
        </p>
        <p>
          Every order goes through a secure checkout, is tracked from payment to delivery, and is backed by
          our review system so you always know who you&apos;re buying from.
        </p>
      </div>
    </div>
  );
}
