"use client";

import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";

const SORT_OPTIONS = ["popular", "priceAsc", "priceDesc", "rating"] as const;

export function SortDropdown() {
  const t = useTranslations("catalog.sort");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("sort") ?? "popular";

  function onChange(value: string) {
    const query: Record<string, string> = {};
    for (const [k, v] of searchParams.entries()) query[k] = v;
    query.sort = value;
    delete query.page;
    router.push({ pathname, query });
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-text-muted whitespace-nowrap">{t("label")}</label>
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-lg border border-border bg-surface px-2.5 text-sm text-text outline-none focus:border-primary"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {t(opt)}
          </option>
        ))}
      </select>
    </div>
  );
}
