import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { Link } from "@/i18n/navigation";
import { SearchBar } from "@/components/SearchBar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { CurrencySwitcher } from "@/components/CurrencySwitcher";
import { ButtonLink } from "@/components/ui/Button";
import { UserMenu } from "@/components/layout/UserMenu";
import { MobileNav } from "@/components/layout/MobileNav";

export async function Header() {
  const [t, session] = await Promise.all([getTranslations("nav"), auth()]);
  const user = session?.user ? { name: session.user.name ?? "", role: session.user.role } : null;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0 text-xl font-extrabold tracking-tight text-text">
          Buy<span className="text-primary">UP</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          <Link href="/games" className="rounded-lg px-3 py-2 text-sm font-medium text-text-muted hover:bg-surface hover:text-text transition-colors">
            {t("games")}
          </Link>
          <Link href="/#how-it-works" className="rounded-lg px-3 py-2 text-sm font-medium text-text-muted hover:bg-surface hover:text-text transition-colors">
            {t("howItWorks")}
          </Link>
          <Link href="/sellers" className="rounded-lg px-3 py-2 text-sm font-medium text-text-muted hover:bg-surface hover:text-text transition-colors">
            {t("sellers")}
          </Link>
          <Link href="/support" className="rounded-lg px-3 py-2 text-sm font-medium text-text-muted hover:bg-surface hover:text-text transition-colors">
            {t("support")}
          </Link>
        </nav>

        <div className="hidden flex-1 justify-center px-4 md:flex">
          <SearchBar className="w-full max-w-sm" />
        </div>

        <div className="ml-auto hidden items-center gap-1 lg:flex">
          <LanguageSwitcher />
          <CurrencySwitcher />
          <div className="mx-1.5 h-6 w-px bg-border" />
          {user ? (
            <UserMenu name={user.name} role={user.role} />
          ) : (
            <>
              <ButtonLink href="/login" variant="ghost" size="sm">
                {t("login")}
              </ButtonLink>
              <ButtonLink href="/register" variant="primary" size="sm">
                {t("signUp")}
              </ButtonLink>
            </>
          )}
        </div>

        <div className="ml-auto lg:hidden">
          <MobileNav user={user} />
        </div>
      </div>
    </header>
  );
}
