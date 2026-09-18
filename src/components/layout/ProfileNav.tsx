import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { User, Package, Heart, Settings } from "lucide-react";

export async function ProfileNav() {
  const t = await getTranslations("nav");

  const items = [
    { href: "/profile", label: t("profile"), icon: User },
    { href: "/profile/orders", label: t("myOrders"), icon: Package },
    { href: "/profile/favorites", label: t("favorites"), icon: Heart },
    { href: "/profile/settings", label: t("settings"), icon: Settings },
  ];

  return (
    <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-border bg-surface p-2 lg:flex-col lg:overflow-visible">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-bg-elevated hover:text-text"
        >
          <item.icon size={17} />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
