import type { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const [session, locale] = await Promise.all([auth(), getLocale()]);

  if (!session?.user) {
    redirect({ href: { pathname: "/login", query: { callbackUrl: "/admin" } }, locale });
  }
  if (session!.user.role !== "ADMIN") {
    redirect({ href: "/", locale });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        <AdminNav />
        <div>{children}</div>
      </div>
    </div>
  );
}
