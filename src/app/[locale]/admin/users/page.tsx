import { getTranslations, getLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { UserRoleToggle } from "@/components/admin/UserRoleToggle";
import { cn } from "@/lib/utils";

export default async function AdminUsersPage() {
  const [t, locale, session, users] = await Promise.all([
    getTranslations("admin.nav"),
    getLocale(),
    auth(),
    db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        seller: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-text">{t("users")}</h1>

      <div className="flex flex-col gap-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="flex flex-wrap items-center gap-2 font-medium text-text">
                {user.name}
                {user.seller && (
                  <span className="rounded-full border border-accent/30 bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
                    Seller
                  </span>
                )}
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-xs font-medium",
                    user.role === "ADMIN"
                      ? "border-primary/30 bg-primary-soft text-primary"
                      : "border-border text-text-muted"
                  )}
                >
                  {user.role}
                </span>
              </p>
              <p className="mt-1 text-xs text-text-subtle">
                {user.email} · Member since {new Date(user.createdAt).toLocaleDateString(locale)}
              </p>
            </div>
            <UserRoleToggle userId={user.id} role={user.role} isSelf={user.id === session?.user.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
