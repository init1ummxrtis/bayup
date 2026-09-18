"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";

const RATING_OPTIONS = [
  { value: "", labelKey: "ratingAny" },
  { value: "4", labelKey: "rating4" },
  { value: "4.5", labelKey: "rating45" },
] as const;

const DELIVERY_OPTIONS = [
  { value: "", labelKey: "deliveryAny" },
  { value: "fast", labelKey: "deliveryFast" },
  { value: "normal", labelKey: "deliveryNormal" },
] as const;

export function CatalogFilters() {
  const t = useTranslations("catalog.filters");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const [rating, setRating] = useState(searchParams.get("rating") ?? "");
  const [delivery, setDelivery] = useState(searchParams.get("delivery") ?? "");

  function apply() {
    const query: Record<string, string> = {};
    for (const [k, v] of searchParams.entries()) query[k] = v;
    if (minPrice) query.minPrice = minPrice; else delete query.minPrice;
    if (maxPrice) query.maxPrice = maxPrice; else delete query.maxPrice;
    if (rating) query.rating = rating; else delete query.rating;
    if (delivery) query.delivery = delivery; else delete query.delivery;
    delete query.page;
    router.push({ pathname, query });
  }

  function reset() {
    setMinPrice("");
    setMaxPrice("");
    setRating("");
    setDelivery("");
    const query: Record<string, string> = {};
    const category = searchParams.get("category");
    const sort = searchParams.get("sort");
    if (category) query.category = category;
    if (sort) query.sort = sort;
    router.push({ pathname, query });
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <h3 className="mb-4 font-semibold text-text">{t("title")}</h3>

      <div className="mb-5">
        <p className="mb-2 text-sm font-medium text-text-muted">{t("price")}</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="€15"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-bg px-2.5 text-sm text-text outline-none focus:border-primary"
          />
          <span className="text-text-subtle">—</span>
          <input
            type="number"
            min={0}
            placeholder="€200"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-bg px-2.5 text-sm text-text outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="mb-5">
        <p className="mb-2 text-sm font-medium text-text-muted">{t("rating")}</p>
        <div className="flex flex-col gap-1.5">
          {RATING_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm text-text cursor-pointer">
              <input
                type="radio"
                name="rating"
                checked={rating === opt.value}
                onChange={() => setRating(opt.value)}
                className="accent-primary"
              />
              {t(opt.labelKey)}
            </label>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <p className="mb-2 text-sm font-medium text-text-muted">{t("delivery")}</p>
        <div className="flex flex-col gap-1.5">
          {DELIVERY_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm text-text cursor-pointer">
              <input
                type="radio"
                name="delivery"
                checked={delivery === opt.value}
                onChange={() => setDelivery(opt.value)}
                className="accent-primary"
              />
              {t(opt.labelKey)}
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button size="sm" onClick={apply} className="flex-1">
          {t("apply")}
        </Button>
        <Button size="sm" variant="secondary" onClick={reset}>
          {t("reset")}
        </Button>
      </div>
    </div>
  );
}
