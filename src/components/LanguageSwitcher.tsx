"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Globe, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const LOCALE_LABELS: Record<string, string> = {
  en: "English",
  hu: "Magyar",
  it: "Italiano",
  pl: "Polski",
  fr: "Français",
  es: "Español",
  ro: "Română",
  cs: "Čeština",
  de: "Deutsch",
};

const LOCALES = Object.keys(LOCALE_LABELS);

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("language");
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function selectLocale(next: string) {
    setOpen(false);
    const query = searchParams.toString();
    router.replace(
      { pathname, query: query ? Object.fromEntries(searchParams.entries()) : undefined },
      { locale: next }
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label={t("label")}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-text-muted hover:bg-surface hover:text-text transition-colors"
      >
        <Globe size={16} />
        <span className="uppercase">{locale}</span>
        <ChevronDown size={14} className={cn("transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-44 max-h-80 overflow-y-auto rounded-xl border border-border bg-bg-elevated py-1.5 shadow-xl">
          {LOCALES.map((loc) => (
            <button
              key={loc}
              onClick={() => selectLocale(loc)}
              className={cn(
                "flex w-full items-center px-3 py-2 text-sm text-left hover:bg-surface transition-colors",
                loc === locale ? "text-primary font-medium" : "text-text"
              )}
            >
              {LOCALE_LABELS[loc]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
