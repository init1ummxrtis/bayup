import type { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { ProfileNav } from "@/components/layout/ProfileNav";

export default async function ProfileLayout({ children }: { children: ReactNode }) {
  const [session, locale] = await Promise.all([auth(), getLocale()]);
  if (!session?.user) {
    redirect({ href: { pathname: "/login", query: { callbackUrl: "/profile" } }, locale });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        <ProfileNav />
        <div>{children}</div>
      </div>
    </div>
  );
}
