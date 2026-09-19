"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { signOut } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import { Menu, X, User, Package, Heart, Settings, LogOut, ShieldCheck } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { CurrencySwitcher } from "@/components/CurrencySwitcher";
import { ButtonLink } from "@/components/ui/Button";

interface MobileNavProps {
  user: { name: string; role: "USER" | "ADMIN" } | null;
}

export function MobileNav({ user }: MobileNavProps) {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={t("menu")}
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-text hover:bg-surface"
      >
        <Menu size={22} />
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-[100] bg-bg">
          <div className="flex h-16 items-center justify-between border-b border-border px-4">
            <span className="text-lg font-bold tracking-tight text-text">WAlosses</span>
            <button
              aria-label={tCommon("close")}
              onClick={() => setOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-text hover:bg-surface"
            >
              <X size={22} />
            </button>
          </div>

          <div className="flex flex-col gap-1 overflow-y-auto p-4">
            <SearchBar className="mb-3" />

            <Link href="/games" onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-base font-medium text-text hover:bg-surface">
              {t("games")}
            </Link>
            <Link href="/#how-it-works" onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-base font-medium text-text hover:bg-surface">
              {t("howItWorks")}
            </Link>
            <Link href="/sellers" onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-base font-medium text-text hover:bg-surface">
              {t("sellers")}
            </Link>
            <Link href="/support" onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-base font-medium text-text hover:bg-surface">
              {t("support")}
            </Link>

            <div className="my-3 h-px bg-border" />

            <div className="flex items-center gap-2 px-1">
              <LanguageSwitcher />
              <CurrencySwitcher />
            </div>

            <div className="my-3 h-px bg-border" />

            {user ? (
              <>
                <Link href="/profile" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-3 text-base text-text hover:bg-surface">
                  <User size={18} className="text-text-subtle" /> {t("profile")}
                </Link>
                <Link href="/profile/orders" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-3 text-base text-text hover:bg-surface">
                  <Package size={18} className="text-text-subtle" /> {t("myOrders")}
                </Link>
                <Link href="/profile/favorites" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-3 text-base text-text hover:bg-surface">
                  <Heart size={18} className="text-text-subtle" /> {t("favorites")}
                </Link>
                <Link href="/profile/settings" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-3 text-base text-text hover:bg-surface">
                  <Settings size={18} className="text-text-subtle" /> {t("settings")}
                </Link>
                {user.role === "ADMIN" && (
                  <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-3 text-base text-text hover:bg-surface">
                    <ShieldCheck size={18} className="text-text-subtle" /> {t("admin")}
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-3 text-base text-danger hover:bg-surface"
                >
                  <LogOut size={18} /> {t("logout")}
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 px-1 pt-1">
                <ButtonLink href="/login" variant="secondary" className="w-full">
                  {t("login")}
                </ButtonLink>
                <ButtonLink href="/register" variant="primary" className="w-full">
                  {t("signUp")}
                </ButtonLink>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
