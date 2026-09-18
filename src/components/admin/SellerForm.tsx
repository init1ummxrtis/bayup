"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Rating } from "@/components/Rating";

interface SellerData {
  id: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  ordersCompleted: number;
  responseTimeMinutes: number;
  rating: number;
}

export function SellerForm({ seller }: { seller: SellerData }) {
  const router = useRouter();
  const { show } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [displayName, setDisplayName] = useState(seller.displayName);
  const [bio, setBio] = useState(seller.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(seller.avatarUrl ?? "");
  const [ordersCompleted, setOrdersCompleted] = useState(seller.ordersCompleted);
  const [responseTimeMinutes, setResponseTimeMinutes] = useState(seller.responseTimeMinutes);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/sellers/${seller.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          bio,
          avatarUrl,
          ordersCompleted: Number(ordersCompleted),
          responseTimeMinutes: Number(responseTimeMinutes),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        show(typeof data?.error === "string" ? data.error : "Failed to save seller", "error");
        return;
      }

      show("Seller updated", "success");
      router.push("/admin/sellers");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div className="flex items-center justify-between rounded-lg border border-border bg-bg px-3 py-2.5">
        <span className="text-sm font-medium text-text-muted">Rating (read-only, computed from reviews)</span>
        <Rating value={seller.rating} />
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-text-muted">Display name</span>
        <input
          className="h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-text outline-none focus:border-primary"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-text-muted">Bio</span>
        <textarea
          className="min-h-[100px] w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-text-muted">Avatar URL (optional)</span>
        <input
          className="h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-text outline-none focus:border-primary"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
        />
      </label>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-text-muted">Orders completed</span>
          <input
            type="number"
            min="0"
            className="h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-text outline-none focus:border-primary"
            value={ordersCompleted}
            onChange={(e) => setOrdersCompleted(Number(e.target.value))}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-text-muted">Response time (minutes)</span>
          <input
            type="number"
            min="0"
            className="h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-text outline-none focus:border-primary"
            value={responseTimeMinutes}
            onChange={(e) => setResponseTimeMinutes(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="flex justify-end gap-3 border-t border-border pt-5">
        <Button type="submit" loading={submitting}>
          Save changes
        </Button>
      </div>
    </form>
  );
}
