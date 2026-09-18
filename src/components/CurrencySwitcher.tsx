"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";

export function CurrencySwitcher() {
  const t = useTranslations("currency");
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
        aria-label={t("label")}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-lg px-2.5 py-2 text-sm text-text-muted hover:bg-surface hover:text-text transition-colors"
      >
        <span>EUR</span>
        <ChevronDown size={14} className={cn("transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-border bg-bg-elevated py-1.5 shadow-xl">
          {SUPPORTED_CURRENCIES.map((c) => (
            <div
              key={c.code}
              className={cn(
                "flex items-center justify-between px-3 py-2 text-sm",
                c.enabled ? "text-text cursor-pointer hover:bg-surface" : "text-text-subtle cursor-not-allowed"
              )}
            >
              <span>
                {c.code} · {c.label}
              </span>
              {!c.enabled && <span className="text-xs">{t("comingSoon")}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
