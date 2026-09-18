"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { signOut } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import { User, ChevronDown, Package, Heart, Settings, LogOut, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  name: string;
  role: "USER" | "ADMIN";
}

export function UserMenu({ name, role }: UserMenuProps) {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-2.5 text-sm text-text hover:bg-surface transition-colors"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-soft text-primary">
          <User size={16} />
        </span>
        <span className="max-w-24 truncate font-medium">{name}</span>
        <ChevronDown size={14} className={cn("transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-border bg-bg-elevated py-1.5 shadow-xl">
          <Link href="/profile" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-text hover:bg-surface transition-colors">
            <User size={16} className="text-text-subtle" /> {t("profile")}
          </Link>
          <Link href="/profile/orders" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-text hover:bg-surface transition-colors">
            <Package size={16} className="text-text-subtle" /> {t("myOrders")}
          </Link>
          <Link href="/profile/favorites" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-text hover:bg-surface transition-colors">
            <Heart size={16} className="text-text-subtle" /> {t("favorites")}
          </Link>
          <Link href="/profile/settings" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-text hover:bg-surface transition-colors">
            <Settings size={16} className="text-text-subtle" /> {t("settings")}
          </Link>
          {role === "ADMIN" && (
            <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-text hover:bg-surface transition-colors">
              <ShieldCheck size={16} className="text-text-subtle" /> {t("admin")}
            </Link>
          )}
          <div className="my-1.5 h-px bg-border" />
          <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-danger hover:bg-surface transition-colors"
          >
            <LogOut size={16} /> {t("logout")}
          </button>
        </div>
      )}
    </div>
  );
}
