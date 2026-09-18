"use client";

import { useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { Trash2, Plus } from "lucide-react";

type OptionGroupType = "SINGLE_SELECT" | "MULTI_SELECT";
type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

interface OptionValueState {
  key: string;
  label: string;
  priceModifier: number;
}

interface OptionGroupState {
  key: string;
  name: string;
  type: OptionGroupType;
  required: boolean;
  values: OptionValueState[];
}

interface CategoryOption {
  id: string;
  name: string;
}

interface GameOption {
  id: string;
  name: string;
  categories: CategoryOption[];
}

interface SellerOption {
  id: string;
  displayName: string;
}

interface ExistingProduct {
  id: string;
  gameId: string;
  categoryId: string;
  sellerId: string;
  title: string;
  description: string;
  basePrice: number;
  deliveryTime: string;
  images: string[];
  status: ProductStatus;
  optionGroups: {
    name: string;
    type: OptionGroupType;
    required: boolean;
    values: { label: string; priceModifier: number }[];
  }[];
}

interface ProductFormProps {
  games: GameOption[];
  sellers: SellerOption[];
  product?: ExistingProduct;
}

let keySeq = 0;
function nextKey() {
  keySeq += 1;
  return `k${keySeq}`;
}

export function ProductForm({ games, sellers, product }: ProductFormProps) {
  const router = useRouter();
  const { show } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [gameId, setGameId] = useState(product?.gameId ?? games[0]?.id ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [sellerId, setSellerId] = useState(product?.sellerId ?? sellers[0]?.id ?? "");
  const [title, setTitle] = useState(product?.title ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [basePrice, setBasePrice] = useState(product?.basePrice ?? 0);
  const [deliveryTime, setDeliveryTime] = useState(product?.deliveryTime ?? "");
  const [imagesText, setImagesText] = useState((product?.images ?? []).join(", "));
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? "ACTIVE");

  const [optionGroups, setOptionGroups] = useState<OptionGroupState[]>(
    (product?.optionGroups ?? []).map((g) => ({
      key: nextKey(),
      name: g.name,
      type: g.type,
      required: g.required,
      values: g.values.map((v) => ({ key: nextKey(), label: v.label, priceModifier: v.priceModifier })),
    }))
  );

  const selectedGame = games.find((g) => g.id === gameId);
  const categoriesForGame = useMemo(() => selectedGame?.categories ?? [], [selectedGame]);

  function handleGameChange(newGameId: string) {
    setGameId(newGameId);
    const game = games.find((g) => g.id === newGameId);
    const stillValid = game?.categories.some((c) => c.id === categoryId);
    if (!stillValid) {
      setCategoryId(game?.categories[0]?.id ?? "");
    }
  }

  function addGroup() {
    setOptionGroups((prev) => [
      ...prev,
      { key: nextKey(), name: "", type: "SINGLE_SELECT", required: true, values: [] },
    ]);
  }

  function removeGroup(groupKey: string) {
    setOptionGroups((prev) => prev.filter((g) => g.key !== groupKey));
  }

  function updateGroup(groupKey: string, patch: Partial<OptionGroupState>) {
    setOptionGroups((prev) => prev.map((g) => (g.key === groupKey ? { ...g, ...patch } : g)));
  }

  function addValue(groupKey: string) {
    setOptionGroups((prev) =>
      prev.map((g) =>
        g.key === groupKey ? { ...g, values: [...g.values, { key: nextKey(), label: "", priceModifier: 0 }] } : g
      )
    );
  }

  function removeValue(groupKey: string, valueKey: string) {
    setOptionGroups((prev) =>
      prev.map((g) => (g.key === groupKey ? { ...g, values: g.values.filter((v) => v.key !== valueKey) } : g))
    );
  }

  function updateValue(groupKey: string, valueKey: string, patch: Partial<OptionValueState>) {
    setOptionGroups((prev) =>
      prev.map((g) =>
        g.key === groupKey
          ? { ...g, values: g.values.map((v) => (v.key === valueKey ? { ...v, ...patch } : v)) }
          : g
      )
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryId) {
      show("Please select a category", "error");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        gameId,
        categoryId,
        sellerId,
        title,
        description,
        basePrice: Number(basePrice),
        deliveryTime,
        images: imagesText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        status,
        optionGroups: optionGroups.map((g) => ({
          name: g.name,
          type: g.type,
          required: g.required,
          values: g.values.map((v) => ({ label: v.label, priceModifier: Number(v.priceModifier) })),
        })),
      };

      const res = await fetch(product ? `/api/admin/products/${product.id}` : "/api/admin/products", {
        method: product ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        show(typeof data?.error === "string" ? data.error : "Failed to save product", "error");
        return;
      }

      show(product ? "Product updated" : "Product created", "success");
      router.push("/admin/products");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-text-muted">Game</span>
            <select
              className="h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-text outline-none focus:border-primary"
              value={gameId}
              onChange={(e) => handleGameChange(e.target.value)}
              required
            >
              {games.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-text-muted">Category</span>
            <select
              className="h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-text outline-none focus:border-primary"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="" disabled>
                Select a category
              </option>
              {categoriesForGame.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-text-muted">Title</span>
          <input
            className="h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-text outline-none focus:border-primary"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-text-muted">Description</span>
          <textarea
            className="min-h-[100px] w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </label>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-text-muted">Base price</span>
            <input
              type="number"
              step="0.01"
              min="0"
              className="h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-text outline-none focus:border-primary"
              value={basePrice}
              onChange={(e) => setBasePrice(Number(e.target.value))}
              required
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-text-muted">Delivery time</span>
            <input
              className="h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-text outline-none focus:border-primary"
              placeholder="e.g. 24 hours"
              value={deliveryTime}
              onChange={(e) => setDeliveryTime(e.target.value)}
              required
            />
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-text-muted">Images (comma-separated URLs)</span>
          <input
            className="h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-text outline-none focus:border-primary"
            value={imagesText}
            onChange={(e) => setImagesText(e.target.value)}
            placeholder="https://..., https://..."
          />
        </label>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-text-muted">Status</span>
            <select
              className="h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-text outline-none focus:border-primary"
              value={status}
              onChange={(e) => setStatus(e.target.value as ProductStatus)}
            >
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-text-muted">Seller</span>
            <select
              className="h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-text outline-none focus:border-primary"
              value={sellerId}
              onChange={(e) => setSellerId(e.target.value)}
              required
            >
              {sellers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.displayName}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-text">Option groups</h2>
          <Button type="button" variant="secondary" size="sm" onClick={addGroup}>
            <Plus size={15} /> Add option group
          </Button>
        </div>

        {optionGroups.length === 0 && (
          <p className="text-sm text-text-muted">No option groups. Add one if this product has variants.</p>
        )}

        <div className="flex flex-col gap-4">
          {optionGroups.map((group) => (
            <div key={group.key} className="rounded-xl border border-border bg-bg p-4">
              <div className="mb-3 flex flex-wrap items-end gap-3">
                <label className="flex flex-1 min-w-[160px] flex-col gap-1.5">
                  <span className="text-xs font-medium text-text-muted">Group name</span>
                  <input
                    className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary"
                    value={group.name}
                    onChange={(e) => updateGroup(group.key, { name: e.target.value })}
                    required
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-text-muted">Type</span>
                  <select
                    className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary"
                    value={group.type}
                    onChange={(e) => updateGroup(group.key, { type: e.target.value as OptionGroupType })}
                  >
                    <option value="SINGLE_SELECT">Single select</option>
                    <option value="MULTI_SELECT">Multi select</option>
                  </select>
                </label>

                <label className="flex items-center gap-2 pb-2.5">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border"
                    checked={group.required}
                    onChange={(e) => updateGroup(group.key, { required: e.target.checked })}
                  />
                  <span className="text-xs font-medium text-text-muted">Required</span>
                </label>

                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => removeGroup(group.key)}
                  className="mb-0"
                >
                  <Trash2 size={15} />
                </Button>
              </div>

              <div className="flex flex-col gap-2">
                {group.values.map((value) => (
                  <div key={value.key} className="flex items-center gap-2">
                    <input
                      className="h-9 flex-1 rounded-lg border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary"
                      placeholder="Value label"
                      value={value.label}
                      onChange={(e) => updateValue(group.key, value.key, { label: e.target.value })}
                      required
                    />
                    <input
                      type="number"
                      step="0.01"
                      className="h-9 w-32 rounded-lg border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary"
                      placeholder="Price +/-"
                      value={value.priceModifier}
                      onChange={(e) =>
                        updateValue(group.key, value.key, { priceModifier: Number(e.target.value) })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => removeValue(group.key, value.key)}
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-text-muted transition-colors hover:border-danger/30 hover:text-danger"
                      )}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <Button type="button" variant="ghost" size="sm" onClick={() => addValue(group.key)}>
                  <Plus size={14} /> Add value
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" loading={submitting}>
          {product ? "Save changes" : "Create product"}
        </Button>
      </div>
    </form>
  );
}
