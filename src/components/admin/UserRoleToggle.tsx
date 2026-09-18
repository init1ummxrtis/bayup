"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";

type Role = "USER" | "ADMIN";

export function UserRoleToggle({ userId, role, isSelf }: { userId: string; role: Role; isSelf: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { show } = useToast();

  if (isSelf) {
    return <span className="text-xs text-text-subtle">Current user</span>;
  }

  async function handleToggle() {
    const nextRole: Role = role === "ADMIN" ? "USER" : "ADMIN";
    const confirmMessage =
      nextRole === "ADMIN"
        ? "Grant admin access to this user?"
        : "Remove admin access from this user?";
    if (!window.confirm(confirmMessage)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(typeof data.error === "string" ? data.error : "Failed to update role");
      }
      show("Role updated", "success");
      router.refresh();
    } catch (err) {
      show(err instanceof Error ? err.message : "Failed to update role", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="secondary" size="sm" loading={loading} onClick={handleToggle}>
      {role === "ADMIN" ? "Revoke admin" : "Make admin"}
    </Button>
  );
}
