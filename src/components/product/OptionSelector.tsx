"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { formatPrice } from "@/lib/currency";
import { cn } from "@/lib/utils";

interface OptionValue {
  id: string;
  label: string;
  priceModifier: number;
}

interface OptionGroup {
  id: string;
  name: string;
  type: "SINGLE_SELECT" | "MULTI_SELECT";
  required: boolean;
  values: OptionValue[];
}

interface OptionSelectorProps {
  productId: string;
  basePrice: number;
  optionGroups: OptionGroup[];
  isFavorite: boolean;
  isAuthenticated: boolean;
}

export function OptionSelector({ productId, basePrice, optionGroups, isFavorite, isAuthenticated }: OptionSelectorProps) {
  const t = useTranslations("product");
  const tCommon = useTranslations("common");
  const tToast = useTranslations("toast");
  const locale = useLocale();
  const router = useRouter();
  const { show } = useToast();
  const [favorite, setFavorite] = useState(isFavorite);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const [selections, setSelections] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    for (const group of optionGroups) {
      if (group.type === "SINGLE_SELECT" && group.values.length > 0) {
        initial[group.id] = [group.values[0].id];
      } else {
        initial[group.id] = [];
      }
    }
    return initial;
  });

  const total = useMemo(() => {
    let sum = basePrice;
    for (const group of optionGroups) {
      const selected = selections[group.id] ?? [];
      for (const valueId of selected) {
        const value = group.values.find((v) => v.id === valueId);
        if (value) sum += value.priceModifier;
      }
    }
    return Math.round(sum * 100) / 100;
  }, [basePrice, optionGroups, selections]);

  function toggleValue(group: OptionGroup, valueId: string) {
    setSelections((prev) => {
      const current = prev[group.id] ?? [];
      if (group.type === "SINGLE_SELECT") {
        return { ...prev, [group.id]: [valueId] };
      }
      const exists = current.includes(valueId);
      return {
        ...prev,
        [group.id]: exists ? current.filter((id) => id !== valueId) : [...current, valueId],
      };
    });
  }

  function buyNow() {
    const allSelected = Object.values(selections).flat();
    router.push({
      pathname: "/checkout",
      query: { product: productId, options: allSelected.join(",") },
    });
  }

  async function toggleFavorite() {
    if (!isAuthenticated) {
      router.push({ pathname: "/login" });
      return;
    }
    setFavoriteLoading(true);
    try {
      const wasFavorite = favorite;
      const res = wasFavorite
        ? await fetch(`/api/favorites/${productId}`, { method: "DELETE" })
        : await fetch("/api/favorites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId }),
          });
      setFavorite((v) => !v);
      if (res.ok) {
        show(wasFavorite ? tToast("favoriteRemoved") : tToast("favoriteAdded"), "success");
      }
    } finally {
      setFavoriteLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <h2 className="mb-4 font-semibold text-text">{t("chooseService")}</h2>

      <div className="flex flex-col gap-5">
        {optionGroups.map((group) => (
          <div key={group.id}>
            <p className="mb-2 text-sm font-medium text-text-muted">
              {group.name}
              {!group.required && <span className="ml-1.5 text-xs text-text-subtle">({tCommon("optional")})</span>}
            </p>
            <div className="flex flex-wrap gap-2">
              {group.values.map((value) => {
                const active = (selections[group.id] ?? []).includes(value.id);
                return (
                  <button
                    key={value.id}
                    type="button"
                    onClick={() => toggleValue(group, value.id)}
                    className={cn(
                      "rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors",
                      active
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border text-text-muted hover:border-border-strong hover:text-text"
                    )}
                  >
                    {value.label}
                    {value.priceModifier !== 0 && (
                      <span className="ml-1.5 text-xs opacity-75">
                        {value.priceModifier > 0 ? "+" : ""}
                        {formatPrice(value.priceModifier, "EUR", locale)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
        <div>
          <p className="text-sm text-text-muted">{t("price")}</p>
          <p className="text-2xl font-bold text-text">{formatPrice(total, "EUR", locale)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleFavorite}
            disabled={favoriteLoading}
            aria-label={favorite ? t("removeFavorite") : t("addFavorite")}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl border transition-colors",
              favorite ? "border-danger/40 bg-danger-soft text-danger" : "border-border text-text-muted hover:text-text"
            )}
          >
            <Heart size={18} className={cn(favorite && "fill-current")} />
          </button>
          <Button size="lg" onClick={buyNow}>
            {t("buyNow")}
          </Button>
        </div>
      </div>
    </div>
  );
}
