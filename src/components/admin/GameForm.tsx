"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface CategoryData {
  id: string;
  name: string;
  slug: string;
}

interface GameData {
  id: string;
  name: string;
  slug: string;
  description: string;
  bannerUrl: string | null;
  iconUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  categories?: CategoryData[];
}

interface GameFormProps {
  game?: GameData;
}

export function GameForm({ game }: GameFormProps) {
  const router = useRouter();
  const { show } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState(game?.name ?? "");
  const [slug, setSlug] = useState(game?.slug ?? "");
  const [description, setDescription] = useState(game?.description ?? "");
  const [bannerUrl, setBannerUrl] = useState(game?.bannerUrl ?? "");
  const [iconUrl, setIconUrl] = useState(game?.iconUrl ?? "");
  const [sortOrder, setSortOrder] = useState(game?.sortOrder ?? 0);
  const [isActive, setIsActive] = useState(game?.isActive ?? true);

  const [categories, setCategories] = useState<CategoryData[]>(game?.categories ?? []);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name,
        slug,
        description,
        bannerUrl,
        iconUrl,
        sortOrder: Number(sortOrder),
        isActive,
      };

      const res = await fetch(game ? `/api/admin/games/${game.id}` : "/api/admin/games", {
        method: game ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        show(data?.error ?? "Failed to save game", "error");
        return;
      }

      show(game ? "Game updated" : "Game created", "success");
      router.push("/admin/games");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddCategory() {
    if (!game || !newCategoryName.trim()) return;
    setAddingCategory(true);
    try {
      const res = await fetch(`/api/admin/games/${game.id}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        show(data?.error ?? "Failed to add category", "error");
        return;
      }
      const data = await res.json();
      setCategories((prev) => [...prev, data.category]);
      setNewCategoryName("");
      show("Category added", "success");
    } finally {
      setAddingCategory(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-text-muted">Name</span>
          <input
            className="h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-text outline-none focus:border-primary"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-text-muted">Slug (optional, auto-generated if blank)</span>
          <input
            className="h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-text outline-none focus:border-primary"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="auto-generated-from-name"
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

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-text-muted">Banner URL (optional)</span>
          <input
            className="h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-text outline-none focus:border-primary"
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-text-muted">Icon URL (optional)</span>
          <input
            className="h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-text outline-none focus:border-primary"
            value={iconUrl}
            onChange={(e) => setIconUrl(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-text-muted">Sort order</span>
          <input
            type="number"
            className="h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-text outline-none focus:border-primary"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
          />
        </label>

        <label className="flex items-center gap-2.5">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-border"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <span className="text-sm font-medium text-text-muted">Active</span>
        </label>

        <div className="flex justify-end gap-3 border-t border-border pt-5">
          <Button type="submit" loading={submitting}>
            {game ? "Save changes" : "Create game"}
          </Button>
        </div>
      </form>

      {game && (
        <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <h2 className="mb-4 font-semibold text-text">Categories</h2>
          {categories.length === 0 ? (
            <p className="mb-4 text-sm text-text-muted">No categories yet.</p>
          ) : (
            <ul className="mb-4 flex flex-col gap-2">
              {categories.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text"
                >
                  <span>{c.name}</span>
                  <span className="text-text-subtle">/{c.slug}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <input
              className="h-10 flex-1 rounded-lg border border-border bg-bg px-3 text-sm text-text outline-none focus:border-primary"
              placeholder="New category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <Button type="button" variant="secondary" size="sm" loading={addingCategory} onClick={handleAddCategory}>
              Add category
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
