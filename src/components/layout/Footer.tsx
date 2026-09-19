import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";

export async function Footer() {
  const [t, games] = await Promise.all([
    getTranslations("footer"),
    db.game.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, select: { slug: true, name: true } }),
  ]);

  return (
    <footer className="border-t border-border bg-bg-elevated">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <span className="text-xl font-extrabold tracking-tight text-text">
              <span className="text-primary">WA</span>losses
            </span>
            <p className="mt-3 max-w-xs text-sm text-text-muted">{t("tagline")}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text">{t("games")}</h3>
            <ul className="mt-3 space-y-2.5">
              {games.map((game) => (
                <li key={game.slug}>
                  <Link href={`/browse/${game.slug}`} className="text-sm text-text-muted hover:text-text transition-colors">
                    {game.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text">{t("company")}</h3>
            <ul className="mt-3 space-y-2.5">
              <li><Link href="/about" className="text-sm text-text-muted hover:text-text transition-colors">{t("about")}</Link></li>
              <li><Link href="/support" className="text-sm text-text-muted hover:text-text transition-colors">{t("support")}</Link></li>
              <li><Link href="/terms" className="text-sm text-text-muted hover:text-text transition-colors">{t("terms")}</Link></li>
              <li><Link href="/privacy" className="text-sm text-text-muted hover:text-text transition-colors">{t("privacy")}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text">{t("payment")}</h3>
            <div className="mt-3 flex items-center gap-2 text-sm text-text-muted">
              <ShieldCheck size={16} className="text-accent" />
              {t("securePayments")}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-sm text-text-subtle">
          {t("copyright", { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  );
}
