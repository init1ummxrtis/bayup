"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function SearchBar({ className }: { className?: string }) {
  const t = useTranslations("nav");
  const router = useRouter();
  const [query, setQuery] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push({ pathname: "/search", query: { q: trimmed } });
  }

  return (
    <form onSubmit={onSubmit} className={cn("relative", className)}>
      <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-subtle" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("search")}
        aria-label={t("search")}
        className="h-10 w-full rounded-lg border border-border bg-surface pl-10 pr-4 text-sm text-text placeholder:text-text-subtle outline-none transition-colors focus:border-primary"
      />
    </form>
  );
}
